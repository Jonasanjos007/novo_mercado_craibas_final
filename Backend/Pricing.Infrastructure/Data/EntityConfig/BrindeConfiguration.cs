using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Data.EntityConfig
{
    public class BrindeConfiguration : IEntityTypeConfiguration<Brinde>
    {
        public void Configure(EntityTypeBuilder<Brinde> builder)
        {
            builder.ToTable("Brinde");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Nome).IsRequired().HasMaxLength(150);
            builder.Property(x => x.Descricao).HasMaxLength(500);
            builder.Property(x => x.Imagem).HasMaxLength(300);
            builder.Property(x => x.Colecao).HasMaxLength(150);
            builder.HasIndex(x => x.Quantidade_Compras);
            builder.HasIndex(x => x.Colecao);
        }
    }
}
