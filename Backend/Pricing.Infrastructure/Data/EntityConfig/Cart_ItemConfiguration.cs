using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class CartItemConfiguration
        : IEntityTypeConfiguration<Cart_Item>
    {
        public void Configure(EntityTypeBuilder<Cart_Item> builder)
        {
            builder.ToTable("Cart_Item");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Quantity)
                .IsRequired();


            builder.HasOne(x => x.Cart)
                .WithMany(x => x.Cart_Items)
                .HasForeignKey(x => x.Id_Cart)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Product)
                .WithMany(x => x.Cart_Items)
                .HasForeignKey(x => x.Id_Product)
                .OnDelete(DeleteBehavior.Cascade);

        }
    }
}