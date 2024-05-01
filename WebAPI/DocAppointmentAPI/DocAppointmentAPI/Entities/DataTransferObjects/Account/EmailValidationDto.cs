using System.ComponentModel.DataAnnotations;

namespace DocAppointmentAPI.Entities.DataTransferObjects.Account
{
    public class EmailValidationDto
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Email is not valid")]
        public string? Email { get; set; }
    }
}
