using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Data.EntityConfig
{
    public class DespesaConfiguration : IEntityTypeConfiguration<Despesa>
    {
        public void Configure(EntityTypeBuilder<Despesa> builder)
        {
            builder.ToTable("Despesa");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Descricao).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Categoria).HasMaxLength(100);
            builder.HasIndex(x => x.Data);
            builder.HasIndex(x => x.Categoria);
        }
    }
}
