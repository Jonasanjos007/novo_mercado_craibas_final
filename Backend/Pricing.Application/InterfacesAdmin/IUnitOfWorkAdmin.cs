using Baldan.Pricing.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
namespace Mercado.Craibas.Application.InterfacesAdmin
{
    public interface IUnitOfWorkAdmin
    {
        Task<List<T>> GetClassListAsyncWhere<T>(Expression<Func<T, bool>>? predicate = null) where T : class;
        IQueryable<T> Query<T>() where T : class;
        Task<List<T>> GetAllEntityAsyncList<T>() where T : class;
        Task<T> InsertAsyncReturnObjeto<T>(T entity) where T : EntityBase;
        Task<bool> DeleteAllByColumnAsync<T>(string columnName, object value) where T : class;
        Task<bool> UpdateFieldsAsyncEntity<T>(Dictionary<string, object> filters, Dictionary<string, object> fieldsToUpdate) where T : class;
        Task<T?> GetClassById<T, TValue>(TValue value, string columnName)where T : class;
        Task<List<T>> GetClassListById<T>(int id, string columnName) where T : class;
        Task<T?> GetClassAsyncWhere<T>(Expression<Func<T, bool>> predicate) where T : class;
        string GetImagesFolder(string subPasta);

    }
}
