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
    public class CouponUseConfiguration
     : IEntityTypeConfiguration<Coupon_Use>
    {
        public void Configure(EntityTypeBuilder<Coupon_Use> builder)
        {
            builder.ToTable("Coupon_Use");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Discount_Value)
                .HasColumnType("decimal(18,2)");

            builder.HasOne(x => x.Cupom)
                .WithMany(x => x.Coupon_Uses)
                .HasForeignKey(x => x.Id_Cupom);

            builder.HasOne(x => x.Order)
                .WithMany(x => x.Coupon_Uses)
                .HasForeignKey(x => x.Id_Order);

            builder.HasOne(x => x.User_Customer)
                .WithMany(x => x.Coupon_Uses)
                .HasForeignKey(x => x.Id_User);
        }
    }
}
