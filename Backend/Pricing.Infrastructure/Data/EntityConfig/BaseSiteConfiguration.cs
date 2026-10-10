using Mercado.Craibas.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Persistence.Configurations
{
    public class BaseSiteConfiguration : IEntityTypeConfiguration<BaseSite>
    {
        public void Configure(EntityTypeBuilder<BaseSite> builder)
        {
            builder.ToTable("BaseSite");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.StoreName)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.PhoneSupport)
               .IsRequired()
               .HasMaxLength(150);

            builder.Property(x => x.StoreImage)
                .HasMaxLength(500);

            builder.Property(x => x.StoreImageIcone)
               .HasMaxLength(500);
        }
    }
}