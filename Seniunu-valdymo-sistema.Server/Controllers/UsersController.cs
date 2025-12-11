using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Seniunu_valdymo_sistema.Server.Entities;
using Seniunu_valdymo_sistema.Server.DTO;
using Seniunu_valdymo_sistema.Server.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Seniunu_valdymo_sistema.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : Controller
    {
        private readonly AppDbContext _context;


        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(RegisterRequest request)
        {
            if (request == null ||
                string.IsNullOrEmpty(request.Name) ||
                string.IsNullOrEmpty(request.LastName) ||
                string.IsNullOrEmpty(request.Password) ||
                string.IsNullOrEmpty(request.Email) ||
                string.IsNullOrEmpty(request.Role))
            {
                return BadRequest("Invalid user data.");
            }

            // Check if the username already exists
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
            {
                return Conflict("Email already exists.");
            }


            User user = new User(request.Name, request.LastName, request.Password, request.Email);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            if (request.Role.ToLower() == "admin")
            {
                var admin = new Admin { Id = user.Id };
                _context.Admins.Add(admin);
                
            }
            else if (request.Role.ToLower() == "elder")
            {
                if (request.Course == null)
                    return BadRequest("Course must be provided for elders.");

                var elder = new Elder { Id = user.Id, Course = request.Course.Value };
                _context.Elders.Add(elder);
                
            }
            else
            {
                return BadRequest("Invalid role. Must be 'admin' or 'elder'.");
            }
            await _context.SaveChangesAsync();
            return Created(string.Empty, user);
        }
        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(LoginRequest request, [FromServices] TokenProvider tokenProvider)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest("Invalid login data.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.Password == request.Password);
            if (user == null)
                return Unauthorized("Invalid email or password.");


            string role =
                _context.Admins.Any(a => a.Id == user.Id) ? "admin" :
                _context.Elders.Any(e => e.Id == user.Id) ? "elder" :
                "user";
            int course = 0;
            if (role == "elder")
            {
                course = await _context.Elders.Where(e => e.Id == user.Id).Select(e => e.Course).FirstOrDefaultAsync();
            }

            var resp = new LoginResponse
            {
                UserId = user.Id,
                Email = user.Email,
                FirstName = user.Name,
                LastName = user.LastName,
                Role = role,
                Course = course
            };

            string token = tokenProvider.Create(resp);

            return Ok(token);
        }

    }
}
