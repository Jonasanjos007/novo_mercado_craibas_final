using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.InterfacesAdmin.Services
{
    public interface IProductServiceAdmin
    {
        Task<Result<bool>> PostSaveProduct(ProductRequest product);
        Task<Result<bool>> PostEditProduct(ProductRequest product);

    }
}
