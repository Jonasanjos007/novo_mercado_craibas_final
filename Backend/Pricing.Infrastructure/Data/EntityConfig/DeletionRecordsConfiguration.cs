using Mercado.Craibas.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Persistence.Configurations
{
    public class DeletionRecordsConfiguration : IEntityTypeConfiguration<DeletionRecords>
    {
        public void Configure(EntityTypeBuilder<DeletionRecords> builder)
        {
            builder.ToTable("DeletionRecords");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.EntityType)
                .IsRequired().HasConversion<string>().HasMaxLength(100);

            builder.Property(x => x.EntityId)
                .IsRequired();

            builder.Property(x => x.DisplayName)
                .IsRequired()
                .HasMaxLength(250);

            builder.Property(x => x.DeletedByUserName)
                .IsRequired()
                .HasMaxLength(250);

            builder.Property(x => x.DeletedAt)
                .IsRequired();

            builder.Property(x => x.DeletedByUserId)
                .IsRequired();

            builder.Property(x => x.Status)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(30);

            builder.Property(x => x.RestoredAt)
                .IsRequired(false);

            builder.Property(x => x.RestoredByUserId)
                .IsRequired(false);

            builder.Property(x => x.OwnerRole)
                .IsRequired(false)
                .HasMaxLength(50);

            builder.Property(x => x.DeletedByRole)
                .IsRequired(false)
                .HasMaxLength(50);

            builder.Property(x => x.Reason)
                .IsRequired(false)
                .HasMaxLength(500);

            builder.Property(x => x.Snapshot)
                .IsRequired(false);

            builder.Property(x => x.ParentRecordId)
                .IsRequired(false);

            builder.Property(x => x.PurgedAt)
                .IsRequired(false);

            builder.Property(x => x.PurgedByUserId)
                .IsRequired(false);

            builder.HasIndex(x => x.ParentRecordId);

            builder.HasIndex(x => new
            {
                x.Status,
                x.DeletedAt
            });

            builder.HasIndex(x => new
            {
                x.EntityType,
                x.EntityId
            });
        }
    }
}