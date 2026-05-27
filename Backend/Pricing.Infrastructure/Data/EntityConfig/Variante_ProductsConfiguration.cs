using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class VarianteProductsConfiguration
        : IEntityTypeConfiguration<Variante_Products>
    {
        public void Configure(EntityTypeBuilder<Variante_Products> builder)
        {
            builder.ToTable("Variante_Products");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.Value)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.Type)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(x => x.Stoke)
                .IsRequired();

            builder.Property(x => x.Price_Modifier)
                .HasDefaultValue(0);

            builder.HasOne(x => x.Product)
                .WithMany(x => x.Variante_Products)
                .HasForeignKey(x => x.Id_Product)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}