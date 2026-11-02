using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class VarianteAtributosConfiguration
        : IEntityTypeConfiguration<Variante_Atributos>
    {
        public void Configure(EntityTypeBuilder<Variante_Atributos> builder)
        {
            builder.ToTable("Variante_Atributos");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Eixo).IsRequired().HasMaxLength(100);
            builder.Property(x => x.Valor).IsRequired().HasMaxLength(100);
            builder.HasOne(x => x.Variante)
                .WithMany(x => x.Atributos)
                .HasForeignKey(x => x.Id_Variante)
                .OnDelete(DeleteBehavior.Cascade);
            builder.HasIndex(x => x.Id_Variante);
        }
    }
}
