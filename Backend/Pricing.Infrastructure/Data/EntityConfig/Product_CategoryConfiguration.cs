using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class ProductCategoryConfiguration
        : IEntityTypeConfiguration<Product_Category>
    {
        public void Configure(EntityTypeBuilder<Product_Category> builder)
        {
            builder.ToTable("Product_Category");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Category)
                .IsRequired()
                .HasMaxLength(150);

            builder.HasMany(x => x.Product)
                .WithOne(x => x.Product_Category)
                .HasForeignKey(x => x.Id_Category)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}