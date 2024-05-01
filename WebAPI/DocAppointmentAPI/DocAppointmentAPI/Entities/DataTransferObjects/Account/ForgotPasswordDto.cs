using System.ComponentModel.DataAnnotations;

namespace DocAppointmentAPI.Entities.DataTransferObjects.Account
{
    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string? Email { get; set; }

        [Required]
        public string? ClientURI { get; set; }
    }
}
