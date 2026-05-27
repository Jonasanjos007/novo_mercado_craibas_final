//using Baldan.Pricing.Application.Commons;
//using Baldan.Pricing.Application.Interfaces.Repositories;
//using Baldan.Pricing.Application.Models.Entities;
//using Mercado.Craibas.Infrastructure.Data.Context;
//using Microsoft.EntityFrameworkCore;

//public class UserRepository : IUserRepository
//{
//    private readonly AppDbContext _context;

//    public UserRepository(AppDbContext context)
//    {
//        _context = context;
//    }

//    public async Task AddAsync(User user)
//    {
//        await _context.Users.AddAsync(user);
//    }

//    public async Task<bool> ExistsByEmailAsync(string email)
//    {
//        return await _context.Users
//            .AsNoTracking()
//            .AnyAsync(u => u.Email == email);
//    }

//    public async Task<User?> GetByIdAsync(int id)
//    {
//        return await _context.Users
//            .AsNoTracking()
//            .FirstOrDefaultAsync(u => u.Id == id);
//    }
//}
