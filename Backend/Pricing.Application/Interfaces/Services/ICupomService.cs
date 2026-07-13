using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Interfaces.Services
{
    public interface ICupomService
    {
        Task<Result<List<CupomResponse>>> GetCupomList();
    }
}
