using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Seniunu_valdymo_sistema.Server.Entities
{
    [Table("users")]
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string? Name { get; set; }
        [Column("last_name")]
        public string? LastName { get; set; }
        public string? Password { get; set; }
        public string? Email { get; set; }
        public User(string name, string lastName, string Password, string email) { 
            this.Name = name;
            this.LastName = lastName;
            this.Password = Password;
            this.Email = email;
        }
        public User() { }
    }
}
