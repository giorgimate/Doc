using DocAppointmentAPI.Entities.DataTransferObjects.Account;
using DocAppointmentAPI.Entities.Models;
using DocAppointmentAPI.Repository;
using EmailService;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DocAppointmentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailValidationsController : ControllerBase
    {
        private readonly RepositoryContext _context;
        private readonly IEmailSender _emailSender;
        private readonly UserManager<User> _userManager;

        public EmailValidationsController(RepositoryContext context, IEmailSender emailSender, UserManager<User> userManager)
        {
            _context = context;
            _emailSender = emailSender;
            _userManager = userManager;

        }

      

        // POST: api/EmailValidations
        [HttpPost]
        public async Task<ActionResult<EmailValidationResponseDto>> PostEmailValidation([FromBody] EmailValidationDto emailValidationDto)
        {
            if (_context.EmailValidations == null)
                return BadRequest(new EmailValidationResponseDto { Error = "Entity set 'RepositoryContext.EmailValidations'  is null." });

            if (emailValidationDto == null || !ModelState.IsValid)
                return BadRequest(new EmailValidationResponseDto { Error = "Email is not Valid" });

            var user = await _userManager.FindByEmailAsync(emailValidationDto.Email);
            if (user != null)
                return Conflict(new EmailValidationResponseDto { Error = $"Email '{emailValidationDto.Email}' is already taken." });


            var emailValidation = await _context.EmailValidations.FindAsync(emailValidationDto.Email);

            if (emailValidation == null)
            {
                emailValidation = new EmailValidation { Email = emailValidationDto.Email };

                _context.EmailValidations.Add(emailValidation);
            }
            else
            {
                var timeElapsed = DateTime.Now - emailValidation.LastUpdated;

                if (timeElapsed.TotalMinutes < 5) // 5 minutes timeout
                {
                    return StatusCode(423,
                        new EmailValidationResponseDto
                        {
                            Error = "Only one validation request is allowed per 5 minutes for this email address.",
                            MinutesLeftForToken = 30 - timeElapsed.TotalMinutes
                        });
                }
                else
                {
                    emailValidation.Token = Guid.NewGuid().ToString("N").Substring(0, 5);
                    emailValidation.LastUpdated = DateTime.Now;
                }
            }

            await _context.SaveChangesAsync();

            var msgContent = $"Email verification code: <h3>{emailValidation.Token}</h3>";
            var message = new Message(new string[] { emailValidation.Email }, "Verify email", msgContent, null);
            await _emailSender.SendEmailAsync(message);

            return Ok();
        }

       
    }
}
