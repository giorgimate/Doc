using DocAppointmentAPI.Entities.Configuration;
using DocAppointmentAPI.Entities.Models;
using DocAppointmentAPI.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DocAppointmentAPI.Repository
{
    public class RepositoryContext : IdentityDbContext<User>
    {

        public RepositoryContext(DbContextOptions options)
        : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfiguration(new RoleConfiguration());
            modelBuilder.ApplyConfiguration(new AppointmentConfiguration());
            modelBuilder.ApplyConfiguration(new EmailValidationConfiguration());
            modelBuilder.ApplyConfiguration(new CategoryConfiguration());


        }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<EmailValidation> EmailValidations { get; set; }
        public DbSet<FileData> FileDatas { get; set; }

    }
}
