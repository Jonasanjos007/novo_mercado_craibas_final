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
    public class CouponProductConfiguration
      : IEntityTypeConfiguration<Coupon_Product>
    {
        public void Configure(EntityTypeBuilder<Coupon_Product> builder)
        {
            builder.ToTable("Coupon_Product");

            builder.HasKey(x => x.Id);

            builder.HasOne(x => x.Cupom)
                .WithMany(x => x.Coupon_Products)
                .HasForeignKey(x => x.Id_Cupom);

            builder.HasOne(x => x.Product)
                .WithMany(x => x.Coupon_Products)
                .HasForeignKey(x => x.Id_Product);

        }
    }
}
