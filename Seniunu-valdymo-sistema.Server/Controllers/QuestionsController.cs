using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Seniunu_valdymo_sistema.Server.Entities;

namespace Seniunu_valdymo_sistema.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QuestionsController : Controller
    {
        private readonly AppDbContext _context;
        public QuestionsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<IEnumerable<Question>>> GetQuestions()
        {
            var questions = await _context.Questions.ToListAsync();
            return Ok(questions);
        }
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> CreateQuestion(Question question)
        {
            if (string.IsNullOrEmpty(question.Text))
                return BadRequest("Question text cannot be empty.");

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            return CreatedAtAction("CreateQuestion", question);
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> DeleteQuestion(int id)
        {
            var question = _context.Questions.Find(id);
            if (question == null)
                return NotFound("Question not found.");

            // Check if the question is associated with any form
            var isAssociated = _context.FormQuestions.Any(fq => fq.FkQuestionId == id);
            if (isAssociated)
                return BadRequest("Cannot delete question as it is associated with a form.");

            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();

            return Ok("Question deleted successfully.");
        }
        [HttpGet("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Question>> GetQuestionById(int id)
        {
            var question = await _context.Questions.SingleOrDefaultAsync(q => q.Id == id);
            if (question == null)
            {
                return NotFound("Question not found.");
            }
            return Ok(question);
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> PutQuestion(int id, string newText)
        {
            if (string.IsNullOrEmpty(newText))
                return BadRequest("Question text cannot be empty.");
            var isFormActive = _context.FormQuestions.Include(fq => fq.Form).Where(fq => fq.FkQuestionId == id).Any(fq => fq.Form.Active);
            if (isFormActive)
                return BadRequest("Cannot modify question as it is associated with an active form.");

            var question = _context.Questions.Find(id);

            if (question == null)
                return NotFound("Question not found.");

            question.Text = newText;
            await _context.SaveChangesAsync();
            
            if(true)
                return BadRequest("This feature is not supported.");

            return Ok(question);
        }
    }
}
