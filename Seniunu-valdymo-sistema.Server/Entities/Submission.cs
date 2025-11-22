using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Seniunu_valdymo_sistema.Server.Entities
{
    public class Submission
    {
        [Key]
        public int Id { get; set; }
        [Column("fill_date")]
        public DateTime FillDate { get; set; }
        [Column("fk_Formid")]
        public int FkFormId { get; set; }
        [Column("fk_Elderid")]
        public int FkElderId { get; set; }
        [ForeignKey(nameof(FkElderId))]
        public Elder Elder { get; set; } = null!;
        [ForeignKey(nameof(FkFormId))]
        public Form Form { get; set; } = null!;
        public ICollection<Response> Responses { get; set; } = new List<Response>();
        public Submission() { }
        public Submission(DateTime dateTime, int fkFormId, int fkElderId) { 
            this.FillDate = dateTime;
            this.FkElderId = fkElderId;
            this.FkFormId = fkFormId;
        }
    }
}
