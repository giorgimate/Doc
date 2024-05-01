using DocAppointmentAPI.Entities.DataTransferObjects;
using DocAppointmentAPI.Entities.Models;
using DocAppointmentAPI.JwtFeatures;
using DocAppointmentAPI.Models;
using DocAppointmentAPI.Repository;
using DocAppointmentAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DocAppointmentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly RepositoryContext _context;
        private readonly AppointmentService _appointmentService;
        private readonly JwtHandler _jwtHandler;
        private readonly UserManager<User> _userManager;


        public AppointmentsController(RepositoryContext context, AppointmentService appointmentService, JwtHandler jwtHandler, UserManager<User> userManager)
        {
            _context = context;
            _appointmentService = appointmentService;
            _jwtHandler = jwtHandler;
            _userManager = userManager;

        }

        // GET: api/Appointments/5
        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetDoctorAppointments(string userId)
        {
            if (_context.Appointments == null)
                return NotFound();


            var user = await _userManager.FindByIdAsync(userId);
            var isUserPatient = await _userManager.IsInRoleAsync(user, "Patient");
            if (isUserPatient && !_jwtHandler.CheckSelfOrAdmin(Request, userId))
                return Unauthorized();


            string? jwtUserId = null;
            try
            {
                var jwtToken = _jwtHandler.GetToken(Request);
                jwtUserId = _jwtHandler.GetData(jwtToken, ClaimTypes.NameIdentifier.ToString());
            }
            catch (ArgumentNullException)
            {
            }



            var appointments = await _context.Appointments.Where(a => a.PatientId == userId || a.DoctorId == userId).ToListAsync();


            List<AppointmentDto> result = new List<AppointmentDto>();

            appointments.ForEach(a =>
            {
                var appointmentDto = new AppointmentDto()
                {
                    StartTime = a.Time,
                    EndTime = a.Time.AddHours(1),
                    IsCurrentUserAppointment = false,
                };

                if (jwtUserId == a.PatientId || jwtUserId == a.DoctorId)
                {
                    appointmentDto.Id = a.Id;
                    appointmentDto.Description = a.Description;
                    appointmentDto.IsCurrentUserAppointment = true;
                    if (a.PatientId == null)
                    {
                        appointmentDto.IsNonAvailableAppointment = true;
                    }
                }

                result.Add(appointmentDto);
            });

            return Ok(result);
        }

        [HttpPut("{id}"), Authorize(Roles = "Patient,Admin")]
        //[HttpPut("{id}")]
        public async Task<IActionResult> PutAppointment(Guid id, string? description)
        {
            if (_context.Appointments == null)
                return NotFound();

            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                return NotFound();

            if (appointment.Time <= DateTime.Now)
                return Forbid();

            if (!_jwtHandler.CheckSelfOrAdmin(Request, appointment.PatientId))
                return Unauthorized();

            appointment.Description = description;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Appointments
        [HttpPost, Authorize(Roles = "Patient,Admin")]
        public async Task<ActionResult<Appointment>> PostAppointment([FromBody] AppointmentDto appointmentDto)
        {
            if (appointmentDto == null || !ModelState.IsValid)
                return BadRequest();

            if (!_jwtHandler.CheckSelfOrAdmin(Request, appointmentDto.PatientId))
                return Unauthorized();

            if (_context.Appointments == null)
                return Problem("Entity set 'RepositoryContext.Appointments'  is null.");

            if (!_appointmentService.DoctorExists(appointmentDto.DoctorId))
                return StatusCode(406, "DoctorId is invalid");

            if (!_appointmentService.PatientExists(appointmentDto.PatientId))
                return StatusCode(406, "PatientId is invalid");

            if (!_appointmentService.TimeAvailable(appointmentDto.StartTime, appointmentDto.DoctorId, appointmentDto.PatientId))
                return StatusCode(406, "Time is invalid");

            var appointment = new Appointment
            {
                Id = Guid.NewGuid(),
                DoctorId = appointmentDto.DoctorId,
                PatientId = appointmentDto.PatientId,
                Time = appointmentDto.StartTime,
                Description = appointmentDto.Description
            };

            await _context.Appointments.AddAsync(appointment);
            await _context.SaveChangesAsync();

            return StatusCode(201);
        }

        // POST: api/Appointments
        [HttpPost("NotAvailable"), Authorize(Roles = "Doctor,Admin")]
        public async Task<ActionResult> PostNotAvailableAppointments(string doctorId, DateTime time)
        {
            if (!_jwtHandler.CheckSelfOrAdmin(Request, doctorId))
                return Unauthorized();

            if (_context.Appointments == null)
                return Problem("Entity set 'RepositoryContext.Appointments'  is null.");

            if (!_appointmentService.DoctorExists(doctorId))
                return StatusCode(406, "DoctorId is invalid");

            if (!_appointmentService.TimeAvailable(time, doctorId, null))
                return StatusCode(406, $"Time '{time}' is invalid");

            var appointment = new Appointment
            {
                Id = Guid.NewGuid(),
                DoctorId = doctorId,
                Time = time
            };

            await _context.Appointments.AddAsync(appointment);

            await _context.SaveChangesAsync();

            return StatusCode(201);
        }

        // DELETE: api/Appointments/5
        [HttpDelete("{id}"), Authorize]
        public async Task<IActionResult> DeleteAppointment(Guid id)
        {
            if (_context.Appointments == null)
                return NotFound();

            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                return NotFound();

            if (appointment.Time <= DateTime.Now)
                return Forbid();

            if (!_jwtHandler.CheckSelfOrAdmin(Request, appointment.PatientId) &&
                !_jwtHandler.CheckSelfOrAdmin(Request, appointment.DoctorId))
                return Unauthorized();

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AppointmentExists(Guid id)
        {
            return (_context.Appointments?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}

