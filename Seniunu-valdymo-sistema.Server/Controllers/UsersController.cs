using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Seniunu_valdymo_sistema.Server.Entities;
using Seniunu_valdymo_sistema.Server.DTO;
using Seniunu_valdymo_sistema.Server.Infrastructure;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Azure.Core;

namespace Seniunu_valdymo_sistema.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : Controller
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public UsersController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
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

            string accessToken = tokenProvider.Create(resp);

            var refreshToken = RefreshTokenRegenerator.Create();
            var refreshHash = RefreshTokenRegenerator.Hash(refreshToken);

            var refreshExpiryDays = _config.GetValue<int>("Jwt:RefreshExpirationInDays", 14);

            var activeTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == user.Id && rt.RevokedAtUtc == null && rt.ExpiresAtUtc > DateTime.UtcNow)
            .ToListAsync();

            foreach (var t in activeTokens)
                t.RevokedAtUtc = DateTime.UtcNow;


            _context.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.Id,
                TokenHash = refreshHash,
                ExpiresAtUtc = DateTime.UtcNow.AddDays(refreshExpiryDays),
            });

            await _context.SaveChangesAsync();

            return Ok(new AuthTokensResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            });
        }
        [HttpGet("dbtest")]
        public IActionResult DbTest()
        {
            try
            {
                var cs = _config.GetConnectionString("DefaultConnection");

                using (var conn = new MySqlConnection(cs))
                {
                    conn.Open();
                    return Ok("Connection OK: " + conn.ServerVersion);
                }
            }
            catch (Exception e)
            {
                return StatusCode(500, e.ToString());
            }
        }
        [HttpPost("refresh")]
        public async Task<ActionResult<AuthTokensResponse>> Refresh(RefreshRequest request, [FromServices] TokenProvider tokenProvider)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.RefreshToken))
                return BadRequest("Missing refresh token.");

            var incomingHash = RefreshTokenRegenerator.Hash(request.RefreshToken);

            var stored = await _context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.TokenHash == incomingHash);

            if (stored == null || (stored.RevokedAtUtc != null) || DateTime.UtcNow >= stored.ExpiresAtUtc)
                return Unauthorized("Invalid or expired refresh token.");

            // Load role/course again
            var user = stored.User;

            string role =
                _context.Admins.Any(a => a.Id == user.Id) ? "admin" :
                _context.Elders.Any(e => e.Id == user.Id) ? "elder" :
                "user";

            int course = 0;
            if (role == "elder")
                course = await _context.Elders.Where(e => e.Id == user.Id).Select(e => e.Course).FirstOrDefaultAsync();

            var access = tokenProvider.Create(new LoginResponse
            {
                UserId = user.Id,
                Email = user.Email,
                FirstName = user.Name,
                LastName = user.LastName,
                Role = role,
                Course = course
            });

            // Rotate refresh token
            var newRefresh = RefreshTokenRegenerator.Create();
            var newHash = RefreshTokenRegenerator.Hash(newRefresh);

            stored.RevokedAtUtc = DateTime.UtcNow;
            stored.ReplacedByTokenHash = newHash;

            _context.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.Id,
                TokenHash = newHash,
                ExpiresAtUtc = DateTime.UtcNow.AddDays(_config.GetValue<int>("Jwt:RefreshExpirationInDays", 14)),
            });

            await _context.SaveChangesAsync();

            return Ok(new AuthTokensResponse
            {
                AccessToken = access,
                RefreshToken = newRefresh
            });
        }
        [HttpPost("logout")]
        public async Task<IActionResult> Logout(RefreshRequest request)
        {
            var hash = RefreshTokenRegenerator.Hash(request.RefreshToken);

            var stored = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == hash);
            if (stored != null)
            {
                stored.RevokedAtUtc = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Ok();
        }

    }
}
