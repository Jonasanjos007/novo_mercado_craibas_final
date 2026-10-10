using Mercado.Craibas.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Data.EntityConfig
{
    public class UserSessionConfiguration
        : IEntityTypeConfiguration<UserSession>
    {
        public void Configure(EntityTypeBuilder<UserSession> builder)
        {
            builder.ToTable("UserSessions");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.UserId)
                .IsRequired();

            builder.Property(x => x.Role)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(x => x.RefreshTokenHash)
                .IsRequired()
                .HasMaxLength(128);

            builder.Property(x => x.DeviceName)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.DeviceType)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(x => x.UserAgent)
                .IsRequired(false)
                .HasMaxLength(500);

            builder.Property(x => x.IpAddress)
                .IsRequired(false)
                .HasMaxLength(64);

            builder.Property(x => x.LastUsedAt)
                .IsRequired();

            builder.Property(x => x.ExpiresAt)
                .IsRequired();

            builder.Property(x => x.RevokedAt)
                .IsRequired(false);

            builder.Property(x => x.RevokedReason)
                .IsRequired(false)
                .HasConversion<string>()
                .HasMaxLength(50);

            // Busca do refresh (cada token é único)
            builder.HasIndex(x => x.RefreshTokenHash)
                .IsUnique();

            // Lista de dispositivos do usuário / derrubar todas as sessões
            builder.HasIndex(x => new
            {
                x.UserId,
                x.Role
            });
        }
    }
}
