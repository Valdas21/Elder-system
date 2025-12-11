namespace Seniunu_valdymo_sistema.Server.DTO
{
    public class LoginResponse
    {
        public int UserId { get; set; }
        public string Email { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Role { get; set; } = ""; // "admin" | "elder" | "user"
        public int Course { get; set; } // Only for elders
    }
}
