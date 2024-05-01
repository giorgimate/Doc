using DocAppointmentAPI.Repository;

namespace DocAppointmentAPI.Services
{
    public class AppointmentService
    {
        private readonly RepositoryContext _context;

        public AppointmentService(RepositoryContext context)
        {
            _context = context;
        }

        public bool TimeAvailable(DateTime time, string doctorId, string patientId)
        {
            var timeIsValid = time >= DateTime.Now.AddMinutes(30)
                && time.DayOfWeek != DayOfWeek.Saturday && time.DayOfWeek != DayOfWeek.Sunday
                && time.Millisecond == 0 && time.Minute == 0
                && time.Hour >= 9 && time.Hour <= 16;

            var doctorIsBooked = false;
            var patientIsBooked = false;

            if (doctorId != null)
                doctorIsBooked = _context.Appointments.Any(a => a.DoctorId == doctorId && a.Time == time);

            if (patientId != null)
                patientIsBooked = _context.Appointments.Any(a => a.PatientId == patientId && a.Time == time);

            var timeIsBooked = doctorIsBooked || patientIsBooked;

            return timeIsValid && !timeIsBooked;
        }

        private bool UserRoleExists(string userId, string roleName)
        {
            var user = _context.Users.Find(userId);
            if (user == null) return false;

            var role = _context.Roles.Where(r => r.Name == roleName).FirstOrDefault();
            if (role == null) return false;

            var roleId = role.Id;
            var userRoleExists = _context.UserRoles.Any(u => u.RoleId == roleId && u.UserId == userId);

            return userRoleExists;
        }

        public bool DoctorExists(string userId)
        {
            return UserRoleExists(userId, "Doctor");
        }

        public bool PatientExists(string userId)
        {
            return UserRoleExists(userId, "Patient");
        }
    }
}
