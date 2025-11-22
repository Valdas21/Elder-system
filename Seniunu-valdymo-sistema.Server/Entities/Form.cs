using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Seniunu_valdymo_sistema.Server.Entities
{
    public class Form
    {
        [Key]
        public int Id { get; set; }
        [Column("create_date")]
        public DateTime CreateDate { get; set; }
        public bool Active { get; set; }
        public int Course { get; set; }
        [Column("fk_Adminid")]
        public int FkAdminId { get; set; }
        public ICollection<FormQuestion> FormQuestions { get; set; } = new List<FormQuestion>();
    }
}
