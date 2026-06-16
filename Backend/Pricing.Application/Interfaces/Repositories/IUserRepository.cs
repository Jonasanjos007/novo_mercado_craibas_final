using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Baldan.Pricing.Application.Interfaces.Repositories
{
    public interface IUserRepository
    {
        //Task AddAsync(User user);
        //Task<bool> ExistsByEmailAsync(string email);
        Task<T?> GetByIdAsync<T>(int id, string CollunName) where T : class;
        Task<int> InsertAddressUserAsync<T>(T entity) where T : class;
    }
}