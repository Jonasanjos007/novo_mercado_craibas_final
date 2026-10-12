using Mercado.Craibas.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Data.EntityConfig
{
    public class DeliverySettingsConfiguration
        : IEntityTypeConfiguration<DeliverySettings>
    {
        public void Configure(EntityTypeBuilder<DeliverySettings> builder)
        {
            builder.ToTable("DeliverySettings");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.TipEnabled)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(x => x.Mode)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(x => x.OrderValueType)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(x => x.OrderValue)
                .IsRequired();

            builder.Property(x => x.DailyValue)
                .IsRequired();

            builder.Property(x => x.CountFrom)
                .IsRequired(false);
        }
    }
}
