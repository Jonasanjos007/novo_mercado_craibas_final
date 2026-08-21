using Mercado.Craibas.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Infrastructure.Data.EntityConfig
{
    public class NotificationUserConfiguration : IEntityTypeConfiguration<NotificationUser>
    {
        public void Configure(EntityTypeBuilder<NotificationUser> builder)
        {
            builder.ToTable("NotificationUsers");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.NotificationId)
                .IsRequired();

            builder.Property(x => x.UserId)
                .IsRequired();

            builder.Property(x => x.IsRead)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(x => x.ReadDate)
                .IsRequired(false);

            builder.HasIndex(x => new
            {
                x.NotificationId,
                x.UserId
            })
            .IsUnique();
            builder.Property(x => x.Role)
                .HasMaxLength(100);
        }
    }

}
