using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Seniunu_valdymo_sistema.Server.Entities
{
    [Table("admins")]
    public class Admin
    {
        [Key]
        public int Id { get; set; }
        public Admin() { }
    }
}
