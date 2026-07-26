using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class CupomConfiguration : IEntityTypeConfiguration<Cupom>
    {
        public void Configure(EntityTypeBuilder<Cupom> builder)
        {
            builder.ToTable("Cupom");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name_Cupom)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.Cod_Cupom)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(x => x.Cod_Cupom)
                .IsUnique();

            builder.Property(x => x.Description)
                .HasMaxLength(500);

            builder.Property(x => x.Discount)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.Property(x => x.Discount_Type)
                .HasConversion<int>()
                .IsRequired();

            builder.Property(x => x.Active)
                .IsRequired();

            builder.Property(x => x.Minimum_Value)
                .HasColumnType("decimal(18,2)");

            builder.Property(x => x.Maximum_Discount)
                .HasColumnType("decimal(18,2)");

            builder.Property(x => x.Quantity_Uses);

            builder.Property(x => x.Quantity_Used);

            builder.Property(x => x.Per_User_Limit);

            builder.Property(x => x.First_Order_Only);

            builder.Property(x => x.Date_Start);

            builder.Property(x => x.Date_End);

            builder.HasMany(x => x.Orders)
                .WithOne(x => x.Cupom)
                .HasForeignKey(x => x.Id_Cupom)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}