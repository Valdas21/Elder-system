using System.ComponentModel.DataAnnotations;

namespace Seniunu_valdymo_sistema.Server.Entities
{
    public class Admin
    {
        [Key]
        public int Id { get; set; }
        public Admin() { }
    }
}
