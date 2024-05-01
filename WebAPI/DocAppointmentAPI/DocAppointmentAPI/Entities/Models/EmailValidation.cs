using System.ComponentModel.DataAnnotations;

namespace DocAppointmentAPI.Entities.Models
{
    public class EmailValidation
    {
        [Key]
        [Required(ErrorMessage = "Email is required.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Token is required.")]
        public string Token { get; set; } = Guid.NewGuid().ToString("N").Substring(0, 5);

        [Required(ErrorMessage = "LastUpdated is required.")]
        public DateTime LastUpdated { get; set; } = DateTime.Now;
    }
}
