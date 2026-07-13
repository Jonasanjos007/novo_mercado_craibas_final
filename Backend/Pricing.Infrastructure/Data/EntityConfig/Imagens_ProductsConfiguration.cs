using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class ImagensProductsConfiguration
        : IEntityTypeConfiguration<Imagens_Products>
    {
        public void Configure(EntityTypeBuilder<Imagens_Products> builder)
        {
            builder.ToTable("Imagens_Products");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Url_Imagem)
                .IsRequired()
                .HasMaxLength(500);

            builder.HasOne(x => x.Product)
                .WithMany(x => x.Imagens_Products)
                .HasForeignKey(x => x.Id_Product)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}