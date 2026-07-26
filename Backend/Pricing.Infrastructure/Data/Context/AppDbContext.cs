using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace Mercado.Craibas.Infrastructure.Data.Context;

using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;


public class AppDbContext : DbContext
{
    public DbSet<Address> Address => Set<Address>();
    public DbSet<Logs> Logs => Set<Logs>();
    public DbSet<Cart> Cart => Set<Cart>();
    public DbSet<Cart_Item> Cart_Item => Set<Cart_Item>();
    public DbSet<Cupom> Cupom => Set<Cupom>();
    public DbSet<Customize_Admin> Customize_Admin => Set<Customize_Admin>();
    public DbSet<Customize_Cliente> Customize_Cliente => Set<Customize_Cliente >();
    public DbSet<Imagens_Products> Imagens_Products => Set<Imagens_Products>();
    public DbSet<OrderLineItens> OrderLineItens => Set<OrderLineItens>();
    public DbSet<Orders> Orders => Set<Orders>();
    public DbSet<Product> Product => Set<Product>();
    public DbSet<Product_Category> Product_Category => Set<Product_Category>();
    public DbSet<Rating> Rating => Set<Rating>();
    public DbSet<User_Admin> User_Admin => Set<User_Admin>();
    public DbSet<User_Customer> User_Customer => Set<User_Customer>();
    public DbSet<User_Delivery> User_Delivery => Set<User_Delivery>();
    public DbSet<Variante_Products> Variante_Products => Set<Variante_Products>();
    public DbSet<BaseRates> BaseRates => Set<BaseRates>();
    public DbSet<Coupon_Category> Coupon_Category => Set<Coupon_Category>();
    public DbSet<Coupon_Product> Coupon_Product => Set<Coupon_Product>();
    public DbSet<Coupon_Use> Coupon_Use => Set<Coupon_Use>();


   
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly (typeof(AppDbContext).Assembly);
    }
}


