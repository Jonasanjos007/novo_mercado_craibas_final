using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class CartConfiguration
        : IEntityTypeConfiguration<Cart>
    {
        public void Configure(EntityTypeBuilder<Cart> builder)
        {
            builder.ToTable("Cart");

            builder.HasKey(x => x.Id);

            // USER CUSTOMER

            builder.HasOne(x => x.User_Customer)
                .WithMany(x => x.Carts)
                .HasForeignKey(x => x.Id_User_Customer)
                .OnDelete(DeleteBehavior.Cascade);

            // CART ITEMS

            builder.HasMany(x => x.Cart_Items)
                .WithOne(x => x.Cart)
                .HasForeignKey(x => x.Id_Cart)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}