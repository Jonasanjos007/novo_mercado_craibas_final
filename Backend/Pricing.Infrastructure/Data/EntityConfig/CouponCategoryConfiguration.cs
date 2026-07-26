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
    public class CouponCategoryConfiguration
     : IEntityTypeConfiguration<Coupon_Category>
    {
        public void Configure(EntityTypeBuilder<Coupon_Category> builder)
        {
            builder.ToTable("Coupon_Category");

            builder.HasKey(x => x.Id);

            builder.HasOne(x => x.Cupom)
                .WithMany(x => x.Coupon_Categories)
                .HasForeignKey(x => x.Id_Cupom);

            builder.HasOne(x => x.Product_Category)
                .WithMany(x => x.Coupon_Categories)
                .HasForeignKey(x => x.Id_Category);


        }
    }
}
