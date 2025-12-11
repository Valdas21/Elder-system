using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Seniunu_valdymo_sistema.Server.Entities
{
    [Table("responses")]
    public class Response
    {
        [Key]
        public int Id { get; set; }
        public string? Text { get; set; }
        [Column("fk_FormQuestionid")]
        public int FkFormQuestionId { get; set; }
        [Column("fk_Submissionid")]
        public int FkSubmissionId {  get; set; }
        [ForeignKey(nameof(FkFormQuestionId))]
        public FormQuestion FormQuestion { get; set; } = null!;
        [ForeignKey(nameof(FkSubmissionId))]
        public Submission Submission { get; set; } = null!;
        public Response() { }
        public Response(string text, int fkFormQuestionId, int fkSubmissionId) { 
            this.Text = text;
            this.FkFormQuestionId = fkFormQuestionId;
            this.FkSubmissionId = fkSubmissionId;
        }
    }
}
