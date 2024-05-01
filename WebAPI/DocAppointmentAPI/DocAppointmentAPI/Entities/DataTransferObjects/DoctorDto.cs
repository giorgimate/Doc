using DocAppointmentAPI.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace DocAppointmentAPI.Entities.DataTransferObjects
{
    public class DoctorDto
    {
        public string? Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public double? Rating { get; set; }
        public int? ViewCount { get; set; }
        public string? ImageUrl { get; set; }
        public string? Category { get; set; }
    }
}
