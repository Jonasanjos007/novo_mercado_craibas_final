using Mercado.Craibas.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class Payment_TransactionsConfiguration
        : IEntityTypeConfiguration<Payment_Transactions>
    {
        public void Configure(EntityTypeBuilder<Payment_Transactions> builder)
        {
            builder.ToTable("Payment_Transactions");

            builder.HasKey(x => x.Id);

            builder.HasOne(x => x.Orders)
                .WithMany()
                .HasForeignKey(x => x.Id_Order)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.Provider).IsRequired().HasMaxLength(30);
            builder.Property(x => x.Method).IsRequired().HasMaxLength(20);
            builder.Property(x => x.Status).IsRequired().HasMaxLength(20);

            builder.Property(x => x.Provider_Status).HasMaxLength(40);
            builder.Property(x => x.Provider_Status_Detail).HasMaxLength(80);
            builder.Property(x => x.Provider_Order_Id).HasMaxLength(64);
            builder.Property(x => x.Provider_Payment_Id).HasMaxLength(64);
            builder.Property(x => x.External_Reference).IsRequired().HasMaxLength(64);
            builder.Property(x => x.Idempotency_Key).IsRequired().HasMaxLength(64);

            builder.Property(x => x.Amount).HasPrecision(18, 2);
            builder.Property(x => x.Card_Brand).HasMaxLength(30);
            builder.Property(x => x.Card_Last_Four).HasMaxLength(4);

            builder.Property(x => x.Pix_Ticket_Url).HasMaxLength(500);
            builder.Property(x => x.Error_Message).HasMaxLength(500);

            // Consultas mais comuns: pagamentos de um pedido, busca pelo id do Mercado Pago (webhook)
            // e PIX pendentes vencidos (rotina de expiração).
            builder.HasIndex(x => x.Id_Order);
            builder.HasIndex(x => x.Provider_Order_Id);
            builder.HasIndex(x => new { x.Status, x.Expires_At });
            builder.HasIndex(x => x.Idempotency_Key).IsUnique();
        }
    }
}
