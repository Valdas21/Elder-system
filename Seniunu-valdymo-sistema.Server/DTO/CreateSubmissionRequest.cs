namespace Seniunu_valdymo_sistema.Server.DTO
{
    public class CreateSubmissionRequest
    {
        public int FkFormId { get; set; }
        public int FkElderId { get; set; }
        public List<CreateResponseDto> Responses { get; set; } = new();
    }

    public class CreateResponseDto
    {
        public int FkFormQuestionId { get; set; }
        public string Text { get; set; } = string.Empty;
    }
    public class UpdateSubmissionRequest
    {
        public List<UpdateResponseDto> Responses { get; set; } = new();
    }

    public class UpdateResponseDto
    {
        public int FkFormQuestionId { get; set; }
        public string Text { get; set; } = string.Empty;
    }
}
