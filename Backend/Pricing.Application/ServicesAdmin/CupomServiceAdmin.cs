using backend.services.interfaces;
using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Baldan.Pricing.Application.Models.Enums;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;
using Mercado.Craibas.Application.Interfaces.Services;
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
        private readonly IDeletionRecordService _deletionRecord;
        public CupomServiceAdmin(IUnitOfWorkAdmin unitOfWorkAdmin, IDeletionRecordService deletionRecord)
        {
            _unitOfWorkAdmin = unitOfWorkAdmin;
            _deletionRecord = deletionRecord;
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


            var existe = await _unitOfWorkAdmin.GetClassAsyncWhere<Cupom>(x=> x.Cod_Cupom == cupomRequest.Cod_Cupom && x.Isdelete != true);

            if (existe is not null)
            {
                return Result<bool>.Failure(Error.Failure("Cupom", "Já existe um cupom com esse código."));
            }
            if(cupomRequest.Show_Flash_Offer)
            {
                var show_Flash_Offer = await _unitOfWorkAdmin.GetClassAsyncWhere<Cupom>(x => x.Isdelete != true && x.Active == true && x.Show_Flash_Offer == true);

                if (show_Flash_Offer is not null)
                {
                    return Result<bool>.Failure(Error.Failure("Óferta relâmpago", "Já existe um cupom relacionado a óferta relâmpago pode somente um por vez!."));
                }
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
                Show_Flash_Offer = cupomRequest.Show_Flash_Offer,
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
            var User = await _unitOfWorkAdmin.GetClassById<User_Admin, int>(IdUser,"Id");

            if (User != null)
            {
                var dataLog = DateTime.Now;
                await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(
                    new Logs
                    {
                        Id_User = User.Id,
                        Log =
                            $"O administrador {User.Name} criou o cupom '{InsertCupom.Name_Cupom}' (ID: {InsertCupom.Id}).\n" +
                            $"Código do cupom: {InsertCupom.Cod_Cupom}\n" +
                            $"Descrição: {InsertCupom.Description}\n" +
                            $"Tipo de desconto: {InsertCupom.Discount_Type}\n" +
                            $"Desconto: {InsertCupom.Discount}\n" +
                            $"Valor mínimo: R$ {InsertCupom.Minimum_Value:N2}\n" +
                            $"Desconto máximo: R$ {InsertCupom.Maximum_Discount:N2}\n" +
                            $"Quantidade de usos: {InsertCupom.Quantity_Uses}\n" +
                            $"Limite por usuário: {InsertCupom.Per_User_Limit}\n" +
                            $"Oferta relâmpago: {(InsertCupom.Show_Flash_Offer ? "Sim" : "Não")}\n" +
                            $"Somente primeiro pedido: {(InsertCupom.First_Order_Only ? "Sim" : "Não")}\n" +
                            $"Status: {(InsertCupom.Active ? "Ativo" : "Inativo")}\n" +
                            $"Data de início: {InsertCupom.Date_Start:dd/MM/yyyy HH:mm}\n" +
                            $"Data de término: {InsertCupom.Date_End:dd/MM/yyyy HH:mm}\n" +
                            $"Aplicação: {cupomRequest.Application}\n" +
                            $"Produtos vinculados: {cupomRequest.ProductIds?.Count ?? 0}\n" +
                            $"Categorias vinculadas: {cupomRequest.CategoryIds?.Count ?? 0}\n" +
                            $"Data/Hora: {dataLog:dd/MM/yyyy HH:mm:ss}",
                        Tipo = "NOVO CUPOM",
                        Nivel = "Admin",
                        Acao = "Adicionou um novo cupom",
                        Info =
                            $"{User.Name} criou o cupom '{InsertCupom.Name_Cupom}' " +
                            $"em {dataLog:dd/MM/yyyy HH:mm}.",

                        InsertDate = dataLog
                    }
                );
            }
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
                    Show_Flash_Offer = cupom.Show_Flash_Offer,
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

            if (!Enum.IsDefined(typeof(DiscountType), request.Discount_Type))
            {
                return Result<bool>.Failure(
                    Error.Failure("Tipo desconto", "Tipo de desconto inválido!")
                );
            }
            if (request.Discount_Type == DiscountType.Percentage)
            {
                if (request.Discount < 0 || request.Discount > 100)
                    return Result<bool>.Failure(Error.Failure("Valor de desconto", "Erro Valor de desconto invalido!"));
            }
            if (request.Discount_Type == DiscountType.FixedValue)
            {
                if (request.Discount < 0)
                    return Result<bool>.Failure(Error.Failure("Valor de desconto", "Erro Valor de desconto invalido!"));
            }
            if (request.Discount_Type == DiscountType.FreeShipping)
            {
                request.Discount = 0;
            }
            if (request.Minimum_Value != null)
            {
                if (request.Minimum_Value < 0)
                {
                    return Result<bool>.Failure(Error.Failure("Valor minimo", "Erro Valor minimo deve ser maior que 0!"));
                }
            }
            if (request.Maximum_Discount != null)
            {
                if (request.Maximum_Discount < 0)
                {
                    return Result<bool>.Failure(Error.Failure("desconto máximo", "Erro desconto máximo deve ser maior que 0!"));
                }
            }
            if (request.Date_End < request.Date_Start)
            {
                return Result<bool>.Failure(Error.Failure("Data ", "Erro Data fim deve ser maior que data de inicio!"));
            }


            var existe = await _unitOfWorkAdmin.GetClassAsyncWhere<Cupom>(x=> x.Cod_Cupom == request.Cod_Cupom && x.Id != request.Id && x.Isdelete != true);

            if (existe is not null)
            {
                return Result<bool>.Failure(Error.Failure("Cupom", "Já existe um cupom com esse código."));
            }
            if (request.Show_Flash_Offer)
            {
                var show_Flash_Offer = await _unitOfWorkAdmin.GetClassAsyncWhere<Cupom>(x => x.Isdelete != true && x.Active == true && x.Show_Flash_Offer == true && x.Id != request.Id);

                if (show_Flash_Offer is not null)
                {
                    return Result<bool>.Failure(Error.Failure("Óferta relâmpago", "Já existe um cupom relacionado a óferta relâmpago pode somente um por vez!."));
                }
            }

            var coupon = await _unitOfWorkAdmin.GetClassById<Cupom, int>(request.Id, "Id");

            if (coupon == null)
            {
                return Result<bool>.Failure(Error.Failure("Id Incorreto", "Nenhum cupom encontrado."));
            }


            var nomeAnterior = coupon.Name_Cupom;
            var codigoAnterior = coupon.Cod_Cupom;
            var descricaoAnterior = coupon.Description;
            var descontoAnterior = coupon.Discount;
            var tipoDescontoAnterior = coupon.Discount_Type;
            var ativoAnterior = coupon.Active;
            var valorMinimoAnterior = coupon.Minimum_Value;
            var descontoMaximoAnterior = coupon.Maximum_Discount;
            var quantidadeUsosAnterior = coupon.Quantity_Uses;
            var ofertaRelampagoAnterior = coupon.Show_Flash_Offer;
            var limiteUsuarioAnterior = coupon.Per_User_Limit;
            var dataInicioAnterior = coupon.Date_Start;
            var dataFimAnterior = coupon.Date_End;
            var primeiroPedidoAnterior = coupon.First_Order_Only;


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
                                {"Show_Flash_Offer", request.Show_Flash_Offer},
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
            var User = await _unitOfWorkAdmin.GetClassById<User_Admin, int>(IdUser,"Id");

            if (User != null)
            {
                var dataLog = DateTime.Now;
                var alteracoes = new List<string>();

                if (nomeAnterior != request.Name_Cupom)
                {
                    alteracoes.Add($"Nome: '{nomeAnterior}' → '{request.Name_Cupom}'");
                }

                if (codigoAnterior != request.Cod_Cupom)
                {
                    alteracoes.Add($"Código: '{codigoAnterior}' → '{request.Cod_Cupom}'");
                }

                if (descricaoAnterior != request.Description)
                {
                    alteracoes.Add("Descrição do cupom foi alterada");
                }

                if (descontoAnterior != request.Discount)
                {
                    alteracoes.Add($"Desconto: {descontoAnterior} → {request.Discount}");
                }

                if (tipoDescontoAnterior != request.Discount_Type)
                {
                    alteracoes.Add($"Tipo de desconto: '{tipoDescontoAnterior}' → '{request.Discount_Type}'");
                }

                if (ativoAnterior != request.Active)
                {
                    alteracoes.Add($"Status: {(ativoAnterior ? "Ativo" : "Inativo")} → " + $"{(request.Active ? "Ativo" : "Inativo")}");
                }

                if (valorMinimoAnterior != request.Minimum_Value)
                {
                    alteracoes.Add($"Valor mínimo: R$ {valorMinimoAnterior:N2} → R$ {request.Minimum_Value:N2}");
                }

                if (descontoMaximoAnterior != request.Maximum_Discount)
                {
                    alteracoes.Add($"Desconto máximo: R$ {descontoMaximoAnterior:N2} → R$ {request.Maximum_Discount:N2}");
                }

                if (quantidadeUsosAnterior != request.Quantity_Uses)
                {
                    alteracoes.Add($"Quantidade de usos: {quantidadeUsosAnterior} → {request.Quantity_Uses}");
                }

                if (ofertaRelampagoAnterior != request.Show_Flash_Offer)
                {
                    alteracoes.Add($"Oferta relâmpago: {(ofertaRelampagoAnterior ? "Sim" : "Não")} → " + $"{(request.Show_Flash_Offer ? "Sim" : "Não")}");
                }

                if (limiteUsuarioAnterior != request.Per_User_Limit)
                {
                    alteracoes.Add($"Limite por usuário: {limiteUsuarioAnterior} → {request.Per_User_Limit}");
                }

                if (dataInicioAnterior != request.Date_Start)
                {
                    alteracoes.Add($"Data de início: {dataInicioAnterior:dd/MM/yyyy HH:mm} → " + $"{request.Date_Start:dd/MM/yyyy HH:mm}");
                }

                if (dataFimAnterior != request.Date_End)
                {
                    alteracoes.Add($"Data de término: {dataFimAnterior:dd/MM/yyyy HH:mm} → " + $"{request.Date_End:dd/MM/yyyy HH:mm}");
                }

                if (primeiroPedidoAnterior != request.First_Order_Only)
                {
                    alteracoes.Add($"Somente primeiro pedido: " + $"{(primeiroPedidoAnterior ? "Sim" : "Não")} → " + $"{(request.First_Order_Only ? "Sim" : "Não")}");
                }

                if (request.AddedProducts.Any())
                {
                    alteracoes.Add($"{request.AddedProducts.Count} produto(s) adicionado(s) ao cupom");
                }

                if (request.RemovedProducts.Any())
                {
                    alteracoes.Add($"{request.RemovedProducts.Count} produto(s) removido(s) do cupom");
                }

                if (request.AddedCategories.Any())
                {
                    alteracoes.Add($"{request.AddedCategories.Count} categoria(s) adicionada(s) ao cupom");
                }

                if (request.RemovedCategories.Any())
                {
                    alteracoes.Add($"{request.RemovedCategories.Count} categoria(s) removida(s) do cupom");
                }

                await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(
                    new Logs
                    {
                        Id_User = User.Id,

                        Log =
                            $"O administrador {User.Name} editou o cupom '{request.Name_Cupom}' (ID: {coupon.Id}).\n" +
                            $"Alterações realizadas:\n" +
                            $"{(alteracoes.Count > 0
                                ? string.Join("\n", alteracoes)
                                : "Nenhuma alteração identificada.")}\n" +
                            $"Data/Hora: {dataLog:dd/MM/yyyy HH:mm:ss}",
                        Tipo = "Edicao",
                        Nivel = "Admin",
                        Acao = "Editou o cupom",

                        Info =
                            $"{User.Name} editou o cupom '{request.Name_Cupom}' " +
                            $"em {dataLog:dd/MM/yyyy HH:mm}.",

                        InsertDate = dataLog
                    }
                );
            }
            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeleteCupom(int IdCupom, int IdUser, string? reason)
        {
            if (IdCupom == 0)
            {
                return Result<bool>.Failure(Error.Failure("Id null", "Erro Nenum Id cupom selecionado!"));
            }

            if (string.IsNullOrWhiteSpace(reason) || reason.Trim().Length < 5)
            {
                return Result<bool>.Failure(Error.Validation("Motivo", "Informe o motivo da exclusão (mínimo de 5 caracteres)."));
            }

            var coupon = await _unitOfWorkAdmin.GetClassAsyncWhere<Cupom>(x => x.Id == IdCupom && x.Isdelete != true);

            if (coupon == null)
            {
                return Result<bool>.Failure(Error.Failure("Id Incorreto", "Nenhum cupom encontrado ou já excluído."));
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

            var User = await _unitOfWorkAdmin.GetClassById<User_Admin, int>(IdUser,"Id");

            // Lixeira: cupom + vínculos com produtos e categorias
            var parentRecordId = await _deletionRecord.RegisterAsync(new DeletionRecordRequest
            {
                EntityType = EntityTypeDelete.Coupon,
                EntityId = coupon.Id,
                DisplayName = $"{coupon.Name_Cupom} ({coupon.Cod_Cupom})",
                DeletedByUserId = IdUser,
                DeletedByRole = "ADMIN",
                DeletedByUserName = User?.Name ?? "Administrador",
                Reason = reason.Trim(),
                Entity = coupon
            });

            var couponChildren = Coupon_Product
                .Select(x => new DeletionRecordRequest
                {
                    EntityType = EntityTypeDelete.CouponProduct,
                    EntityId = x.Id,
                    DisplayName = $"Vínculo do cupom {coupon.Cod_Cupom} com o produto #{x.Id_Product}",
                    Entity = x
                })
                .Concat(Coupon_Category.Select(x => new DeletionRecordRequest
                {
                    EntityType = EntityTypeDelete.CouponCategory,
                    EntityId = x.Id,
                    DisplayName = $"Vínculo do cupom {coupon.Cod_Cupom} com a categoria #{x.Id_Category}",
                    Entity = x
                }))
                .Select(c =>
                {
                    c.DeletedByUserId = IdUser;
                    c.DeletedByRole = "ADMIN";
                    c.DeletedByUserName = User?.Name ?? "Administrador";
                    c.Reason = "Excluído junto com o cupom";
                    return c;
                })
                .ToList();

            await _deletionRecord.RegisterChildrenAsync(parentRecordId, couponChildren);

            if (User != null)
            {
                var dataLog = DateTime.Now;

                await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(
                    new Logs
                    {
                        Id_User = User.Id,
                        Log =
                            $"O administrador {User.Name} excluiu o cupom '{coupon.Name_Cupom}' (ID: {coupon.Id}).\n" +
                            $"Código do cupom: {coupon.Cod_Cupom}\n" +
                            $"Desconto: {coupon.Discount}\n" +
                            $"Tipo de desconto: {coupon.Discount_Type}\n" +
                            $"Status anterior: {(coupon.Active ? "Ativo" : "Inativo")}\n" +
                            $"Produtos vinculados excluídos: {Coupon_Product.Count}\n" +
                            $"Categorias vinculadas excluídas: {Coupon_Category.Count}\n" +
                            $"Data/Hora: {dataLog:dd/MM/yyyy HH:mm:ss}",
                        Tipo = "EXCLUSAO CUPOM",
                        Nivel = "Admin",
                        Acao = "Excluiu o cupom",
                        Info =
                            $"{User.Name} excluiu o cupom '{coupon.Name_Cupom}' " +
                            $"em {dataLog:dd/MM/yyyy HH:mm}.",

                        InsertDate = dataLog
                    }
                );
            }
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

            var User = await _unitOfWorkAdmin.GetClassById<User_Admin, int>(IdUser,"Id");

            if (User != null)
            {
                var dataLog = DateTime.Now;
                var statusAnterior = coupon.Active ? "Ativo" : "Inativo";

                var novoStatus = coupon.Active ? "Inativo" : "Ativo";

                await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(
                    new Logs
                    {
                        Id_User = User.Id,
                        Log =
                            $"O administrador {User.Name} alterou o status do cupom '{coupon.Name_Cupom}' (ID: {coupon.Id}).\n" +
                            $"Status anterior: '{statusAnterior}'\n" +
                            $"Novo status: '{novoStatus}'\n" +
                            $"Código do cupom: {coupon.Cod_Cupom}\n" +
                            $"Ação realizada: {active} o cupom\n" +
                            $"Data/Hora: {dataLog:dd/MM/yyyy HH:mm:ss}",
                        Tipo = "ATIVAÇÃO CUPOM",
                        Nivel = "Admin",
                        Acao = active + " o cupom",
                        Info =
                            $"{User.Name} {active.ToLower()} o cupom '{coupon.Name_Cupom}' " +
                            $"em {dataLog:dd/MM/yyyy HH:mm}.",

                        InsertDate = dataLog
                    }
                );
            }
            return Result<bool>.Success(true);
        }
    }
}
