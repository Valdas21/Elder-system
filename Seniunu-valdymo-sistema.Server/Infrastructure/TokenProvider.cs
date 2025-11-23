using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Seniunu_valdymo_sistema.Server.DTO;
using System.Configuration;
using System.Security.Claims;
using System.Text;

namespace Seniunu_valdymo_sistema.Server.Infrastructure
{
    public class TokenProvider(IConfiguration configuration)
    {
        public string Create(LoginResponse user)
        {
            string secretKey = configuration["Jwt:Secret"]; 
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)); 
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256); 
            var tokenDescriptor = new SecurityTokenDescriptor 
            { Subject = new ClaimsIdentity([
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()), 
                new Claim(JwtRegisteredClaimNames.Email, user.Email), 
                new Claim(ClaimTypes.Role, user.Role), 
                new Claim("firstName", user.FirstName), 
                new Claim("lastName", user.LastName)]), 
                Expires = DateTime.UtcNow.AddMinutes(configuration.GetValue<int>("Jwt:ExpirationInMinutes")), 
                SigningCredentials = credentials, 
                Issuer = configuration["Jwt:Issuer"], 
                Audience = configuration["Jwt:Audience"] }; 
            
            var tokenHandler = new JsonWebTokenHandler(); 
            var token = tokenHandler.CreateToken(tokenDescriptor); 
            return token;
        }
    }
}
