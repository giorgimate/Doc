using DocAppointmentAPI.Repository;
using System.ComponentModel.DataAnnotations;

namespace DocAppointmentAPI.Entities.DataTransferObjects.Account
{
    public abstract class UserForRegistrationDto
    {
        [Required(ErrorMessage = "First Name is required.")]
        [RegularExpression(@"^[\u10D0-\u10FF]+$", ErrorMessage = "FirstName must contain only Georgian unicode characters")]
        public string? FirstName { get; set; }

        [Required(ErrorMessage = "Last Name is required.")]
        [RegularExpression(@"^[\u10D0-\u10FF]+$", ErrorMessage = "LastName must contain only Georgian unicode characters")]
        public string? LastName { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Email is not valid")]
        public string? Email { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [RegularExpression(@"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,}$",
            ErrorMessage = "Password must contain: Minimum 8 characters atleast 1 UpperCase character, 1 LowerCase character, 1 Digit and 1 Non-Alphanumeric character")]
        public string? Password { get; set; }

        [Required(ErrorMessage = "Personal Identification Number is required")]
        [RegularExpression(@"^\d{11}$", ErrorMessage = "Personal Identification Number is not valid")]
        public string? PersonalId { get; set; }
        [Required(ErrorMessage = "Profile image is required.")]
        public IFormFile ProfileImage { get; set; }

        // ეს დატასიდერისთვისაა
        public string? ImageId { get; set; }

    }

    public class AdminForRegistrationDto : UserForRegistrationDto
    {
    }

    public class PatientForRegistrationDto : UserForRegistrationDto
    {
        [Required(ErrorMessage = "Email Validation Code  is required")]
        public string? EmailValidationCode { get; set; }

    }

    public class DoctorForRegistrationDto : UserForRegistrationDto
    {
        public double? Rating { get; set; }
        public int? ViewCount { get; set; }

        [Required(ErrorMessage = "ImageUrl is required.")]
        public string? ImageUrl { get; set; }

        [Required(ErrorMessage = "Please enter a CategoryId.")]
        [CategoryExists(ErrorMessage = "The CategoryId provided does not exist in the Category table.")]
        public Guid? CategoryId { get; set; }
    }

    sealed public class CategoryExistsAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (value == null) return ValidationResult.Success;

            var context = (RepositoryContext)validationContext.GetService(typeof(RepositoryContext));
            Guid categoryId = (Guid)value;

            if (context.Categories.Any(c => c.Id == categoryId))
            {
                return ValidationResult.Success;
            }

            return new ValidationResult("The CategoryId provided does not exist in the Category table.");
        }
    }
}
