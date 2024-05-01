using DocAppointmentAPI.Entities.DataTransferObjects;
using DocAppointmentAPI.Entities.DataTransferObjects.Account;
using DocAppointmentAPI.Entities.Models;
using DocAppointmentAPI.JwtFeatures;
using DocAppointmentAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DocAppointmentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly JwtHandler _jwtHandler;
        private readonly RepositoryContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public UsersController(UserManager<User> userManager, JwtHandler jwtHandler, RepositoryContext context, IWebHostEnvironment webHostEnvironment)
        {
            _userManager = userManager;
            _jwtHandler = jwtHandler;
            _context = context;
            _webHostEnvironment = webHostEnvironment;
        }

        // GET: api/<UsersController>/Doctors
        [HttpGet("Doctors")]
        public async Task<ActionResult<IEnumerable<DoctorDto>>> GetDoctors(int? limit = null, int? offset = null, Guid? categoryId = null, string? name = null)
        {
            var users = await _userManager.GetUsersInRoleAsync("Doctor");

            if (categoryId.HasValue)
            {
                users = users.Where(u => u.CategoryId == categoryId.Value).ToList();
            }

            if (!string.IsNullOrEmpty(name))
            {
                users = users.Where(u => (u.FirstName + " " + u.LastName).Contains(name, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            var sortedUsers = users.OrderByDescending(user => user.ViewCount).ToList();

            List<DoctorDto> result = new List<DoctorDto>();
            sortedUsers.ForEach(u =>
            {
                var imageUrl = generateImgUrl(u.ImageId);

                result.Add(
                    new DoctorDto
                    {
                        Id = u.Id,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        Rating = u.Rating,
                        ViewCount = u.ViewCount,
                        Category = _context.Categories.Find(u.CategoryId)?.Name,
                        ImageUrl = imageUrl,
                    });
            });

            // Apply limit and offset only if they are provided
            if (offset.HasValue && limit.HasValue)
            {
                if (offset.Value + limit.Value > result.Count)
                {
                    limit = result.Count - offset.Value;
                }
                try
                {
                    result = result.GetRange(offset.Value, limit.Value);
                }
                catch (Exception)
                {
                    return NotFound();
                }
            }

            return Ok(result);
        }

        // GET api/<UsersController>/Doctors/5
        [HttpGet("Doctors/{id}")]
        public async Task<ActionResult<DoctorDto>> GetDoctor(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            user.ViewCount += 1;
            await _context.SaveChangesAsync();

            if (isUserRole(user, "Doctor"))
            {
                var imageUrl = generateImgUrl(user.ImageId);

                var doctor = new DoctorDto()
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Rating = user.Rating,
                    ViewCount = user.ViewCount,
                    Category = _context.Categories.Find(user.CategoryId)?.Name,
                    ImageUrl = imageUrl


                };
                return doctor;
            }
            else return NotFound();
        }

        // GET api/<UsersController>/5
        [HttpGet("{id}"), Authorize]
        public async Task<ActionResult<UserDto>> GetUser(string id)
        {
            if (!_jwtHandler.CheckSelfOrAdmin(Request, id))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            var userRole = _userManager.GetRolesAsync(user).Result.ToList().First();

            var imageUrl = generateImgUrl(user.ImageId);

            var userDto = new UserDto()
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PersonalId = user.PersonalId,
                Rating = user.Rating,
                ViewCount = user.ViewCount,
                ImageUrl = imageUrl,
                Category = _context.Categories.Find(user.CategoryId)?.Name,
                AppointmentsCount = _context.Appointments.Count(a => a.PatientId == user.Id || a.DoctorId == user.Id),
                Role = userRole
            };

            return userDto;
        }

        // GET: api/<UsersController>/
        [HttpGet, Authorize(Roles = "Admin")]
        public async Task<IEnumerable<UserDto>> GetUsers(string? role = null)
        {
            var users = string.IsNullOrEmpty(role)
                ? await _userManager.Users.ToListAsync()
                : await _userManager.GetUsersInRoleAsync(role);

            return users.Select(u => new UserDto
            {
                Id = u.Id,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                PersonalId = u.PersonalId,
                Rating = u.Rating,
                ViewCount = u.ViewCount,
                ImageUrl = generateImgUrl(u.ImageId),
                Category = _context.Categories.Find(u.CategoryId)?.Name,
                AppointmentsCount = _context.Appointments.Count(a => a.PatientId == u.Id || a.DoctorId == u.Id),
                Role = _userManager.GetRolesAsync(u).Result.FirstOrDefault()
            });
        }

        // PUT api/<UsersController>/5
        [HttpPut("{id}"), Authorize(Roles = "Admin")]
        //[HttpPut("{id}")]
        public async Task<ActionResult> PutUser(string id, [FromBody] UserForUpdateDto userForUpdateDto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null || userForUpdateDto == null)
                return NotFound();

            updateUser(userForUpdateDto, user);

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);
                return BadRequest(errors);
            }

            return NoContent();
        }

        // DELETE api/<UsersController>/5
        [HttpDelete("{id}"), Authorize(Roles = "Admin")]
        //[HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            var result = _userManager.DeleteAsync(user).Result;
            if (result.Succeeded)
            {
                return Ok(result);
            }
            else return Problem();
        }

        private bool isUserRole(User user, string role)
        {
            var result = _userManager.IsInRoleAsync(user, role).Result;

            return result;
        }
        private async void updateUser(UserForUpdateDto userForUpdateDto, User user)
        {
            if (userForUpdateDto.FirstName != null)
                user.FirstName = userForUpdateDto.FirstName;
            if (userForUpdateDto.LastName != null)
                user.LastName = userForUpdateDto.LastName;
            if (userForUpdateDto.Email != null)
            {
                user.Email = userForUpdateDto.Email.ToLower();
                user.UserName = userForUpdateDto.Email.ToLower();
            }
            if (userForUpdateDto.PersonalId != null)
                user.PersonalId = userForUpdateDto.PersonalId;

            if (isUserRole(user, "Doctor"))
            {
                if (userForUpdateDto.Rating != null)
                    user.Rating = userForUpdateDto.Rating;
                if (userForUpdateDto.ViewCount != null)
                    user.ViewCount = userForUpdateDto.ViewCount;
                if (userForUpdateDto.ImageUrl != null)
                    user.ImageId = userForUpdateDto.ImageUrl;
                if (userForUpdateDto.CategoryId != null)
                    user.CategoryId = userForUpdateDto.CategoryId;
            }

            await _userManager.ChangePasswordAsync(user, user.PasswordHash,
                userForUpdateDto.Password);
        }
        private string generateImgUrl(string imgId)
        {
            var apiUrl = $"{Request.Scheme}://{Request.Host.Value}"; // Get the base URL of the API
            var imageUrl = $"{apiUrl}/api/Files/ProfileImage/{imgId}";
            return imageUrl;
        }

    }
}
