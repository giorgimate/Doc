using System.ComponentModel.DataAnnotations;

namespace DocAppointmentAPI.Entities.DataTransferObjects.Account
{
    public class UserForUpdateDto
    {
        [RegularExpression(@"^[\u10D0-\u10FF]+$", ErrorMessage = "FirstName must contain only Georgian unicode characters")]
        public string? FirstName { get; set; }

        [RegularExpression(@"^[\u10D0-\u10FF]+$", ErrorMessage = "LastName must contain only Georgian unicode characters")]
        public string? LastName { get; set; }

        [EmailAddress(ErrorMessage = "Email is not valid")]
        public string? Email { get; set; }

        [RegularExpression(@"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,}$",
            ErrorMessage = "Password must contain: Minimum 8 characters atleast 1 UpperCase character, 1 LowerCase character, 1 Digit and 1 Non-Alphanumeric character")]
        public string? Password { get; set; }

        [RegularExpression(@"^\d{11}$", ErrorMessage = "Personal Identification Number is not valid")]
        public string? PersonalId { get; set; }

        [Range(1.0, 5.0, ErrorMessage = "Please enter valid Rating.")]
        public double? Rating { get; set; }

        public int? ViewCount { get; set; }

        public string? ImageUrl { get; set; }

        [CategoryExists(ErrorMessage = "The CategoryId provided does not exist in the Category table.")]
        public Guid? CategoryId { get; set; }
    }
}
