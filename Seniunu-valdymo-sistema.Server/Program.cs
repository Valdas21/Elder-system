using Microsoft.EntityFrameworkCore;
using Seniunu_valdymo_sistema.Server;
using Microsoft.Extensions.Configuration;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// 1) Register services BEFORE Build()
builder.Services.AddControllers().AddJsonOptions(x => x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register AppDbContext (Pomelo MySQL/MariaDB)
builder.Services.AddDbContext<AppDbContext>(options =>
{
    // Easiest: auto-detect server version from connection string
    var cs = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseMySql(cs, ServerVersion.AutoDetect(cs));
    options.EnableSensitiveDataLogging()
           .LogTo(Console.WriteLine, LogLevel.Information);
    // If you prefer explicit:
    // options.UseMySql(cs, new MySqlServerVersion(new Version(8, 0, 36)));
    // or for MariaDB:
    // options.UseMySql(cs, new MariaDbServerVersion(new Version(10, 4, 32)));
});

var app = builder.Build();

// 2) Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();

//app.UseDefaultFiles();
//app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();
//app.MapFallbackToFile("/index.html");

app.Run();
