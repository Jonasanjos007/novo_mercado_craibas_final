using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces.Repositories;
using Mercado.Craibas.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;
using Pricing.Api.DTOs.Responses;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    //public async Task AddAsync(User user)
    //{
    //    await _context.Users.AddAsync(user);
    //}

    //public async Task<bool> ExistsByEmailAsync(string email)
    //{
    //    return await _context.Users
    //        .AsNoTracking()
    //        .AnyAsync(u => u.Email == email);
    //}
    public async Task<T?> GetByIdAsync<T>(int id,string CollunName)
      where T : class
    {
        return await _context.Set<T>()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => EF.Property<int>(x, CollunName) == id);
    }
    //public async Task<User_Admin?> GetByIdAsyncAdmin(int id)
    //{
    //    return await _context.User_Admin
    //        .AsNoTracking()
    //        .FirstOrDefaultAsync(u => u.Id == id);
    //}
    //public async Task<User_Customer?> GetByIdAsyncCustomer(int id)
    //{
    //    return await _context.User_Customer
    //        .AsNoTracking()
    //        .FirstOrDefaultAsync(u => u.Id == id);
    //}
    //public async Task<User_Delivery?> GetByIdAsyncDelivery(int id)
    //{
    //    return await _context.User_Delivery
    //        .AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
    //}
}
