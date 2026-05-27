using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mercado.Craibas.Infrastructure.Configurations
{
    public class RatingConfiguration
        : IEntityTypeConfiguration<Rating>
    {
        public void Configure(EntityTypeBuilder<Rating> builder)
        {
            builder.ToTable("Rating");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Ranting)
                .IsRequired();

            builder.Property(x => x.Comment)
                .HasMaxLength(1000);

            builder.HasOne(x => x.Product)
                .WithMany(x => x.Ratings)
                .HasForeignKey(x => x.Id_Product)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.User_Customer)
                .WithMany(x => x.Ratings)
                .HasForeignKey(x => x.Id_User_Customer)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}