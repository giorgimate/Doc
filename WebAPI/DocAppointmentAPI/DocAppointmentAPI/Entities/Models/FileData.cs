namespace DocAppointmentAPI.Entities.Models
{
    public class FileData
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public string ContentType { get; set; }
        public byte[] Data { get; set; }
    }

}
