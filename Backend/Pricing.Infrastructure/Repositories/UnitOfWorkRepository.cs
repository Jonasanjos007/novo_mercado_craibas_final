using Baldan.Pricing.Application.Interfaces;
using Mercado.Craibas.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Infrastructure.Repositories
{
    public class UnitOfWorkRepository : IUnitOfWork
    {
        private readonly AppDbContext _context;

        public UnitOfWorkRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task CommitAsync()
        {
            await _context.SaveChangesAsync();
        }
        public async Task<List<T>> GetClassListById<T>(int id, string columnName) where T : class
        {
            return await _context.Set<T>()
                .AsNoTracking()
                .Where(x => EF.Property<int>(x, columnName) == id)
                .ToListAsync();
        }
        public async Task<T?> GetClassById<T>(int id, string columnName) where T : class
        {
            return await _context.Set<T>()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => EF.Property<int>(x, columnName) == id);
        }
        public async Task<bool> UpdateFieldsAsync<T>(Dictionary<string, object> filters,Dictionary<string, object> fieldsToUpdate) where T : class
        {
            IQueryable<T> query = _context.Set<T>();

            foreach (var filter in filters)
            {
                var column = filter.Key;
                var value = filter.Value;

                query = query.Where(x =>
                    EF.Property<object>(x, column).Equals(value));
            }

            var entities = await query.ToListAsync();

            if (!entities.Any())
                return false;

            foreach (var entity in entities)
            {
                foreach (var field in fieldsToUpdate)
                {
                    var property = typeof(T).GetProperty(field.Key);

                    if (property == null)
                        continue;

                    var convertedValue =
                        field.Value == null
                        ? null
                        : Convert.ChangeType(
                            field.Value,
                            Nullable.GetUnderlyingType(property.PropertyType)
                            ?? property.PropertyType
                        );

                    property.SetValue(entity, convertedValue);
                }
            }

            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<bool> DeleteByColumnAsyncGlolbal<T>(string columnName, object value) where T : class
        {
            var entity = await _context.Set<T>().FirstOrDefaultAsync(x => EF.Property<object>(x, columnName).Equals(value));
            if (entity == null)
                return false;
            _context.Set<T>().Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
