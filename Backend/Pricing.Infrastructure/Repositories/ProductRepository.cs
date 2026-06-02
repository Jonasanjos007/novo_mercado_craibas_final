using Baldan.Pricing.Application.Domain.Enums;
using Baldan.Pricing.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.Interfaces.Repositories;
using Mercado.Craibas.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Infrastructure.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly AppDbContext _context;
        public ProductRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<T>> GetAllProductAsyncList<T>() where T : class
        {
            return await _context.Set<T>().AsNoTracking().ToListAsync();
        }

        public async Task<List<T>> GetAllVariantAsyncListById<T>(int id, string columnName) where T : class
        {
            return await _context.Set<T>()
                .AsNoTracking()
                .Where(x => EF.Property<int>(x, columnName) == id)
                .ToListAsync();
        }
        public async Task<T?> GetVariantByIdAsync<T>(int id, string columnName) where T : class
        {
            return await _context.Set<T>()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => EF.Property<int>(x, columnName) == id);
        }
    }
}
