using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Seniunu_valdymo_sistema.Server.Entities;
using Seniunu_valdymo_sistema.Server.DTO;

namespace Seniunu_valdymo_sistema.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.LastName) || string.IsNullOrEmpty(request.Password) || string.IsNullOrEmpty(request.Email))
            {
                return BadRequest("Invalid user data.");
            }

            // Check if the username already exists
            var existingUser = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            if (existingUser != null)
            {
                return Conflict("Email already exists.");
            }

            
            User user = new User(request.Name, request.LastName, request.Password, request.Email);
            _context.Users.Add(user);
            _context.SaveChanges();

            if (request.Role.ToLower() == "admin")
            {
                var admin = new Admin { Id = user.Id };
                _context.Admins.Add(admin);
                _context.SaveChanges();
            }
            else if (request.Role.ToLower() == "elder")
            {
                if (request.Course == null)
                    return BadRequest("Course must be provided for elders.");

                var elder = new Elder { Id = user.Id, Course = request.Course.Value };
                _context.Elders.Add(elder);
                _context.SaveChanges();
            }
            else
            {
                return BadRequest("Invalid role. Must be 'admin' or 'elder'.");
            }

            return Ok("User registered successfully.");
        }
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest("Invalid login data.");

            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email && u.Password == request.Password);
            if (user == null)
                return Unauthorized("Invalid email or password.");

            
            string role =
                _context.Admins.Any(a => a.Id == user.Id) ? "admin" :
                _context.Elders.Any(e => e.Id == user.Id) ? "elder" :
                "user";

            var resp = new LoginResponse
            {
                UserId = user.Id,
                Email = user.Email,
                FirstName = user.Name,
                LastName = user.LastName,
                Role = role
            };

            return Ok(resp);
        }

    }
}
