using Microsoft.EntityFrameworkCore;
using Seniunu_valdymo_sistema.Server;
using Microsoft.Extensions.Configuration;
using System.Text.Json.Serialization;
using Seniunu_valdymo_sistema.Server.Infrastructure;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1) Register services BEFORE Build()
builder.Services.AddControllers().AddJsonOptions(x => x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSingleton<TokenProvider>();

builder.Services.AddSwaggerGen(options =>
{
    var jwtSecurityScheme = new OpenApiSecurityScheme
    {
        BearerFormat = "JWT",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = JwtBearerDefaults.AuthenticationScheme,
        Description = "Put **_ONLY_** your JWT Bearer token on textbox below!",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };
    options.AddSecurityDefinition("Bearer", jwtSecurityScheme);
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtSecurityScheme, Array.Empty<string>() }
    });
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
    };
});

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
    app.UseSwagger();
    app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();
