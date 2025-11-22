using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Seniunu_valdymo_sistema.Server.Entities
{
    public class FormQuestion
    {
        [Key]
        public int Id { get; set; }
        [Column("fk_Formid")]
        public int FkFormId { get; set; }
        [Column("fk_Questionid")]
        public int FkQuestionId { get; set; }
        
        public FormQuestion() { }
        public FormQuestion(int FkFormId, int FkQuestionId) { 
            this.FkFormId = FkFormId;
            this.FkQuestionId = FkQuestionId;
        }
        [ForeignKey(nameof(FkQuestionId))]
        public Question Question { get; set; } 
        [ForeignKey(nameof(FkFormId))]
        public Form Form { get; set; } 
    }
}
