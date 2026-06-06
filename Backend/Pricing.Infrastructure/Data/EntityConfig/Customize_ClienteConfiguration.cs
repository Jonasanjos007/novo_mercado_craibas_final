using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class Customize_ClienteConfiguration
        : IEntityTypeConfiguration<Customize_Cliente>
    {
        public void Configure(EntityTypeBuilder<Customize_Cliente> builder)
        {
            builder.ToTable("Customize_Cliente");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Global_Site_Color)
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(x => x.Dark)
                .IsRequired();

            builder.HasIndex(x => x.Id_User_Customer)
                .IsUnique();

            builder.HasOne(x => x.User_Customer)
                .WithOne(x => x.Customize_Cliente)
                .HasForeignKey<Customize_Cliente>(x => x.Id_User_Customer)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}