namespace DocAppointmentAPI.Entities.DataTransferObjects
{
    public class CategoryWithDoctorsCountDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public int DoctorsCount { get; set; }
    }
}
