using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Data.EntityConfig
{
    public class BannerConfiguration : IEntityTypeConfiguration<Banner>
    {
        public void Configure(EntityTypeBuilder<Banner> builder)
        {
            builder.ToTable("Banner");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Imagem).IsRequired().HasMaxLength(300);
            builder.Property(x => x.Link).HasMaxLength(500);
            builder.HasIndex(x => x.Ativo);
            builder.HasIndex(x => x.Ordem);
        }
    }
}
