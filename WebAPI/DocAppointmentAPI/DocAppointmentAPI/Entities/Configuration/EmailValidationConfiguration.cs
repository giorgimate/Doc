using DocAppointmentAPI.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DocAppointmentAPI.Entities.Configuration
{
    public class EmailValidationConfiguration : IEntityTypeConfiguration<EmailValidation>
    {
        public void Configure(EntityTypeBuilder<EmailValidation> builder)
        {
            builder.HasIndex(e => e.Email).IsUnique();
        }
    }
}
