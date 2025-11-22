using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using Seniunu_valdymo_sistema.Server.DTO;
using Seniunu_valdymo_sistema.Server.Entities;

namespace Seniunu_valdymo_sistema.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FormsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public FormsController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Form>>> GetForms()
        {
            var forms = await _context.Forms.ToListAsync();
            if (forms == null || forms.Count == 0)
                return NotFound("No forms found.");
            return Ok(forms);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Form>> GetFormById(int id)
        {
            //var form = await _context.Forms.Include(f => f.FormQuestions).ThenInclude(fq => fq.Question)
            //    .FirstOrDefaultAsync(f => f.Id == id);
            var form = await _context.Forms.SingleOrDefaultAsync(f => f.Id == id);
            if (form == null)
            {
                return NotFound("Form not found.");
            }
            return Ok(form);
        }
        [HttpGet("{id}/Questions")]
        public async Task<ActionResult<IEnumerable<Question>>> GetFormQuestions(int id)
        {
            var questions = await _context.FormQuestions.Where(fq => fq.FkFormId == id).Select(q => q.Question.Text).ToListAsync();
            if (questions == null || questions.Count == 0)
                return NotFound("No questions found for the specified form.");
            return Ok(questions);
        }
        [HttpGet("{id}/Submissions")]
        public async Task<ActionResult<IEnumerable<Submission>>> GetSubmissionsByFormId(int id)
        {
            var submission = await _context.Submissions.Where(s => s.FkFormId == id).ToListAsync();
            if(submission == null || submission.Count == 0)
                return NotFound("No submissions found for the specified form.");
            return Ok(submission);
        }
        [HttpPost]
        public async Task<ActionResult<Form>> CreateForm(CreateFormRequest request)
        {
            if (request == null || request.FkAdminId <= 0)
                return BadRequest("Invalid form data.");

            if (request.Course <= 0 || request.Course > 4)
                return BadRequest("Invalid selected Course");

            var adminExists = _context.Admins.Any(a => a.Id == request.FkAdminId);
            if (!adminExists)
                return BadRequest("Admin does not exist.");

            var form = new Form { Active = request.Active, Course = request.Course, FkAdminId = request.FkAdminId, CreateDate = request.CreateDate };
            _context.Forms.Add(form);
            if(request.QuestionIds?.Count > 0)
            {
                var existingQuestions = _context.Questions
                    .Where(q => request.QuestionIds.Contains(q.Id))
                    .Select(q => q.Id)
                    .ToHashSet();

                if(existingQuestions.Count != request.QuestionIds.Count)
                    return BadRequest("One or more questions do not exist.");

                foreach(var id in request.QuestionIds)
                {
                    form.FormQuestions.Add(new FormQuestion { FkFormId = form.Id, FkQuestionId = id });
                }
            }
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetFormById", new { id = form.Id }, form);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> PutForm(int id, CreateFormRequest request)
        {
            var form = _context.Forms.FirstOrDefault(f => f.Id == id);
            if (form == null) return NotFound("Form not found.");

                // Update scalar fields if provided
            if(request.Course <= 0 || request.Course > 4)
                return BadRequest("Invalid selected Course");

            if (form.Active)
                return BadRequest("Active forms cannot be edited");

                form.Active = request.Active;
                form.Course = request.Course;
                form.FkAdminId = request.FkAdminId;
                form.CreateDate = request.CreateDate;

                // Sync questions if provided: replace current links with provided set
                if (request.QuestionIds != null || request.QuestionIds.Count > 0)
                {
                    var newIds = request.QuestionIds.Distinct().ToHashSet();

                    // validate all questions exist
                    var existingQ = _context.Questions
                        .Where(q => newIds.Contains(q.Id))
                        .Select(q => q.Id)
                        .ToHashSet();

                    if (existingQ.Count != newIds.Count)
                        return BadRequest("One or more Questions do not exist.");

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
            await _context.SaveChangesAsync();

            return Ok("Form and all related data updated successfully.");
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteForm(int id)
        {
                var form = await _context.Forms.FindAsync(id);
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
                await _context.SaveChangesAsync();

                return Ok("Form and all related data deleted successfully.");
            
            
        }

    }
}
