using Microsoft.AspNetCore.Mvc;

namespace DocAppointmentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController : ControllerBase
    {
        private readonly IWebHostEnvironment _webHostEnvironment;

        public FilesController(IWebHostEnvironment webHostEnvironment)
        {
            _webHostEnvironment = webHostEnvironment;
        }


        [HttpGet("ProfileImage/{fileName}")]
        public IActionResult GetProfileImage(string fileName)
        {
            var imagesFolder = Path.Combine(_webHostEnvironment.ContentRootPath, "ProfilePictures");
            var imageFilePath = Path.Combine(imagesFolder, fileName);

            if (!System.IO.File.Exists(imageFilePath))
            {
                return NotFound();
            }

            var imageBytes = System.IO.File.ReadAllBytes(imageFilePath);
            var mimeType = GetMimeTypeFromFileName(fileName);

            return File(imageBytes, mimeType);
        }
        private string GetMimeTypeFromFileName(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                _ => "application/octet-stream",
            };
        }
    }
}
