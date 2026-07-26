using backend.services.interfaces;
using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Baldan.Pricing.Application.Models.Enums;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.InterfacesAdmin;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.EntityFrameworkCore;
using Pricing.Api.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.ServicesAdmin
{
    public class CupomServiceAdmin : ICupomAdminService
    {
        private readonly IUnitOfWorkAdmin _unitOfWorkAdmin;
        public CupomServiceAdmin(IUnitOfWorkAdmin unitOfWorkAdmin)
        {
            _unitOfWorkAdmin = unitOfWorkAdmin;
        }

        public async Task<Result<bool>> PostSaveCupom(CupomRequest cupomRequest, int IdUser)
        {
            if (!Enum.IsDefined(typeof(DiscountType), cupomRequest.Discount_Type))
            {
                return Result<bool>.Failure(
                    Error.Failure("Tipo desconto", "Tipo de desconto inválido!")
                );
            }
            if (cupomRequest.Discount_Type == DiscountType.Percentage)
            {
                if (cupomRequest.Discount < 0 || cupomRequest.Discount > 100)
                    return Result<bool>.Failure(Error.Failure("Valor de desconto", "Erro Valor de desconto invalido!"));
            }
            if (cupomRequest.Discount_Type == DiscountType.FixedValue)
            {
                if (cupomRequest.Discount < 0)
                    return Result<bool>.Failure(Error.Failure("Valor de desconto", "Erro Valor de desconto invalido!"));
            }
            if (cupomRequest.Discount_Type == DiscountType.FreeShipping)
            {
                cupomRequest.Discount = 0;
            }
            if (cupomRequest.Minimum_Value != null)
            {
                if (cupomRequest.Minimum_Value < 0)
                {
                    return Result<bool>.Failure(Error.Failure("Valor minimo", "Erro Valor minimo deve ser maior que 0!"));
                }
            }
            if (cupomRequest.Maximum_Discount != null)
            {
                if (cupomRequest.Maximum_Discount < 0)
                {
                    return Result<bool>.Failure(Error.Failure("desconto máximo", "Erro desconto máximo deve ser maior que 0!"));
                }
            }
            if (cupomRequest.Date_End < cupomRequest.Date_Start)
            {
                return Result<bool>.Failure(Error.Failure("Data ", "Erro Data fim deve ser maior que data de inicio!"));
            }


            var existe = await _unitOfWorkAdmin.GetClassById<Cupom, string>(cupomRequest.Name_Cupom, "Name_Cupom");

            if (existe is not null)
            {
                return Result<bool>.Failure(Error.Failure("Cupom", "Já existe um cupom com esse código."));
            }

            var InsertCupom = await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new Cupom
            {
                Name_Cupom = cupomRequest.Name_Cupom,
                Cod_Cupom = cupomRequest.Cod_Cupom?.Trim().Replace(" ", "").ToUpper(),
                Description = cupomRequest.Description,
                Discount = cupomRequest.Discount,
                Discount_Type = cupomRequest.Discount_Type,
                Active = cupomRequest.Active,
                Minimum_Value = cupomRequest.Minimum_Value,
                Maximum_Discount = cupomRequest.Maximum_Discount,
                Quantity_Uses = cupomRequest.Quantity_Uses,
                Quantity_Used = cupomRequest.Quantity_Used,
                Per_User_Limit = cupomRequest.Per_User_Limit,
                First_Order_Only = cupomRequest.First_Order_Only,
                Date_Start = cupomRequest.Date_Start,
                Date_End = cupomRequest.Date_End,
                InsertDate = DateTime.Now
            });

            if (cupomRequest.Application == "products" && cupomRequest.ProductIds.Any())
            {

                foreach (var Id in cupomRequest.ProductIds)
                {
                    var InsertCoupon_Product = await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new Coupon_Product
                    {
                        Id_Cupom = InsertCupom.Id,
                        Id_Product = Id.Id_Product,
                        InsertDate = DateTime.Now
                    });
                }

            }

            if (cupomRequest.Application == "categories" && cupomRequest.CategoryIds.Any())
            {
                foreach (var Id in cupomRequest.CategoryIds)
                {
                    var InsertCoupon_Product = await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new Coupon_Category
                    {
                        Id_Cupom = InsertCupom.Id,
                        Id_Category = Id.Id_Category,
                        InsertDate = DateTime.Now
                    });
                }
            }
            var User = await _unitOfWorkAdmin.GetClassById<User_Admin, int>(IdUser, "Id");
            await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(new Logs
            {
                Id_User = IdUser,
                Log = "Novo o Cupom" + " " + cupomRequest.Name_Cupom,
                Tipo = "NOVO",
                Nivel = "Admin",
                Acao = User.Name + $" Admin Adicionou um novo cupom",
                Info = User.Name + $" Admin Adicionou o cupom em {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
                InsertDate = DateTime.Now
            });
            return Result<bool>.Success(true);
        }


        public async Task<Result<List<CupomResponseAdmin>>> GetListAllCupons()
        {
            var cupons = await _unitOfWorkAdmin.GetClassListAsyncWhere<Cupom>(x => x.Isdelete != true);

            if (!cupons.Any())
            {
                return Result<List<CupomResponseAdmin>>.Failure(Error.Failure("Busca Cupom", "Nenhum cupom encontrado."));
            }

            var couponCategories = await _unitOfWorkAdmin.GetClassListAsyncWhere<Coupon_Category>(x => x.Isdelete != true);
            var couponProducts = await _unitOfWorkAdmin.GetClassListAsyncWhere<Coupon_Product>(x => x.Isdelete != true);
            //var CouponUse = await _unitOfWorkAdmin.GetAllEntityAsyncList<Coupon_Use>();


            var categoriesByCoupon = couponCategories
                .GroupBy(x => x.Id_Cupom)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => new CouponCategoryResponse
                    {
                        Id = x.Id,
                        Id_Cupom = x.Id_Cupom,
                        Id_Category = x.Id_Category,
                        InsertDate = x.InsertDate,
                        UpdateDate = x.UpdateDate
                    }).ToList()
                );

            var productsByCoupon = couponProducts
                .GroupBy(x => x.Id_Cupom)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => new CouponProductResponse
                    {
                        Id = x.Id,
                        Id_Cupom = x.Id_Cupom,
                        Id_Product = x.Id_Product,
                        InsertDate = x.InsertDate,
                        UpdateDate = x.UpdateDate
                    }).ToList()
                );


            //var CouponUseUsede = CouponUse
            //  .GroupBy(x => x.Id_Cupom)
            //  .ToDictionary(
            //      g => g.Key,
            //      g => g.Select(x => new CouponUseResponse
            //      {
            //          Id = x.Id,
            //          Id_Cupom = x.Id_Cupom,
            //          Id_Order = x.Id_Order,
            //          Id_User = x.Id_User,
            //          Discount_Value = x.Discount_Value,
            //          InsertDate = x.InsertDate,
            //          UpdateDate = x.UpdateDate
            //      }).ToList()
            //  );

            var response = cupons.Select(cupom =>
            {
                categoriesByCoupon.TryGetValue(cupom.Id, out var categoryList);
                productsByCoupon.TryGetValue(cupom.Id, out var productList);
                //CouponUseUsede.TryGetValue(cupom.Id, out var CouponUseUsedeList);


                return new CupomResponseAdmin
                {
                    Id = cupom.Id,
                    Name_Cupom = cupom.Name_Cupom,
                    Cod_Cupom = cupom.Cod_Cupom,
                    Description = cupom.Description,
                    Discount = cupom.Discount,
                    Discount_Type = cupom.Discount_Type,
                    Active = cupom.Active,
                    Minimum_Value = cupom.Minimum_Value,
                    Maximum_Discount = cupom.Maximum_Discount,
                    Quantity_Uses = cupom.Quantity_Uses,
                    Quantity_Used = cupom.Quantity_Used,
                    Per_User_Limit = cupom.Per_User_Limit,
                    First_Order_Only = cupom.First_Order_Only,
                    Date_Start = cupom.Date_Start,
                    Date_End = cupom.Date_End,
                    InsertDate = cupom.InsertDate,
                    UpdateDate = cupom.UpdateDate,

                    CategoryIds = categoryList ?? new List<CouponCategoryResponse>(),
                    ProductIds = productList ?? new List<CouponProductResponse>(),
                    //CoupomUsed = CouponUseUsedeList ?? new List<CouponUseResponse>()
                };
            }).ToList();

            return Result<List<CupomResponseAdmin>>.Success(response);
        }
        public async Task<Result<bool>> PostUpdateCupom(CupomUpdateRequest request, int IdUser)
        {

            var coupon = await _unitOfWorkAdmin.GetClassById<Cupom, int>(request.Id, "Id");

            if (coupon == null)
            {
                return Result<bool>.Failure(Error.Failure("Id Incorreto", "Nenhum cupom encontrado."));
            }
            var Update_Cupom = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Cupom>(filters: new Dictionary<string, object>
                        {
                                { "Id", coupon.Id },
                        },

                     fieldsToUpdate: new Dictionary<string, object>
                     {
                                {"Name_Cupom",request.Name_Cupom},
                                {"Cod_Cupom", request.Cod_Cupom},
                                {"Description", request.Description},
                                {"Discount", request.Discount},
                                {"Discount_Type", request.Discount_Type},
                                {"Active", request.Active},
                                {"Minimum_Value", request.Minimum_Value},
                                {"Maximum_Discount", request.Maximum_Discount},
                                {"Quantity_Uses", request.Quantity_Uses},
                                {"Per_User_Limit", request.Per_User_Limit},
                                {"Date_Start", request.Date_Start},
                                {"Date_End", request.Date_End},
                                {"First_Order_Only", request.First_Order_Only},
                                {"UpdateDate",  DateTime.Now}

                      });

            if (request.AddedProducts.Any())
            {
                foreach (var ProductId in request.AddedProducts)
                {

                    var InsertCoupon_Product = await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new Coupon_Product
                    {
                        Id_Cupom = request.Id,
                        Id_Product = ProductId,
                        InsertDate = DateTime.Now,
                        Isdelete = false

                    });
                }
            }
            if (request.RemovedProducts.Any())
            {
                foreach (var ProductId in request.RemovedProducts)
                {
                    var Update_CupomRemoveIsDelete = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Coupon_Product>(filters: new Dictionary<string, object>
                        {
                                { "Id_Cupom", coupon.Id },
                                {"Id_Product",ProductId }


                        },
                            fieldsToUpdate: new Dictionary<string, object>
                            {
                                {"Isdelete",true},
                                {"UpdateDate",DateTime.Now},
                            });
                }
            }

            if (request.AddedCategories.Any())
            {
                foreach (var CategoryId in request.AddedCategories)
                {
                    var InsertCoupon_Product = await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new Coupon_Category
                    {
                        Id_Cupom = request.Id,
                        Id_Category = CategoryId,
                        InsertDate = DateTime.Now,
                        Isdelete = false
                    });
                }
            }

            if (request.RemovedCategories.Any())
            {
                foreach (var CategoryId in request.RemovedCategories)
                {
                    var Update_CupomRemoveIsDelete = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Coupon_Category>(filters: new Dictionary<string, object>
                        {
                                { "Id_Cupom", coupon.Id },
                                {"Id_Category",CategoryId }


                        },
                            fieldsToUpdate: new Dictionary<string, object>
                            {
                                {"Isdelete",true},
                                {"UpdateDate",DateTime.Now},
                            });
                }
            }
            var User = await _unitOfWorkAdmin.GetClassById<User_Admin, int>(IdUser, "Id");
            await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(new Logs
            {
                Id_User = IdUser,
                Log = "Editou o Cupom" + " " + request.Name_Cupom,
                Tipo = "Edicao",
                Nivel = "Admin",
                Acao = User.Name + $"Admin Editou o cupom",
                Info = User.Name + $"Admin Editou o cupom em {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
                InsertDate = DateTime.Now
            });
            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeleteCupom(int IdCupom, int IdUser)
        {
            if (IdCupom == 0)
            {
                return Result<bool>.Failure(Error.Failure("Id null", "Erro Nenum Id cupom selecionado!"));
            }
            var coupon = await _unitOfWorkAdmin.GetClassById<Cupom, int>(IdCupom, "Id");

            if (coupon == null)
            {
                return Result<bool>.Failure(Error.Failure("Id Incorreto", "Nenhum cupom encontrado."));
            }
            var Update_CupomDelete = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Cupom>(filters: new Dictionary<string, object>
                        {
                                { "Id", coupon.Id },
                        },

                     fieldsToUpdate: new Dictionary<string, object>
                     {
                                {"Isdelete",true},
                                {"UpdateDate",DateTime.Now},

                      });

            var Coupon_Product = await _unitOfWorkAdmin.GetClassListAsyncWhere<Coupon_Product>(x => x.Id_Cupom == coupon.Id && x.Isdelete != true);
            var Coupon_Category = await _unitOfWorkAdmin.GetClassListAsyncWhere<Coupon_Category>(x => x.Id_Cupom == coupon.Id && x.Isdelete != true);

            if (Coupon_Product.Any())
            {
                foreach (var ProductId in Coupon_Product)
                {
                    var Coupon_ProductDelete = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Coupon_Product>(filters: new Dictionary<string, object>
                        {
                                { "Id", ProductId.Id },
                        },

                           fieldsToUpdate: new Dictionary<string, object>
                           {
                                {"Isdelete",true},
                                {"UpdateDate",DateTime.Now},

                            });
                }
            }
         

            if (Coupon_Category.Any())
            {
                foreach (var CategoryId in Coupon_Category)
                {
                    var Coupon_ProductDelete = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Coupon_Category>(filters: new Dictionary<string, object>
                        {
                                { "Id", CategoryId.Id },
                        },

                           fieldsToUpdate: new Dictionary<string, object>
                           {
                                {"Isdelete",true},
                                {"UpdateDate",DateTime.Now},

                            });
                }
            }

            var User = await _unitOfWorkAdmin.GetClassById<User_Admin, int>(IdUser, "Id");

            await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(new Logs
            {
                Id_User = IdUser,
                Log = "Excluiu o Cupom" + " " + coupon.Name_Cupom,
                Tipo = "Exclução Cupom",
                Nivel = "Admin",
                Acao = User.Name + $"Admin Excluiu o cupom",
                Info = User.Name + $"Admin Excluiu o cupom em {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
                InsertDate = DateTime.Now
            });
            return Result<bool>.Success(true);
        }
        public async Task<Result<bool>> PostUpdateActive(int IdCupom, int IdUser)
        {
            var active = "";
            if (IdCupom == 0)
            {
                return Result<bool>.Failure(Error.Failure("Id null", "Erro Nenum Id cupom selecionado!"));
            }
            var coupon = await _unitOfWorkAdmin.GetClassById<Cupom, int>(IdCupom, "Id");

            if (coupon == null)
            {
                return Result<bool>.Failure(Error.Failure("Id Incorreto", "Nenhum cupom encontrado."));
            }

            if(coupon.Active == true)
            {
                var Update_CupomActive = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Cupom>(filters: new Dictionary<string, object>
                        {
                                { "Id", coupon.Id },
                        },

                 fieldsToUpdate: new Dictionary<string, object>
                 {
                                {"Active",false},
                                {"UpdateDate",DateTime.Now}
                  });
                active = "Desativou";
            }


            if (coupon.Active == false)
            {
                if (coupon.Date_End < DateTime.Now)
                {
                    return Result<bool>.Failure(Error.Failure("Cupom vencido","Não é possível ativar este cupom porque a data de validade já expirou. Atualize a data de término para ativá-lo novamente."));
                }
                var Update_CupomActive = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Cupom>(filters: new Dictionary<string, object>
                        {
                                { "Id", coupon.Id },
                        },

                 fieldsToUpdate: new Dictionary<string, object>
                 {
                                {"Active",true},
                                {"UpdateDate",DateTime.Now}
                  });
                active = "Ativou";
            }
           
            var User = await _unitOfWorkAdmin.GetClassById<User_Admin, int>(IdUser, "Id");

            await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(new Logs
            {
                Id_User = IdUser,
                Log = "Excluiu o Cupom" + " " + coupon.Name_Cupom,
                Tipo = "Ativação Cupom",
                Nivel = "Admin",
                Acao = User.Name + $"Admin " +active +" o cupom",
                Info = User.Name + "Admin " +active +$" o cupom em {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
                InsertDate = DateTime.Now
            });
            return Result<bool>.Success(true);
        }
    }
}
