using DocAppointmentAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DocAppointmentAPI.Entities.Configuration
{
    public class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.HasMany(c => c.Users)
                   .WithOne(u => u.Category)
                   .HasForeignKey(u => u.CategoryId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
