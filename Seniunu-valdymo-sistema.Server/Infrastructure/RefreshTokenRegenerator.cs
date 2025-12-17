using System.Security.Cryptography;
using System.Text;

namespace Seniunu_valdymo_sistema.Server.Infrastructure
{
    public class RefreshTokenRegenerator
    {
        public static string Create()
        {
            var bytes = RandomNumberGenerator.GetBytes(64);
            return Convert.ToBase64String(bytes);
        }

        public static string Hash(string token)
        {
            using var sha = SHA256.Create();
            var hash = sha.ComputeHash(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(hash);
        }
    }
}
