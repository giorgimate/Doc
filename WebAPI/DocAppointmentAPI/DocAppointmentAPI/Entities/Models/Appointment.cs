using DocAppointmentAPI.Entities.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace DocAppointmentAPI.Models
{
    public class Appointment
    {
        public Guid Id { get; set; }

        [ForeignKey(nameof(Doctor))]
        public string? DoctorId { get; set; }
        public virtual User? Doctor { get; set; }

        [ForeignKey(nameof(Patient))]
        public string? PatientId { get; set; }

        public virtual User? Patient { get; set; }

        public DateTime Time { get; set; }

        public string? Description { get; set; }
    }
}