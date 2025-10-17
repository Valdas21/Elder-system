using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Seniunu_valdymo_sistema.Server.Entities;
using Seniunu_valdymo_sistema.Server.DTO;

namespace Seniunu_valdymo_sistema.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubmissionController : Controller
    {
        private readonly AppDbContext _context;
        public SubmissionController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet("list/{id}")]
        public IActionResult GetSubmissions(int id)
        {
            var submissions = _context.Submissions
                .Where(s => s.FkFormId == id)
                .Include(s => s.Elder)
                .Select(s => new
                {
                    s.Id,
                    s.FillDate,
                    s.FkFormId,
                    s.FkElderId,
                    Elder = new
                    {
                        s.Elder.Course,
                        Name = s.Elder.User.Name,
                        LastName = s.Elder.User.LastName,
                        Email = s.Elder.User.Email
                    }
                })
                .ToList();
            return Ok(submissions);
        }
        [HttpGet("get/{id}")]
        public IActionResult GetSubmissionById(int id)
        {
            var submission = _context.Submissions
                .Include(s => s.Elder)
                .Where(s => s.Id == id)
                .Select(s => new
                {
                    s.Id,
                    s.FkFormId,
                    s.FkElderId,
                    s.FillDate,
                    ElderName = s.Elder.User.Name,
                    ElderLastName = s.Elder.User.LastName,
                    ElderEmail = s.Elder.User.Email,
                    Responses = _context.Responses
                        .Where(r => r.FkSubmissionId == s.Id)
                        .Include(r => r.FormQuestion)
                        .Select(r => new
                        {
                            r.Id,
                            r.FkFormQuestionId,
                            r.Text,
                            QuestionText = r.FormQuestion.Question.Text
                        })
                        .ToList()
                })
                .FirstOrDefault();
            if (submission == null)
            {
                return NotFound("Submission not found.");
            }
            return Ok(submission);
        }
        [HttpPost("create")]
        public IActionResult Create([FromBody] CreateSubmissionRequest request)
        {
            if (request == null || request.FkFormId <= 0 || request.FkElderId <= 0 || request.Responses == null)
                return BadRequest("Invalid submission data.");

            // Validate elder & form
            if (!_context.Elders.Any(e => e.Id == request.FkElderId))
                return BadRequest("Elder does not exist.");

            if (!_context.Forms.Any(f => f.Id == request.FkFormId))
                return BadRequest("Form does not exist.");

            
            var exists = _context.Submissions.Any(s => s.FkFormId == request.FkFormId && s.FkElderId == request.FkElderId);
            if (exists) return Conflict("Submission already exists for this elder and form.");//409

            // Validate that every FormQuestion belongs to this form
            var fqIds = request.Responses.Select(r => r.FkFormQuestionId).Distinct().ToList();
            var validFq = _context.FormQuestions
                .Where(fq => fq.FkFormId == request.FkFormId && fqIds.Contains(fq.Id))
                .Select(fq => fq.Id)
                .ToHashSet();

            if (validFq.Count != fqIds.Count)
                return UnprocessableEntity("One or more FormQuestionIds do not belong to the specified form.");//422

            using var tx = _context.Database.BeginTransaction();
            try
            {
                var submission = new Submission
                {
                    FkFormId = request.FkFormId,
                    FkElderId = request.FkElderId,
                    FillDate = DateTime.UtcNow
                };
                _context.Submissions.Add(submission);
                _context.SaveChanges(); // get submission.Id

                var responses = request.Responses.Select(r => new Response
                {
                    FkSubmissionId = submission.Id,
                    FkFormQuestionId = r.FkFormQuestionId,
                    Text = r.Text
                });

                _context.Responses.AddRange(responses);
                _context.SaveChanges();

                tx.Commit();

                return CreatedAtAction(nameof(GetSubmissionById), new { id = submission.Id }, new { submission.Id });
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }
        [HttpPut("update/{id:int}")]
        public IActionResult Update(int id, [FromBody] UpdateSubmissionRequest request)
        {
            var submission = _context.Submissions.FirstOrDefault(s => s.Id == id);
            if (submission is null) return NotFound("Submission not found.");

            

            // Validate that every provided FormQuestion belongs to this submission's Form
            if (request.Responses is not null && request.Responses.Count > 0)
            {
                var fqIds = request.Responses.Select(r => r.FkFormQuestionId).Distinct().ToList();
                var validFq = _context.FormQuestions
                    .Where(fq => fq.FkFormId == submission.FkFormId && fqIds.Contains(fq.Id))
                    .Select(fq => fq.Id).ToHashSet();

                if (validFq.Count != fqIds.Count)
                    return UnprocessableEntity("One or more FormQuestionIds do not belong to this form.");//422
            }

            using var tx = _context.Database.BeginTransaction();
            try
            {

                // Replace/upsert responses
                if (request.Responses is not null)
                {
                    var incoming = request.Responses.ToDictionary(r => r.FkFormQuestionId);

                    // Load existing responses for this submission
                    var existing = _context.Responses
                        .Where(r => r.FkSubmissionId == submission.Id)
                        .ToList();

                    var existingMap = existing.ToDictionary(r => r.FkFormQuestionId);

                    // Update existing or add new
                    foreach (var kv in incoming)
                    {
                        var fqId = kv.Key;
                        var dto = kv.Value;

                        if (existingMap.TryGetValue(fqId, out var found))
                        {
                            found.Text = dto.Text;
                        }
                        else
                        {
                            _context.Responses.Add(new Response
                            {
                                FkSubmissionId = submission.Id,
                                FkFormQuestionId = fqId,
                                Text = dto.Text
                            });
                        }
                    }

                    // Remove responses that are no longer present
                    var toRemove = existing.Where(r => !incoming.ContainsKey(r.FkFormQuestionId)).ToList();
                    if (toRemove.Count > 0) _context.Responses.RemoveRange(toRemove);
                }

                _context.SaveChanges();
                tx.Commit();
                return NoContent();
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }

        /// <summary>
        /// Delete a submission (and its responses).
        /// </summary>
        [HttpDelete("delete/{id:int}")]
        public IActionResult Delete(int id)
        {
            var submission = _context.Submissions.FirstOrDefault(s => s.Id == id);
            if (submission is null) return NotFound("Submission not found.");

            using var tx = _context.Database.BeginTransaction();
            try
            {
                // If you don't have FK cascade in DB/EF, remove responses manually
                var responses = _context.Responses
                    .Where(r => r.FkSubmissionId == id)
                    .ToList();

                if (responses.Count > 0)
                    _context.Responses.RemoveRange(responses);

                _context.Submissions.Remove(submission);
                _context.SaveChanges();

                tx.Commit();
                return Ok("Submission deleted successfully.");
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }
    }

}

