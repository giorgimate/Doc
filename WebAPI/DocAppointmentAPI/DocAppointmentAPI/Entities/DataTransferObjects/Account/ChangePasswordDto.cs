using System.ComponentModel.DataAnnotations;

namespace DocAppointmentAPI.Entities.DataTransferObjects.Account
{
    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "CurrentPassword is required")]
        public string? CurrentPassword { get; set; }

        [Required(ErrorMessage = "NewPassword is required")]
        public string? NewPassword { get; set; }

        [Compare("NewPassword", ErrorMessage = "The password and confirmation password do not match.")]
        public string? ConfirmPassword { get; set; }

    }
}
