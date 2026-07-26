using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Mercado.Craibas.Infrastructure.Data.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Pricing.Infrastructure.Repositories
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
        public async Task<bool> UpdateFieldsAsync<T>(Dictionary<string, object> filters, Dictionary<string, object> fieldsToUpdate) where T : class
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
        public async Task<bool> DeleteAllByColumnAsync<T>(string columnName, object value) where T : class
        {
            var entities = await _context.Set<T>()
                .Where(x => EF.Property<object>(x, columnName).Equals(value))
                .ToListAsync();

            if (!entities.Any())
                return false;

            _context.Set<T>().RemoveRange(entities);
            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<T> InsertAsyncReturnId<T>(T entity) where T : EntityBase
        {
            await _context.Set<T>().AddAsync(entity);
            await _context.SaveChangesAsync();

            return entity;
        }
        public IQueryable<T> Query<T>() where T : class
        {
            return _context.Set<T>().AsQueryable();
        }

        public async Task<T?> GetClassByIdAnyType<T, TValue>(TValue value, string columnName) where T : class
        {
            return await _context.Set<T>()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => EF.Property<TValue>(x, columnName)!.Equals(value));
        }
        public async Task<List<T>> GetClassListAsyncWhere<T>(Expression<Func<T, bool>>? predicate = null) where T : class
        {
            IQueryable<T> query = _context.Set<T>().AsNoTracking();

            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            return await query.ToListAsync();
        }
        public async Task<T?> GetClassAsyncWhere<T>(Expression<Func<T, bool>> predicate) where T : class
        {
            return await _context.Set<T>()
                .AsNoTracking()
                .FirstOrDefaultAsync(predicate);
        }
    }
}
