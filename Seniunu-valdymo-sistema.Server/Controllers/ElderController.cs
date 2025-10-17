using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Seniunu_valdymo_sistema.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ElderController : Controller
    {
        private readonly AppDbContext _context;
        public ElderController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet("list")]
        public IActionResult GetElders()
        {
            var elders = _context.Elders.Include(e => e.User)
                .Select(e => new
                {
                    e.Id,
                    e.Course,
                    e.User.Name,
                    e.User.LastName,
                    e.User.Email
                }).ToList();
            return Ok(elders);
        }
        [HttpGet("get/{id}")]
        public IActionResult GetElderById(int id)
        {
            var elder = _context.Elders.Include(e => e.User)
                .Where(e => e.Id == id)
                .Select(e => new
            {
                e.Id,
                e.Course,
                e.User.Name,
                e.User.LastName,
                e.User.Email
            });
            if (elder == null)
            {
                return NotFound("Elder not found.");
            }
            return Ok(elder);
        }
        [HttpDelete("delete/{id}")]
        public IActionResult DeleteElder(int id)
        {
            var elder = _context.Elders.Find(id);
            if (elder == null)
            {
                return NotFound("Elder not found.");
            }
            var user = _context.Users.Find(id);
            if (user != null)
            {
                _context.Users.Remove(user);
            }
            _context.Elders.Remove(elder);
            _context.SaveChanges();
            return Ok("Elder deleted successfully.");
        }
    }
}
