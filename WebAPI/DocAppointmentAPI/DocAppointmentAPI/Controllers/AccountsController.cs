using AutoMapper;
using DocAppointmentAPI.Entities.DataTransferObjects.Account;
using DocAppointmentAPI.Entities.Models;
using DocAppointmentAPI.JwtFeatures;
using DocAppointmentAPI.Repository;
using EmailService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using System.IdentityModel.Tokens.Jwt;

namespace DocAppointmentAPI.Controllers
{
    [Route("api/accounts")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly IMapper _mapper;
        private readonly JwtHandler _jwtHandler;
        private readonly IEmailSender _emailSender;
        private readonly RepositoryContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;


        public AccountsController(UserManager<User> userManager, IMapper mapper, JwtHandler jwtHandler,
            IEmailSender emailSender, RepositoryContext context, IWebHostEnvironment webHostEnvironment)
        {
            _userManager = userManager;
            _mapper = mapper;
            _jwtHandler = jwtHandler;
            _emailSender = emailSender;
            _context = context;
            _webHostEnvironment = webHostEnvironment;

        }

        [HttpPost("RegisterAdmin"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] AdminForRegistrationDto userForRegistration)
        {
            if (userForRegistration == null || !ModelState.IsValid)
                return BadRequest();

            var user = _mapper.Map<User>(userForRegistration);
            var result = await _userManager.CreateAsync(user, userForRegistration.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);

                return BadRequest(new RegistrationResponseDto { Errors = errors });
            }

            await _userManager.AddToRoleAsync(user, "Admin");

            return StatusCode(201);
        }

        [HttpPost("RegisterDoctor"), Authorize(Roles = "Admin")]
        public async Task<IActionResult> RegisterUser([FromBody] DoctorForRegistrationDto userForRegistration)
        {
            if (userForRegistration == null || !ModelState.IsValid)
                return BadRequest();

            var user = _mapper.Map<User>(userForRegistration);
            var result = await _userManager.CreateAsync(user, userForRegistration.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);

                return BadRequest(new RegistrationResponseDto { Errors = errors });
            }

            user.ViewCount = 0;
            user.Rating = 5;
            await _userManager.AddToRoleAsync(user, "Doctor");

            return StatusCode(201);
        }

        [HttpPost("RegisterPatient")]
        public async Task<IActionResult> RegisterUser([FromForm] PatientForRegistrationDto userForRegistration)
        {
            if (userForRegistration == null || !ModelState.IsValid)
                return BadRequest();

            var emailValidation = _context.EmailValidations.Find(userForRegistration.Email);
            if (emailValidation == null || emailValidation.Token != userForRegistration.EmailValidationCode)
                return BadRequest(new RegistrationResponseDto { Errors = new List<string> { "Email Validation Code is invalid" } });

            var timeElapsed = DateTime.Now - emailValidation.LastUpdated;
            if (timeElapsed.TotalMinutes > 30)
                return BadRequest(new RegistrationResponseDto { Errors = new List<string> { "Email Validation Code is expired" } });


            var user = _mapper.Map<User>(userForRegistration);

            // Save the uploaded image file to the desired location
            var imageFileName = $"{Guid.NewGuid()}_{userForRegistration.ProfileImage.FileName}";
            var imagesFolder = Path.Combine(_webHostEnvironment.ContentRootPath, "ProfilePictures");

            if (!Directory.Exists(imagesFolder))
            {
                Directory.CreateDirectory(imagesFolder);
            }

            var imageFilePath = Path.Combine(imagesFolder, imageFileName);

            using (var stream = new FileStream(imageFilePath, FileMode.Create))
            {
                await userForRegistration.ProfileImage.CopyToAsync(stream);
            }
            user.ImageId = imageFileName;

            var result = await _userManager.CreateAsync(user, userForRegistration.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);

                return BadRequest(new RegistrationResponseDto { Errors = errors });
            }

            await _userManager.AddToRoleAsync(user, "Patient");

            return StatusCode(201);
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] UserForAuthenticationDto userForAuthentication)
        {
            var user = await _userManager.FindByNameAsync(userForAuthentication.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, userForAuthentication.Password))
                return Unauthorized(new AuthResponseDto { ErrorMessage = "Invalid Authentication" });

            var signingCredentials = _jwtHandler.GetSigningCredentials();
            var claims = await _jwtHandler.GetClaims(user);
            var tokenOptions = _jwtHandler.GenerateTokenOptions(signingCredentials, claims);
            var token = new JwtSecurityTokenHandler().WriteToken(tokenOptions);

            return Ok(new AuthResponseDto { IsAuthSuccessful = true, Token = token });
        }

        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest();

            var user = await _userManager.FindByEmailAsync(forgotPasswordDto.Email);
            if (user == null)
                return NotFound("Email not Found");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var param = new Dictionary<string, string?>
            {
                {"token", token },
                {"email", forgotPasswordDto.Email }
            };

            var callback = QueryHelpers.AddQueryString(forgotPasswordDto.ClientURI, param);
            var message = new Message(new string[] { user.Email }, "Reset password token", callback, null);

            await _emailSender.SendEmailAsync(message);

            return Ok();
        }

        [HttpPost("ResetPassword")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest();

            var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);
            if (user == null)
                return BadRequest("Invalid Request");

            var resetPassResult = await _userManager.ResetPasswordAsync(user, resetPasswordDto.Token, resetPasswordDto.Password);
            if (!resetPassResult.Succeeded)
            {
                var errors = resetPassResult.Errors.Select(e => e.Description);

                return BadRequest(new { Errors = errors });
            }

            return Ok();
        }

        [HttpPost("ChangePassword/{id}"), Authorize]
        public async Task<IActionResult> ChangePassword(string id, [FromBody] ChangePasswordDto changePasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest();

            if (!_jwtHandler.CheckSelfOrAdmin(Request, id))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return BadRequest("Invalid Request");

            var resetPassResult = await _userManager.ChangePasswordAsync(user,
                changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
            if (!resetPassResult.Succeeded)
            {
                var errors = resetPassResult.Errors.Select(e => e.Description);

                return BadRequest(new { Errors = errors });
            }

            return Ok();
        }
    }
}
