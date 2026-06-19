using System;
using System.Collections.Generic;
using System.Linq;
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
    }
}