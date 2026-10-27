using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class OrdersConfiguration
        : IEntityTypeConfiguration<Orders>
    {
        public void Configure(EntityTypeBuilder<Orders> builder)
        {
            builder.ToTable("Orders");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Number_Order)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.Total_Value_Order)
                .IsRequired();

            builder.Property(x => x.Discont)
                .IsRequired();
          

            builder.Property(x => x.Discont_Percentage)
                .IsRequired();

            builder.HasOne(x => x.Cupom)
                .WithMany(x => x.Orders)
                .HasForeignKey(x => x.Id_Cupom)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Cupom)
                .WithMany(x => x.Orders)
                .HasForeignKey(x => x.Id_Cupom)
                .OnDelete(DeleteBehavior.Restrict);


            builder.HasOne(x => x.User_Customer)
                .WithMany(x => x.Orders)
                .HasForeignKey(x => x.Id_User_Customer)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.Order_Status)
                .IsRequired(false);

            builder.HasOne(x => x.Address)
                .WithMany(x => x.Orders)
                .HasForeignKey(x => x.Id_Address)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Address)
               .WithMany(x => x.Orders)
               .HasForeignKey(x => x.Id_Address)
               .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.User_Delivery)
               .WithMany(x => x.Orders)
               .HasForeignKey(x => x.Id_User_Delivery)
               .OnDelete(DeleteBehavior.Restrict);

            // Admin que entrega ele mesmo
            builder.HasOne(x => x.User_Admin_Delivery)
               .WithMany()
               .HasForeignKey(x => x.Id_User_Admin_Delivery)
               .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(x => x.OrderLineItens)
               .WithOne(x => x.Orders)
               .HasForeignKey(x => x.Id_Order)
               .OnDelete(DeleteBehavior.Cascade);

            builder.Property(x => x.NotifyViaWhatsApp)
               .IsRequired()
               .HasDefaultValue(false);

            // Cancelamento e devolução
            builder.Property(x => x.Cancel_Reason).HasMaxLength(500);
            builder.Property(x => x.Canceled_By).HasMaxLength(20);
            builder.Property(x => x.Return_Status).HasMaxLength(30);
            builder.Property(x => x.Return_Reason).HasMaxLength(500);
            builder.Property(x => x.Return_Admin_Note).HasMaxLength(500);
            builder.HasIndex(x => x.Return_Status);
            builder.Property(x => x.Cancel_Status).HasMaxLength(20);
            builder.Property(x => x.Cancel_Admin_Note).HasMaxLength(500);
            builder.HasIndex(x => x.Cancel_Status);

            // Coleta da devolução
            builder.Property(x => x.Return_WhoHanded).HasMaxLength(100);
            builder.HasOne(x => x.Return_User_Delivery)
               .WithMany()
               .HasForeignKey(x => x.Return_Id_User_Delivery)
               .OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.Return_User_Admin_Delivery)
               .WithMany()
               .HasForeignKey(x => x.Return_Id_User_Admin_Delivery)
               .OnDelete(DeleteBehavior.Restrict);


        }
    }
}