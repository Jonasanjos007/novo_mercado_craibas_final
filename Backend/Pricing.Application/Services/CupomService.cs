using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Baldan.Pricing.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.Interfaces.Services;
using Pricing.Api.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Services
{
    public class CupomService : ICupomService
    {
        private readonly IUnitOfWork _unitOfWork;

        public CupomService(IUserRepository userRepository, IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<Result<List<CupomResponse>>> GetCupomList()
        {
            var Cupons = await _unitOfWork.GetClassListById<Cupom>(1, "Active");

            if (Cupons == null || !Cupons.Any())
            {
                return Result<List<CupomResponse>>.Failure(Error.Failure("Cupom", "Cupons não encontrados!"));
            }

            var ListCupons = new List<CupomResponse>();

            foreach (var Cupom in Cupons)
            {




                ListCupons.Add(new CupomResponse
                {
                    Id = Cupom.Id,
                    Name_Cupom = Cupom.Name_Cupom,
                    Cod_Cupom = Cupom.Cod_Cupom,
                    Descriotion = Cupom.Descriotion,
                    Discont = Cupom.Discont,
                    Active = Cupom.Active,
                    Date_Start = Cupom.Date_Start,
                    Date_end = Cupom.Date_end,
                    Minimum_Value = Cupom.Minimum_Value
                });
            }
            return Result<List<CupomResponse>>.Success(ListCupons);
        }
    }
}
