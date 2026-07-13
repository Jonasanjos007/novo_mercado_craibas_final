using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class ProductConfiguration
        : IEntityTypeConfiguration<Product>
    {
        public void Configure(EntityTypeBuilder<Product> builder)
        {
            builder.ToTable("Product");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(250);

            builder.Property(x => x.Description)
                .HasMaxLength(1000);

            builder.Property(x => x.Price_Unit)
                .IsRequired();

            builder.Property(x => x.Origin_Price)
                .IsRequired();

         

            builder.Property(x => x.ReviewCount)
                .HasDefaultValue(0);

            builder.Property(x => x.CountSold)
                .HasDefaultValue(0);

            builder.Property(x => x.Total_Stock)
                .IsRequired();

            builder.Property(x => x.Badge)
                .HasMaxLength(100);

            builder.Property(x => x.FreeShipping)
                .HasDefaultValue(false);

            builder.Property(x => x.installments)
                .HasDefaultValue(1);

            builder.Property(x => x.Tags)
                .HasMaxLength(500);

            builder.Property(x => x.Featured)
                .HasDefaultValue(false);

            builder.Property(x => x.Cod_Cupom)
                .HasMaxLength(100);

            builder.HasOne(x => x.Product_Category)
                .WithMany(x => x.Product)
                .HasForeignKey(x => x.Id_Category)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(x => x.Imagens_Products)
                .WithOne(x => x.Product)
                .HasForeignKey(x => x.Id_Product)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.Variante_Products)
               .WithOne(x => x.Product)
               .HasForeignKey(x => x.Id_Product)
               .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.Cart_Items)
              .WithOne(x => x.Product)
              .HasForeignKey(x => x.Id_Product)
              .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.OrderLineItens)
             .WithOne(x => x.Product)
             .HasForeignKey(x => x.Id_Product)
             .OnDelete(DeleteBehavior.Restrict);

        }
    }
}