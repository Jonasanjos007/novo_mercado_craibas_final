using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class Customize_AdminConfiguration
        : IEntityTypeConfiguration<Customize_Admin>
    {
        public void Configure(EntityTypeBuilder<Customize_Admin> builder)
        {
            builder.ToTable("Customize_Admin");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Global_Site_Color)
                .HasMaxLength(20);

            builder.Property(x => x.Dark)
                .IsRequired();

            builder.HasIndex(x => x.Id_User_Admin)
                .IsUnique();

            builder.HasOne(x => x.User_Admin)
                .WithOne(x => x.Customize_Admin)
                .HasForeignKey<Customize_Admin>(x => x.Id_User_Admin)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}