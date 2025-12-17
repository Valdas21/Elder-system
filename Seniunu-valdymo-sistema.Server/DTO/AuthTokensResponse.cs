namespace Seniunu_valdymo_sistema.Server.DTO
{
    public class AuthTokensResponse
    {
        public string AccessToken { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
    }
}
