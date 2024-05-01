namespace DocAppointmentAPI.Entities.DataTransferObjects.Account
{
    public class EmailValidationResponseDto
    {
        public bool IsSuccessfulEmailValidation { get; set; }
        public string? Error { get; set; }
        public double? MinutesLeftForToken { get; set; }
    }
}
