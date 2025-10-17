using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Seniunu_valdymo_sistema.Server.Entities
{
    public class Elder
    {
        [Key]
        public int Id { get; set; }
        public int Course {  get; set; }

        [ForeignKey("Id")]
        public User User { get; set; }
        public Elder() { }

    }
}
