using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class OrderLineItensConfiguration
        : IEntityTypeConfiguration<OrderLineItens>
    {
        public void Configure(EntityTypeBuilder<OrderLineItens> builder)
        {
            builder.ToTable("OrderLineItens");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name_Product)
                .IsRequired()
                .HasMaxLength(250);

            builder.Property(x => x.Variante_Name)
                .HasMaxLength(100);

            builder.Property(x => x.Variante_Value)
                .HasMaxLength(100);

            builder.Property(x => x.Variante_Type)
                .HasMaxLength(100);

            builder.Property(x => x.Quantity)
                .IsRequired();

            builder.Property(x => x.Total_Price)
                .IsRequired();

            builder.Property(x => x.Origin_Price)
                .IsRequired();

            builder.Property(x => x.Price_Unit)
                .IsRequired();

            builder.Property(x => x.Id_Variante_Product)
                           .IsRequired();

            builder.Property(x => x.Discont);

            builder.HasOne(x => x.Orders)
                .WithMany(x => x.OrderLineItens)
                .HasForeignKey(x => x.Id_Order)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Product)
                .WithMany(x => x.OrderLineItens)
                .HasForeignKey(x => x.Id_Product)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}