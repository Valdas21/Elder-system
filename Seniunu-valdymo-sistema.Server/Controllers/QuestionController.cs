using Microsoft.AspNetCore.Mvc;

namespace Seniunu_valdymo_sistema.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionController : Controller
    {
        private readonly AppDbContext _context;
        public QuestionController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("list")]
        public IActionResult GetQuestions()
        {
            var questions = _context.Questions.ToList();
            return Ok(questions);
        }
        [HttpPost("create")]
        public IActionResult Create([FromBody] string text)
        {
            if (string.IsNullOrEmpty(text))
                return BadRequest("Question text cannot be empty.");

            var question = new Entities.Question { Text = text };
            _context.Questions.Add(question);
            _context.SaveChanges();

            return Ok(question);
        }
        [HttpDelete("delete")]
        public IActionResult Delete([FromBody] int id)
        {
            var question = _context.Questions.Find(id);
            if (question == null)
                return NotFound("Question not found.");

            // Check if the question is associated with any form
            var isAssociated = _context.FormQuestions.Any(fq => fq.FkQuestionId == id);
            if (isAssociated)
                return BadRequest("Cannot delete question as it is associated with a form.");

            _context.Questions.Remove(question);
            _context.SaveChanges();

            return Ok("Question deleted successfully.");
        }
        [HttpGet("get/{id}")]
        public IActionResult GetQuestionById(int id)
        {
            var question = _context.Questions.Find(id);
            if (question == null)
            {
                return NotFound("Question not found.");
            }
            return Ok(question);
        }
        [HttpPut("update/{id}")]
        public IActionResult UpdateQuestion(int id, [FromBody] string newText)
        {
            if (string.IsNullOrEmpty(newText))
                return BadRequest("Question text cannot be empty.");

            var question = _context.Questions.Find(id);
            if (question == null)
                return NotFound("Question not found.");

            question.Text = newText;
            _context.SaveChanges();

            return Ok(question);
        }
    }
}
