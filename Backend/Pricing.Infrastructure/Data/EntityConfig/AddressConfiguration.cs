using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class AddressConfiguration
        : IEntityTypeConfiguration<Address>
    {
        public void Configure(EntityTypeBuilder<Address> builder)
        {
            builder.ToTable("Address");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Number)
                .IsRequired();

            builder.Property(x => x.Road)
             .IsRequired()
             .HasMaxLength(250);

            builder.Property(x => x.City)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.State)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasOne(x => x.User_Customer)
                .WithOne(x => x.Address)
                .HasForeignKey<Address>(x => x.Id_User_Customer)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(x => x.User_Delivery)
                .WithOne(x => x.Address)
                .HasForeignKey<Address>(x => x.Id_User_Delivery)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasMany(x => x.Orders)
                .WithOne(x => x.Address)
                .HasForeignKey(x => x.Id_Address)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}