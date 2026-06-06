using Baldan.Pricing.Application.Domain.Enums;
using Baldan.Pricing.Application.Interfaces;
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
        private readonly IUnitOfWork _UnitOfWorkRepository;


        public ProductRepository(AppDbContext context, IUnitOfWork unitOfWorkRepository)
        {
            _context = context;
            _UnitOfWorkRepository = unitOfWorkRepository;
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
        public async Task<int> InsertCartProductAsync<T>(T entity) where T : class
        {
            await _context.Set<T>().AddAsync(entity);

            return await _context.SaveChangesAsync();
        }
        public async Task<bool> DeleteByColumnAsync<T>(string columnName,object value) where T : class
        {
            var entity = await _context.Set<T>().FirstOrDefaultAsync(x => EF.Property<object>(x, columnName).Equals(value));
            if (entity == null)
                return false;
            _context.Set<T>().Remove(entity);
            await _UnitOfWorkRepository.CommitAsync();
            return true;
        }
    }
}
