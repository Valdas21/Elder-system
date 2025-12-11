using System.ComponentModel.DataAnnotations.Schema;

namespace Seniunu_valdymo_sistema.Server.Entities
{
    [Table("questions")]
    public class Question
    {
        public int Id { get; set; }
        public string? Text { get; set; }
        public Question() { }
        public Question(string text)
        {
            this.Text = text;
        }
    }
}
