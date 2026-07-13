using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class User_AdminConfiguration : IEntityTypeConfiguration<User_Admin>
    {
        public void Configure(EntityTypeBuilder<User_Admin> builder)
        {
            builder.ToTable("User_Admin");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.Email)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Role)
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(x => x.PasswordHash)
                .IsRequired();

            builder.HasOne(x => x.Customize_Admin)
                .WithOne(x => x.User_Admin)
                .HasForeignKey<Customize_Admin>(x => x.Id_User_Admin);
        }
    }
}