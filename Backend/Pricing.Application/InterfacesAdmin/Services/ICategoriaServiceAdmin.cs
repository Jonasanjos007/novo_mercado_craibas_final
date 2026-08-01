using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.InterfacesAdmin.Services
{
    public interface ICategoriaServiceAdmin
    {
        Task<Result<bool>> PostSaveCategory(CategoryRequest category);
        Task<Result<bool>> UpdateCategory(CategoryRequest category);
        Task<Result<bool>> DeleteCategory(DeleteCategoryRequest request);
    }
}
