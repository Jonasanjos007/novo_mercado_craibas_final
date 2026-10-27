using Mercado.Craibas.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Data.EntityConfig
{
    public class DeliveryPayoutConfiguration
        : IEntityTypeConfiguration<DeliveryPayout>
    {
        public void Configure(EntityTypeBuilder<DeliveryPayout> builder)
        {
            builder.ToTable("DeliveryPayouts");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Mode)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(x => x.Total)
                .IsRequired();

            builder.Property(x => x.PaidAt)
                .IsRequired();

            builder.Property(x => x.PaidById)
                .IsRequired();

            builder.Property(x => x.Note)
                .IsRequired(false)
                .HasMaxLength(500);

            builder.Property(x => x.ReversedReason)
                .IsRequired(false)
                .HasMaxLength(500);

            builder.HasOne(x => x.User_Delivery)
                .WithMany()
                .HasForeignKey(x => x.Id_User_Delivery)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(x => x.Items)
                .WithOne(x => x.DeliveryPayout)
                .HasForeignKey(x => x.Id_DeliveryPayout)
                .OnDelete(DeleteBehavior.Cascade);

            // Baixas de um entregador
            builder.HasIndex(x => x.Id_User_Delivery);
        }
    }

    public class DeliveryPayoutItemConfiguration
        : IEntityTypeConfiguration<DeliveryPayoutItem>
    {
        public void Configure(EntityTypeBuilder<DeliveryPayoutItem> builder)
        {
            builder.ToTable("DeliveryPayoutItems");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Amount)
                .IsRequired();

            builder.Property(x => x.ReferenceDate)
                .IsRequired();

            builder.Property(x => x.Id_Order)
                .IsRequired(false);

            builder.Property(x => x.WorkDate)
                .IsRequired(false)
                .HasColumnType("date");

            builder.HasOne(x => x.Order)
                .WithMany()
                .HasForeignKey(x => x.Id_Order)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.Id_Order);

            builder.Property(x => x.Is_Return_Pickup)
                .IsRequired()
                .HasDefaultValue(false);
        }
    }
}
