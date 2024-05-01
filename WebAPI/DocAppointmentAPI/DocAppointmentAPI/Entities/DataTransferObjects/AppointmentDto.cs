using System.ComponentModel.DataAnnotations;

namespace DocAppointmentAPI.Entities.DataTransferObjects
{
    public class AppointmentDto
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Please enter a DoctorId.")]
        public string? DoctorId { get; set; }
        [Required(ErrorMessage = "Please enter a PatientId.")]
        public string? PatientId { get; set; }

        [Required(ErrorMessage = "Please enter Date and Time.")]
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? Description { get; set; }
        public bool? IsCurrentUserAppointment { get; set; }
        public bool? IsNonAvailableAppointment { get; set; }

    }
}
