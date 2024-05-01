namespace DocAppointmentAPI.Entities.DataTransferObjects
{
    public class UserDto
    {
        public string? Id { get; set; }
        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PersonalId { get; set; }
        public double? Rating { get; set; }
        public int? ViewCount { get; set; }
        public string? ImageUrl { get; set; }
        public string? Category { get; set; }
        public int AppointmentsCount { get; set; }
        public string? Role { get; set; }
    }
}
