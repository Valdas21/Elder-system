namespace Seniunu_valdymo_sistema.Server.DTO
{
    public class CreateFormRequest
    {
        public int FkAdminId { get; set; }    
        public int Course { get; set; }       
        public bool Active { get; set; } = true;
        public DateTime CreateDate { get; set; } 
        public List<int>? QuestionIds { get; set; } 
    }
}
