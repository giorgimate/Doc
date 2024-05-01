using DocAppointmentAPI.Entities.Models;
using System.ComponentModel.DataAnnotations;

namespace DocAppointmentAPI.Models
{
    public class Category
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Please enter Doctor Category Name")]
        [MaxLength(60, ErrorMessage = "Maximum length for the Name is 60 characters.")]
        public string? Name { get; set; }

        public ICollection<User> Users { get; set; }

    }
}
