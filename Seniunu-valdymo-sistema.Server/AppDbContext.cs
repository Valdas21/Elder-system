using Microsoft.EntityFrameworkCore;
using Seniunu_valdymo_sistema.Server.Entities;


namespace Seniunu_valdymo_sistema.Server
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Elder> Elders { get; set; }
        public DbSet<Form> Forms { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Response> Responses { get; set; }
        public DbSet<FormQuestion> FormQuestions { get; set; }
        public DbSet<Submission> Submissions { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; } 

    }
}
