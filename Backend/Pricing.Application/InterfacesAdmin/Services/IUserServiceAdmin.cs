using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.InterfacesAdmin.Services
{
    public interface IUserServiceAdmin
    {
        Task<Result<bool>> PostEditeUserAdmin(UserAdminRequest User, int IdUser);
        Task<Result<bool>> PostEditeTemaAdmin(bool Tema, int IdUser);
    }
}
