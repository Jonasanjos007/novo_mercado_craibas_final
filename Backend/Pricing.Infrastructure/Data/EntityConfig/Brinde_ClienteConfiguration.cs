using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Data.EntityConfig
{
    public class Brinde_ClienteConfiguration : IEntityTypeConfiguration<Brinde_Cliente>
    {
        public void Configure(EntityTypeBuilder<Brinde_Cliente> builder)
        {
            builder.ToTable("Brinde_Cliente");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Origem).IsRequired().HasMaxLength(30);
            builder.Property(x => x.Status).IsRequired().HasMaxLength(30);
            builder.Property(x => x.Quem_Entregou).HasMaxLength(150);

            builder.HasOne(x => x.Brinde)
                .WithMany(x => x.Brinde_Clientes)
                .HasForeignKey(x => x.Id_Brinde)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.User_Customer)
                .WithMany()
                .HasForeignKey(x => x.Id_User_Customer)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Order)
                .WithMany()
                .HasForeignKey(x => x.Id_Order)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.Id_User_Customer, x.Id_Brinde }).IsUnique();
            builder.HasIndex(x => x.Id_Order);
            builder.HasIndex(x => x.Status);
        }
    }
}
