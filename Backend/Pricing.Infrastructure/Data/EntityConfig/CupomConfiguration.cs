using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class CupomConfiguration
        : IEntityTypeConfiguration<Cupom>
    {
        public void Configure(EntityTypeBuilder<Cupom> builder)
        {
            builder.ToTable("Cupom");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name_Cupom)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.Cod_Cupom)
                .IsRequired();

            builder.Property(x => x.Descriotion)
                .HasMaxLength(500);

            builder.Property(x => x.Discont)
                .IsRequired();

            builder.Property(x => x.Minimum_Value)
                .IsRequired();

            builder.Property(x => x.Active)
                .IsRequired();

            builder.HasMany(x => x.Orders)
                .WithOne(x => x.Cupom)
                .HasForeignKey(x => x.Id_Cupom)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}