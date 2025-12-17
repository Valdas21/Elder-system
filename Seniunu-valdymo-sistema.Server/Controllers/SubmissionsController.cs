using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Seniunu_valdymo_sistema.Server.Entities;
using Seniunu_valdymo_sistema.Server.DTO;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Seniunu_valdymo_sistema.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SubmissionsController : Controller
    {
        private readonly AppDbContext _context;
        public SubmissionsController(AppDbContext context)
        {
            _context = context;
        }
        private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        private bool IsAdmin() => User.IsInRole("admin");

        [HttpGet("{id}/Responses")]
        [Authorize(Roles = "elder,admin")]
        public async Task<ActionResult<IEnumerable<Response>>> GetSubmissionResponses(int id)
        {
            var submission = await _context.Submissions
        .FirstOrDefaultAsync(s => s.Id == id);

            if (submission == null)
                return NotFound("Submission not found.");

            if (!IsAdmin() && submission.FkElderId != GetUserId())
                return Forbid();

            var responses = await _context.Responses
                .Where(r => r.FkSubmissionId == id)
                .Include(r => r.FormQuestion)
                .ThenInclude(fq => fq.Question)
                .ToListAsync();

            if (responses.Count == 0)
                return NotFound("No responses found.");

            return Ok(responses);
        }
        [HttpGet]
        [Authorize(Roles ="admin")]
        public async Task<ActionResult<IEnumerable<Submission>>> GetSubmissions()
        {
            var submissions = await _context.Submissions.Include(r=> r.Responses).ToListAsync();
            if(submissions.Count == 0)
            {
                return NotFound("No submissions");
            }
            return Ok(submissions);
        }
        [HttpGet("{id}")]
        [Authorize(Roles = "admin,elder")]
        public async Task<ActionResult> GetSubmission(int id)
        {
            var submission = await _context.Submissions.FindAsync(id);
            if (submission == null) return NotFound();

            if (!IsAdmin() && submission.FkElderId != GetUserId())
                return Forbid();

            return Ok(submission);
        }

        [HttpPost]
        [Authorize(Roles = "elder")]
        public async Task<ActionResult<Submission>> CreateSubmission(CreateSubmissionRequest request)
        {
            var elderId = GetUserId();
            if (request == null)
            {
                return BadRequest("Invalid submission data.");
            }
            bool anySubmission = await _context.Submissions.Where(f => f.FkElderId == elderId && f.FkFormId == request.FkFormId).AnyAsync();
            if (anySubmission)
            {
                return BadRequest("Form already filtered by this elder");
            }
            var submission = new Submission
            {
                FillDate = DateTime.UtcNow,
                FkFormId = request.FkFormId,
                FkElderId = elderId
            };
            _context.Submissions.Add(submission);
            await _context.SaveChangesAsync();
            if (request.Responses != null && request.Responses.Count > 0)
            {
                foreach (var resp in request.Responses)
                {
                    var response = new Response
                    {
                        FkSubmissionId = submission.Id,
                        FkFormQuestionId = resp.FkFormQuestionId,
                        Text = resp.Text
                    };
                    _context.Responses.Add(response);
                }
            }
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSubmission), new { id = submission.Id }, submission);

        }
        [HttpPut("{id}")]
        [Authorize(Roles = "elder")]
        public async Task<IActionResult> PutSubmission(int id, UpdateSubmissionRequest request)
        {
            var submission = await _context.Submissions.FindAsync(id);
            if (submission is null) return NotFound("Submission not found.");
            if (submission.FkElderId != GetUserId())
                return Forbid();
            var isFormNotActive = !_context.Forms.Any(f => f.Id == submission.FkFormId && f.Active);
            if (isFormNotActive)
                return BadRequest("Cannot update submission for an inactive form.");

            // Validate that every provided FormQuestion belongs to this submission's Form
            if (request.Responses is not null && request.Responses.Count > 0)
            {
                var fqIds = request.Responses.Select(r => r.FkFormQuestionId).Distinct().ToList();
                var validFq = _context.FormQuestions
                    .Where(fq => fq.FkFormId == submission.FkFormId && fqIds.Contains(fq.Id))
                    .Select(fq => fq.Id).ToHashSet();

                if (validFq.Count != fqIds.Count)
                    return UnprocessableEntity("One or more FormQuestionIds do not belong to this form.");//422

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

                await _context.SaveChangesAsync();
            }
            return Ok("Updated submision successfuly");
        }

        /// <summary>
        /// Delete a submission (and its responses).
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "elder")]
        public async Task<IActionResult> DeleteSubmission(int id)
        {
            var submission = _context.Submissions.FirstOrDefault(s => s.Id == id);

            if (submission is null) return NotFound("Submission not found.");
            if (submission.FkElderId != GetUserId())
                return Forbid();
            // If you don't have FK cascade in DB/EF, remove responses manually
            var responses = _context.Responses
                .Where(r => r.FkSubmissionId == id)
                .ToList();

            if (responses.Count > 0)
                _context.Responses.RemoveRange(responses);

            _context.Submissions.Remove(submission);
            await _context.SaveChangesAsync();


            return Ok("Submission deleted successfully.");
        }

        [HttpGet("ByFormAndElder")]
        [Authorize(Roles = "admin,elder")]
        public async Task<ActionResult<IEnumerable<Submission>>> GetSubmissionsByFormAndElder([FromQuery] int formId, [FromQuery] int elderId)
        {
            if (!IsAdmin() && elderId != GetUserId())
                return Forbid();

            IQueryable<Submission> query = _context.Submissions
                .Include(s => s.Responses)
                .Where(s => s.FkFormId == formId && s.FkElderId == elderId);

            var submissions = await query
                .OrderByDescending(s => s.FillDate)
                .ToListAsync();

            if (submissions.Count == 0)
                return NotFound("No submissions found for the specified filter.");

            return Ok(submissions);
        }
        [HttpGet("ByElder")]
        [Authorize(Roles = "admin,elder")]
        public async Task<ActionResult<IEnumerable<Submission>>> GetSubmissionsByElder([FromQuery] int elderId)
        {
            // Elders can only request their own submissions
            if (!IsAdmin() && elderId != GetUserId())
                return Forbid();

            IQueryable<Submission> query = _context.Submissions
                .Include(s => s.Responses)
                .Where(s => s.FkElderId == elderId);

            var submissions = await query
                .OrderByDescending(s => s.FillDate)
                .ToListAsync();

            if (submissions.Count == 0)
                return NotFound("No submissions found for the specified filter.");

            return Ok(submissions);
        }
    }
}

