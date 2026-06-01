using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class User_DeliveryConfiguration : IEntityTypeConfiguration<User_Delivery>
    {
        public void Configure(EntityTypeBuilder<User_Delivery> builder)
        {
            builder.ToTable("User_Delivery");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.Email)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.PasswordHash)
                .IsRequired();

            builder.Property(x => x.Role)
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.HasOne(x => x.Address)
                .WithOne(x => x.User_Delivery)
                .HasForeignKey<Address>(x => x.Id_User_Delivery);

            builder.HasMany(x => x.Orders)
                .WithOne(x => x.User_Delivery)
                .HasForeignKey(x => x.Id_User_Delivery)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}