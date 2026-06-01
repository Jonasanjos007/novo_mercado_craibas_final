using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Interfaces.Repositories
{
    public interface IProductRepository
    {
        Task<List<T>> GetAllProductAsyncList<T>() where T : class;
        Task<List<T>> GetAllVariantAsyncListById<T>(int id) where T : class;

    }
}
