using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class Customize_DeliveryConfiguration
        : IEntityTypeConfiguration<Customize_Delivery>
    {
        public void Configure(EntityTypeBuilder<Customize_Delivery> builder)
        {
            builder.ToTable("Customize_Delivery");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Global_Site_Color)
                .HasMaxLength(20);

            builder.Property(x => x.Dark)
                .IsRequired();

            builder.HasIndex(x => x.Id_User_Delivery)
                .IsUnique();

            builder.HasOne(x => x.User_Delivery)
                .WithOne(x => x.Customize_Delivery)
                .HasForeignKey<Customize_Delivery>(x => x.Id_User_Delivery)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}