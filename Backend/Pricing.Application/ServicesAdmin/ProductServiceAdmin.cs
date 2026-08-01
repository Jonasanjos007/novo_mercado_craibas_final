using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.InterfacesAdmin;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Pricing.Api.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.ServicesAdmin
{
    public class ProductServiceAdmin : IProductServiceAdmin
    {

        private readonly IUnitOfWorkAdmin _unitOfWorkAdmin;
        public ProductServiceAdmin(IUnitOfWorkAdmin unitOfWorkAdmin)
        {
            _unitOfWorkAdmin = unitOfWorkAdmin;
        }


        public async Task<Result<List<ProductResponse>>> GetProductListAdmin()
        {
            var Products = await _unitOfWorkAdmin.GetClassListAsyncWhere<Product>(x => x.Isdelete != true);

            if (Products == null || !Products.Any())
            {
                return Result<List<ProductResponse>>.Failure(Error.Failure("Produtos","Produtos não encontrados!"));
            }

            var productList = new List<ProductResponse>();

            foreach (var Product in Products)
            {
                var variants = await _unitOfWorkAdmin.GetClassListAsyncWhere<Variante_Products>(x => x.Id_Product == Product.Id && x.Isdelete != true);

                if (variants == null || !variants.Any())
                {
                    continue;
                }

                var Imagens_Product = await _unitOfWorkAdmin.GetClassListAsyncWhere<Imagens_Products>(x => x.Id_Product == Product.Id && x.Isdelete != true);

                if (Imagens_Product is null)
                {
                    continue;
                }

                var CategoryName = await _unitOfWorkAdmin.GetClassAsyncWhere<Product_Category>(x => x.Id == Product.Id_Category && x.Isdelete != true);
                if (CategoryName is null)
                {
                    continue;
                }
                productList.Add(new ProductResponse
                {
                    Id = Product.Id,
                    Name = Product.Name,
                    Description = Product.Description,
                    Price_Unic = Product.Price_Unit,
                    Origin_Price = Product.Origin_Price,
                    Imagens = Imagens_Product,
                    Id_category = CategoryName.Id,
                    Count_Rating = Product.Rating,
                    Review_Count = Product.ReviewCount,
                    Count_Sold = Product.CountSold,
                    variations = variants,
                    Total_Stock = Product.Total_Stock,
                    Badge = Product.Badge,
                    FreeShipping = Product.FreeShipping,
                    Installments = Product.installments,
                    Tags = Product.Tags,
                    Featured = Product.Featured,
                    InsertDate = Product.InsertDate,
                    Ativo = Product.Ativo,
                    ShowBanner = Product.ShowBanner


                });
            }
            return Result<List<ProductResponse>>.Success(productList);
        }

        public async Task<Result<bool>> PostSaveProduct(ProductRequest product)
        {

            try
            {
                var OnePoduct = new Product();

                OnePoduct = new Product
                {

                    Name = product.Name,
                    Description = product.Description,
                    Price_Unit = product.Price_Unit,
                    Origin_Price = product.Origin_Price,
                    Id_Category = product.Id_Category,
                    Total_Stock = product.Total_Stock ?? 0,
                    Badge = product.Badge,
                    FreeShipping = product.FreeShipping ?? false,
                    installments = product.installments,
                    Tags = product.Tags,
                    Featured = product.Featured,
                    Ativo = product.Ativo,
                    InsertDate = DateTime.Now,
                    Isdelete = false,
                    ShowBanner = product.ShowBanner
                };


                var InsertProduct = await _unitOfWorkAdmin.InsertAsyncReturnObjeto(OnePoduct);

                if (InsertProduct.Id == 0)
                {
                    return Result<bool>.Failure(Error.Failure("Pedido", "Erro ao salvar o pedido. Entre em contato com suporte!"));
                }
                var raizProjeto = Directory.GetCurrentDirectory();

                // sobe duas pastas (Mercado.Api -> Backend -> novo_mercado_craibas_final)
                var raiz = Directory.GetParent(raizProjeto)!.Parent!.FullName;

                var pastaDestino = Path.Combine(raiz, "Imagens", "Produtos");

                if (!Directory.Exists(pastaDestino))
                {
                    Directory.CreateDirectory(pastaDestino);
                }

                foreach (var imagem in product.Imagens)
                {
                    var extensao = Path.GetExtension(imagem.FileName);
                    var nomeArquivo = $"{Guid.NewGuid()}{extensao}";

                    var caminhoCompleto = Path.Combine(pastaDestino, nomeArquivo);

                    using var stream = new FileStream(caminhoCompleto, FileMode.Create);
                    await imagem.CopyToAsync(stream);

                    await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new Imagens_Products
                    {
                        Id_Product = InsertProduct.Id,
                        Url_Imagem = nomeArquivo
                    });
                }

                var InsertVariantsProduct = new Variante_Products();

                foreach (var Variante in product.Variants)
                {

                    InsertVariantsProduct = new Variante_Products
                    {
                        Id_Product = InsertProduct.Id,
                        Name = Variante.Name,
                        Value = Variante.Value,
                        Type = Variante.Type,
                        Stoke = Variante.Stoke ?? 0,
                        Price_Modifier = Variante.Price_Modifier,
                        InsertDate = DateTime.Now
                    };

                    await _unitOfWorkAdmin.InsertAsyncReturnObjeto(InsertVariantsProduct);

                }
                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure(Error.Failure("Product", ex.Message));
            }
        }

        public async Task<Result<bool>>PostEditProduct(ProductRequest product)
        {
            try
            {
                if (product.RemovedImages?.Any() == true)
                {
                    var raizCaminhoProjeto = Directory.GetCurrentDirectory();

                    var raizCaminho = Directory.GetParent(raizCaminhoProjeto)!.Parent!.FullName;

                    var pastaDestinoImage = Path.Combine(
                        raizCaminho,
                        "Imagens",
                        "Produtos"
                    );

                    foreach (var imagemDeleteId in product.RemovedImages)
                    {
                        // Busca a imagem antes de excluir
                        var imagem = await _unitOfWorkAdmin.GetClassById<Imagens_Products,int>(imagemDeleteId, "Id");

                        if (imagem != null)
                        {

                             await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Imagens_Products>(filters: new Dictionary<string, object>
                        {
                                { "Id", imagem.Id }
                        },

                       fieldsToUpdate: new Dictionary<string, object>
                       {
                            
                             {"Isdelete",true},
                             {"UpdateDate", DateTime.Now }
                        });
                            //var caminhoArquivo = Path.Combine(pastaDestinoImage, imagem.Url_Imagem);

                            //if (File.Exists(caminhoArquivo))
                            //{
                            //    File.Delete(caminhoArquivo);
                            //}

                            //await _unitOfWorkAdmin.DeleteAllByColumnAsync<Imagens_Products>("Id", imagemDeleteId);
                        }
                    }
                }

                if (product.removedVariants.Count() != 0)
                {
                    foreach (var VariantDeleteId in product.removedVariants)
                    {
                        await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Variante_Products>(filters: new Dictionary<string, object>
                        {
                                { "Id", VariantDeleteId }
                        },

                      fieldsToUpdate: new Dictionary<string, object>
                      {

                             {"Isdelete",true},
                             {"UpdateDate", DateTime.Now }
                       });
                        //await _unitOfWorkAdmin.DeleteAllByColumnAsync<Variante_Products>("Id", VariantDeleteId);
                    }
                }



                var Update_Product = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Product>(filters: new Dictionary<string, object>
                        {
                                { "Id", product.Id }
                        },

                        fieldsToUpdate: new Dictionary<string, object>
                        {
                             {"Name",product.Name },
                             {"Description",product.Description },
                             {"Price_Unit",product.Price_Unit },
                             {"Origin_Price",product.Origin_Price},
                             {"Id_Category",product.Id_Category},
                             {"Total_Stock",product.Total_Stock},
                             {"Badge",product.Badge},
                             {"FreeShipping",product.FreeShipping},
                             {"installments",product.installments},
                             {"Tags",product.Tags},
                             { "Featured", product.Featured},
                             { "Ativo", product.Ativo},
                             {"ShowBanner",product.ShowBanner},
                             {"UpdateDate", DateTime.Now }
                         });


                if(Update_Product)
                {
                    if(product.Imagens != null) 
                    {
                        var raizCaminhoProjeto = Directory.GetCurrentDirectory();

                        // sobe duas pastas (Mercado.Api -> Backend -> novo_mercado_craibas_final)
                        var raizCaminho = Directory.GetParent(raizCaminhoProjeto)!.Parent!.FullName;

                        var pastaDestinoImage = Path.Combine(raizCaminho, "Imagens", "Produtos");

                        if (!Directory.Exists(pastaDestinoImage))
                        {
                            Directory.CreateDirectory(pastaDestinoImage);
                        }

                        foreach (var imagem in product.Imagens)
                        {
                            var extensao = Path.GetExtension(imagem.FileName);
                            var nomeArquivo = $"{Guid.NewGuid()}{extensao}";

                            var caminhoCompleto = Path.Combine(pastaDestinoImage, nomeArquivo);

                            using var stream = new FileStream(caminhoCompleto, FileMode.Create);
                            await imagem.CopyToAsync(stream);

                            await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new Imagens_Products
                            {
                                Id_Product = product.Id ?? 0,
                                Url_Imagem = nomeArquivo
                            });
                        }
                    }
                }
                if(product.Variants != null)
                {
                    foreach (var Variante in product.Variants)
                    {
                        if(Variante.New == true)
                        {
                            await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new Variante_Products
                            {
                                Id_Product = product.Id ?? 0,
                                Name = Variante.Name,
                                Value = Variante.Value,
                                Type = Variante.Type,
                                Stoke = Variante.Stoke ?? 0,
                                Price_Modifier = Variante.Price_Modifier,
                                InsertDate = DateTime.Now,
                                Isdelete = false
                            });
                        }
                        else
                        {
                           await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Variante_Products>(filters: new Dictionary<string, object>
                        {
                                { "Id", Variante.Id }
                        },

                     fieldsToUpdate: new Dictionary<string, object>
                     {
                             {"Id_Product",product.Id },
                             {"Name",Variante.Name},
                             {"Value",Variante.Value },
                             {"Type",Variante.Type},
                             {"Stoke",Variante.Stoke},
                             {"Price_Modifier",Variante.Price_Modifier},
                      });
                        }
                      

                    }
                }
                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure(Error.Failure("Product", ex.Message));
            }
        }

        public async Task<Result<bool>> DeleteProductId(int Id_Product)
        {
            try
            {
                if(Id_Product == 0)
                {
                    return Result<bool>.Failure(Error.Failure("Id Usuario", "Erro Nunhum id selecionado!"));
                }
                var Produto = await _unitOfWorkAdmin.GetClassById<Product, int>(Id_Product, "Id");

                await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Product>(filters: new Dictionary<string, object>
                        {
                                { "Id", Produto.Id}
                        },

                 fieldsToUpdate: new Dictionary<string, object>
                 {
                             {"Isdelete",true },
                             {"Ativo",false },
                  });

                //var raizCaminhoProjeto = Directory.GetCurrentDirectory();

                //    // sobe duas pastas (Mercado.Api -> Backend -> novo_mercado_craibas_final)
                //    var raizCaminho = Directory.GetParent(raizCaminhoProjeto)!.Parent!.FullName;

                //    var pastaDestinoImage = Path.Combine(
                //        raizCaminho,
                //        "mercado-craibas",
                //        "Imagens",
                //        "Produtos"
                //    );
                var ImagensDelete = await _unitOfWorkAdmin.GetClassListById<Imagens_Products>(Id_Product, "Id_Product");

                foreach (var imagemDeleteId in ImagensDelete)
                    {
                    await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Imagens_Products>(filters: new Dictionary<string, object>
                        {
                                { "Id", imagemDeleteId.Id}
                        },

                    fieldsToUpdate: new Dictionary<string, object>
                    {
                             {"Isdelete",true },
                     });
                }
                //if (imagemDeleteId != null)
                //{
                //    var caminhoArquivo = Path.Combine(pastaDestinoImage, imagemDeleteId.Url_Imagem);

                //    if (File.Exists(caminhoArquivo))
                //    {
                //        File.Delete(caminhoArquivo);
                //    }

                //    await _unitOfWorkAdmin.DeleteAllByColumnAsync<Imagens_Products>("Id", imagemDeleteId.Id);
                //}
            //}
                var VariantsDelete = await _unitOfWorkAdmin.GetClassListById<Variante_Products>(Id_Product, "Id_Product");

                foreach (var VariantDeleteEtity in VariantsDelete)
                    {
                    await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Variante_Products>(filters: new Dictionary<string, object>
                        {
                                { "Id", VariantDeleteEtity.Id}
                        },

                        fieldsToUpdate: new Dictionary<string, object>
                        {
                              {"Isdelete",true },
                        });
                }
                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure(Error.Failure("Product", ex.Message));
            }
        }

    }
}
