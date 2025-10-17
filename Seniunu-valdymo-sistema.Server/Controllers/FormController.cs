using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Seniunu_valdymo_sistema.Server.DTO;
using Seniunu_valdymo_sistema.Server.Entities;

namespace Seniunu_valdymo_sistema.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FormController : Controller
    {
        private readonly AppDbContext _context;
        public FormController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet("list")]
        public IActionResult GetForms()
        {
            var forms = _context.Forms.ToList();
            if (forms == null || forms.Count == 0)
                return NotFound("No forms found.");
            return Ok(forms);
        }
        [HttpGet("get/{id}")]
        public IActionResult GetFormById(int id)
        {
            var form = _context.Forms.Where(f => f.Id == id)
                .Select(f => new { 
                    f.Id,
                    f.CreateDate,
                    f.Active,
                    f.Course,
                    f.FkAdminId,
                    Questions = _context.FormQuestions
                        .Where(fq => fq.FkFormId == f.Id)
                        .Include(fq => fq.Question)
                        .Select(fq => new
                        {
                            fq.Question.Id,
                            fq.Question.Text
                        })
                        .ToList()
                })
                .FirstOrDefault();
            if (form == null)
            {
                return NotFound("Form not found.");
            }



            return Ok(form);
        }
        [HttpPost("create")]
        public IActionResult Create([FromBody] CreateFormRequest request)
        {
            if (request == null || request.FkAdminId <= 0)
                return BadRequest("Invalid form data.");

            // Ensure admin exists
            var adminExists = _context.Admins.Any(a => a.Id == request.FkAdminId);
            if (!adminExists)
                return BadRequest("Admin does not exist.");

            

            // Create the form
            var form = new Form
            {
                CreateDate = DateTime.UtcNow,
                Active = request.Active,
                Course = request.Course,   
                FkAdminId = request.FkAdminId
            };

            using var tx = _context.Database.BeginTransaction();
            try
            {
                _context.Forms.Add(form);
                _context.SaveChanges(); // get Form.Id

                // Optionally attach questions by creating FormQuestion rows
                if (request.QuestionIds != null && request.QuestionIds.Count > 0)
                {
                    // validate questions exist
                    var existingQ = _context.Questions
                        .Where(q => request.QuestionIds.Contains(q.Id))
                        .Select(q => q.Id)
                        .ToHashSet();

                    if (existingQ.Count != request.QuestionIds.Count)
                        return BadRequest("One or more QuestionIds do not exist.");

                    var links = request.QuestionIds.Select(qId => new FormQuestion
                    {
                        FkFormId = form.Id,
                        FkQuestionId = qId
                    });

                    _context.FormQuestions.AddRange(links);
                    _context.SaveChanges();
                }

                tx.Commit();

                // Return 201 with Location header
                return CreatedAtAction(nameof(GetFormById), new { id = form.Id }, new
                {
                    form.Id,
                    form.CreateDate,
                    form.Active,
                    form.Course,
                    form.FkAdminId
                });
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }
        [HttpPut("edit/{id:int}")]
        public IActionResult Edit(int id, [FromBody] CreateFormRequest request)
        {
            var form = _context.Forms.FirstOrDefault(f => f.Id == id);
            if (form == null) return NotFound("Form not found.");


            using var tx = _context.Database.BeginTransaction();
            try
            {
                // Update scalar fields if provided
                form.Active = request.Active;
                form.Course = request.Course;
                form.FkAdminId = request.FkAdminId;
                form.CreateDate = request.CreateDate;

                _context.SaveChanges();

                // Sync questions if provided: replace current links with provided set
                if (request.QuestionIds != null)
                {
                    var newIds = request.QuestionIds.Distinct().ToHashSet();

                    // validate all questions exist
                    var existingQ = _context.Questions
                        .Where(q => newIds.Contains(q.Id))
                        .Select(q => q.Id)
                        .ToHashSet();

                    if (existingQ.Count != newIds.Count)
                        return BadRequest("One or more QuestionIds do not exist.");

                    // load current links
                    var currentLinks = _context.FormQuestions
                        .Where(fq => fq.FkFormId == form.Id)
                        .ToList();

                    var currentIds = currentLinks.Select(fq => fq.FkQuestionId).ToHashSet();

                    // determine adds and deletes
                    var toAdd = newIds.Except(currentIds)
                        .Select(qId => new FormQuestion { FkFormId = form.Id, FkQuestionId = qId })
                        .ToList();

                    var toRemove = currentLinks.Where(fq => !newIds.Contains(fq.FkQuestionId)).ToList();

                    if (toRemove.Count > 0) _context.FormQuestions.RemoveRange(toRemove);
                    if (toAdd.Count > 0) _context.FormQuestions.AddRange(toAdd);

                    _context.SaveChanges();
                }

                tx.Commit();

                // return updated snapshot
                var result = new
                {
                    form.Id,
                    form.CreateDate,
                    form.Active,
                    form.Course,
                    form.FkAdminId,
                    QuestionIds = _context.FormQuestions
                        .Where(fq => fq.FkFormId == form.Id)
                        .Select(fq => fq.FkQuestionId)
                        .ToList()
                };

                return Ok(result);
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }
        [HttpDelete("delete/{id:int}")]
        public IActionResult DeleteForm(int id)
        {
            using var tx = _context.Database.BeginTransaction();
            try
            {
                var form = _context.Forms.FirstOrDefault(f => f.Id == id);
                if (form == null)
                {
                    return NotFound("Form not found.");
                }

                // Delete related FormQuestions
                var formQuestions = _context.FormQuestions.Where(fq => fq.FkFormId == id).ToList();
                if (formQuestions.Count > 0)
                    _context.FormQuestions.RemoveRange(formQuestions);

                // Delete related Submissions (and Responses)
                var submissions = _context.Submissions.Where(s => s.FkFormId == id).ToList();
                if (submissions.Count > 0)
                {
                    var submissionIds = submissions.Select(s => s.Id).ToList();

                    var responses = _context.Responses.Where(r => submissionIds.Contains(r.FkSubmissionId)).ToList();
                    if (responses.Count > 0)
                        _context.Responses.RemoveRange(responses);

                    _context.Submissions.RemoveRange(submissions);
                }

                // Delete the form itself
                _context.Forms.Remove(form);
                _context.SaveChanges();

                tx.Commit();
                return Ok("Form and all related data deleted successfully.");
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }

    }
}
