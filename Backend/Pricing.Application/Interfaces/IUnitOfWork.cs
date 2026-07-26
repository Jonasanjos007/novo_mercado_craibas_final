using Baldan.Pricing.Application.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
namespace Baldan.Pricing.Application.Interfaces
{
    public interface IUnitOfWork
    {
        Task CommitAsync();
        Task<List<T>> GetClassListById<T>(int id, string columnName) where T : class;
        Task<T?> GetClassById<T>(int id, string columnName) where T : class;
        Task<bool> UpdateFieldsAsync<T>(Dictionary<string, object> filters, Dictionary<string, object> fieldsToUpdate) where T : class;
        Task<bool> DeleteByColumnAsyncGlolbal<T>(string columnName, object value) where T : class;
        Task<T> InsertAsyncReturnId<T>(T entity) where T : EntityBase;
        IQueryable<T> Query<T>() where T : class;
        Task<bool> DeleteAllByColumnAsync<T>(string columnName, object value) where T : class;
        Task<T?> GetClassByIdAnyType<T, TValue>(TValue value, string columnName) where T : class;
        Task<T?> GetClassAsyncWhere<T>(Expression<Func<T, bool>> predicate) where T : class;
   
           Task<List<T>> GetClassListAsyncWhere<T>(Expression<Func<T, bool>>? predicate = null) where T : class;
    }
}