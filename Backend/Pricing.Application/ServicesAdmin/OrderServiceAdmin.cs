using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.InterfacesAdmin;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.EntityFrameworkCore;
using Pricing.Api.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;

namespace Mercado.Craibas.Application.ServicesAdmin
{
    public class OrderServiceAdmin : IOrderAdminService
    {
        private readonly IUnitOfWorkAdmin _unitOfWorkAdmin;
        public OrderServiceAdmin(IUnitOfWorkAdmin unitOfWorkAdmin)
        {
            _unitOfWorkAdmin = unitOfWorkAdmin;
        }

        public async Task<Result<List<OrderResponse>>> GetOrderAllListAdmin()
        {
            var OrderResponseList = new List<OrderResponse>();

            var orderResponseList = await _unitOfWorkAdmin.Query<Orders>()
         .OrderByDescending(x => x.InsertDate)
         .Select(x => new OrderResponse
         {
             Id_Order = x.Id,
             Number_Order = x.Number_Order,
             Total_Value_Order = x.Total_Value_Order,
             Status_Pay = x.Status_Pay,
             Order_Status = x.Order_Status,
             Payment_terms = x.Payment_terms,
             InsertDate = x.InsertDate,
             Estimated_Delivery_Date = x.Estimated_Delivery_Date,
             Discont = x.Discont,
             Quantity = x.OrderLineItens.Sum(i => i.Quantity),
             Category = x.OrderLineItens.Select(i => i.Product.Product_Category.Category).FirstOrDefault(),
             Address = new AddressResponse
             {
                 Id = x.Address.Id,
                 Name = x.Address.Name,
                 Road = x.Address.Road,
                 Number = x.Address.Number,
                 Neighborhood = x.Address.Neighborhood,
                 Supplement = x.Address.Supplement,
                 ReferencePoint = x.Address.ReferencePoint,
                 Standard = x.Address.Standard,
                 City = x.Address.City
             },

             Products = x.OrderLineItens.Select(i => new ProductResponse
             {
                 Id = i.Product.Id,
                 Name = i.Product.Name,
                 Description = i.Product.Description,
                 Price_Unic = i.Price_Unit,
                 Origin_Price = i.Origin_Price,
                 Quantity = i.Quantity,
                 Count_Rating = i.Product.Rating,
                 Review_Count = i.Product.ReviewCount,
                 Count_Sold = i.Product.CountSold,
                 Total_Stock = i.Product.Total_Stock,
                 Badge = i.Product.Badge,
                 FreeShipping = i.Product.FreeShipping,
                 Installments = i.Product.installments,
                 Tags = i.Product.Tags,
                 Featured = i.Product.Featured,
                 Imagens = i.Product.Imagens_Products.ToList(),
                 variations = i.Product.Variante_Products.ToList()
             }).ToList()
         }).ToListAsync();

            return Result<List<OrderResponse>>.Success(orderResponseList);

        }

        public async Task<Result<List<Logs>>> GetAlllogs()
        {
            var logs = await _unitOfWorkAdmin.GetClassListAsyncWhere<Logs>(x => x.InsertDate >= DateTime.Now.AddMonths(-6));

            if (logs == null)
            {
                return Result<List<Logs>>.Failure(Error.Failure("Logs", "Erro ao Carregar Logs!"));
            }

            return Result<List<Logs>>.Success(logs);
        }
       public async Task<Result<List<Product_Category>>> GetAllCategory()
        {
            var Categorys = await _unitOfWorkAdmin.GetClassListAsyncWhere<Product_Category>(x => x.Isdelete != true && x.Ativo == true);

            if (Categorys == null)
            {
                return Result<List<Product_Category>>.Failure(Error.Failure("Categorys", "Erro ao Carregar Categorys!"));
            }

           return Result<List<Product_Category>>.Success(Categorys);
       }

        public async Task<Result<bool>> PostUpdateStatusOrder(int Id_Order,string NewStatus)
        {
            var Update_StatusOrder = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Orders>(filters: new Dictionary<string, object>
                        {
                                { "Id", Id_Order }
                        },

                      fieldsToUpdate: new Dictionary<string, object>
                      {
                             {"Order_Status",NewStatus }
                         
                       });

            if (Update_StatusOrder == null)
            {
                return Result<bool>.Failure(Error.Failure("Status", "Erro ao atualizar status!"));
            }

            return Result<bool>.Success(true);
        }
    }
}
