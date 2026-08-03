using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Baldan.Pricing.Application.Interfaces.Repositories;
using Baldan.Pricing.Application.Models.Enums;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.Interfaces.Services;
using Microsoft.EntityFrameworkCore;
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
                    Description = Cupom.Description,
                    Discont = Cupom.Discount,
                    Active = Cupom.Active,
                    Show_Flash_Offer = Cupom.Show_Flash_Offer,
                    Date_Start = Cupom.Date_Start,
                    Date_end = Cupom.Date_End,
                    Minimum_Value = Cupom.Minimum_Value,
                    Quantity_Used = Cupom.Quantity_Used,
                    Quantity_Uses = Cupom.Quantity_Uses,

                });
            }
            return Result<List<CupomResponse>>.Success(ListCupons);
        }


        public async Task<Result<bool>> ApplyCupom(string Cod_upom, int userId)
        {
            // Busca cupom
            var cupom = await _unitOfWork.GetClassByIdAnyType<Cupom, string>(Cod_upom, "Cod_Cupom");

            if (cupom == null)
                return Result<bool>.Failure(Error.Failure("Cupom", "Código inválido."));

            // Ativo
            if (!cupom.Active)
                return Result<bool>.Failure(Error.Failure("Cupom", "Cupom inativo."));

            // Ainda não iniciou
            if (DateTime.Now < cupom.Date_Start)
                return Result<bool>.Failure(Error.Failure("Cupom", "Este cupom ainda não iniciou."));

            // Expirado
            if (DateTime.Now > cupom.Date_End)
                return Result<bool>.Failure(Error.Failure("Cupom", "Este cupom expirou."));

            // Quantidade total
            if (cupom.Quantity_Used >= cupom.Quantity_Uses)
                return Result<bool>.Failure(Error.Failure("Cupom", "Cupom esgotado."));

            // Utilizações do usuário
            var couponUses = await _unitOfWork.Query<Coupon_Use>().Where(x => x.Id_Cupom == cupom.Id && x.Id_User == userId).ToListAsync();

            // Primeira compra
            if (cupom.First_Order_Only)
            {
                var hasOrders = await _unitOfWork.Query<Orders>().AnyAsync(x => x.Id_User_Customer == userId && x.Id_Cupom == cupom.Id && x.Isdelete != true);

                if (hasOrders)
                    return Result<bool>.Failure(Error.Failure("Cupom", "Cupom válido apenas para primeira compra."));
            }

            // Limite por usuário
            if (couponUses.Count >= cupom.Per_User_Limit)
                return Result<bool>.Failure(Error.Failure("Cupom", "Você atingiu o limite de utilizações."));

            var cart = await _unitOfWork.GetClassById<Cart>(userId, "Id_User_Customer");

            if (cart == null)
                return Result<bool>.Failure(Error.Failure("Carrinho", "Carrinho vazio."));

            var cartItems = await _unitOfWork.Query<Cart_Item>().Where(x => x.Id_Cart == cart.Id).Include(x => x.Product).ThenInclude(x => x.Product_Category).ToListAsync();

            if (!cartItems.Any())
                return Result<bool>.Failure(Error.Failure("Carrinho", "Carrinho vazio."));

            var subtotal = cartItems.Sum(x => x.Quantity * x.Product.Price_Unit);

            if (subtotal < cupom.Minimum_Value)
            {
                return Result<bool>.Failure(Error.Failure("Cupom", $"Pedido mínimo de R$ {cupom.Minimum_Value:N2}"));
            }

            var InsertApllyCupom = await _unitOfWork.UpdateFieldsAsync<Cart>(filters: new Dictionary<string, object>
        {
                { "Id", cart.Id }
        },

        fieldsToUpdate: new Dictionary<string, object>
        {
                { "Id_Cupom", cupom.Id }
        });

          

            return Result<bool>.Success(true);
        }
        public async Task<double> GetCartTotalAsync(int idUser)
        {
            // Busca o carrinho do usuário
            var cart = await _unitOfWork.GetClassByIdAnyType<Cart, int>(idUser, "Id_User");

            if (cart == null)
                return 0;

            // Soma todos os itens do carrinho
            var total = await (from item in _unitOfWork.Query<Cart_Item>()
                               join product in _unitOfWork.Query<Product>() on item.Id_Product equals product.Id
                               join variant in _unitOfWork.Query<Variante_Products>() on item.Id_Variante equals variant.Id into variantGroup
                               from variant in variantGroup.DefaultIfEmpty()
                               where item.Id_Cart == cart.Id

                               select (product.Price_Unit + (variant.Price_Modifier ?? 0d)) * item.Quantity).SumAsync();

            return total;
        }

        public async Task<Result<bool>> RemoveApllyCupom(int IdUser)
        {
            var Cart = await _unitOfWork.GetClassAsyncWhere<Cart>(x => x.Id_User_Customer == IdUser && x.Isdelete != true);

            if (Cart.Id_Cupom == null)
            {
                return Result<bool>.Failure(Error.Failure("Cupom", "Cupom não existe!"));
            }

            var updateremovecupom = await _unitOfWork.UpdateFieldsAsync<Cart>(filters: new Dictionary<string, object>
        {
                { "Id_User_Customer", IdUser }
        },

            fieldsToUpdate: new Dictionary<string, object>
            {
                { "Id_Cupom", null  }
            });
            if (!updateremovecupom)
            {
                return Result<bool>.Failure(Error.Failure("Cupom", "Erro ao remover cupom!"));
            }


            return Result<bool>.Success(true);
        }


    }
}

