using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class UserCustomerConfiguration
        : IEntityTypeConfiguration<User_Customer>
    {
        public void Configure(EntityTypeBuilder<User_Customer> builder)
        {
            builder.ToTable("User_Customer");

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

            builder.HasMany(x => x.Address)
                .WithOne(x => x.User_Customer)
                .HasForeignKey(x => x.Id_User_Customer)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(x => x.Customize_Cliente)
                .WithOne(x => x.User_Customer)
                .HasForeignKey<Customize_Cliente>(x => x.Id_User_Customer);

            builder.HasMany(x => x.Orders)
              .WithOne(x => x.User_Customer)
              .HasForeignKey(x => x.Id_User_Customer)
              .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(x => x.Carts)
               .WithOne(x => x.User_Customer)
               .HasForeignKey(x => x.Id_User_Customer)
               .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.Ratings)
               .WithOne(x => x.User_Customer)
               .HasForeignKey(x => x.Id_User_Customer)
               .OnDelete(DeleteBehavior.Cascade);
        }
    }
}