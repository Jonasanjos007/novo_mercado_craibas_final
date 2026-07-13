using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.InterfacesAdmin;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
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
                    FreeShipping = product.FreeShipping,
                    installments = product.installments,
                    Tags = product.Tags,
                    Featured = product.Featured,
                    InsertDate = DateTime.Now
                };


                var InsertProduct = await _unitOfWorkAdmin.InsertAsyncReturnObjeto(OnePoduct);

                if (InsertProduct.Id == 0)
                {
                    return Result<bool>.Failure(Error.Failure("Pedido", "Erro ao salvar o pedido. Entre em contato com suporte!"));
                }
                var raizProjeto = Directory.GetCurrentDirectory();

                // sobe duas pastas (Mercado.Api -> Backend -> novo_mercado_craibas_final)
                var raiz = Directory.GetParent(raizProjeto)!.Parent!.FullName;

                var pastaDestino = Path.Combine(raiz, "mercado-craibas", "Imagens", "Produtos");

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

                    // sobe duas pastas (Mercado.Api -> Backend -> novo_mercado_craibas_final)
                    var raizCaminho = Directory.GetParent(raizCaminhoProjeto)!.Parent!.FullName;

                    var pastaDestinoImage = Path.Combine(
                        raizCaminho,
                        "mercado-craibas",
                        "Imagens",
                        "Produtos"
                    );

                    foreach (var imagemDeleteId in product.RemovedImages)
                    {
                        // Busca a imagem antes de excluir
                        var imagem = await _unitOfWorkAdmin.GetClassById<Imagens_Products>(imagemDeleteId, "Id");

                        if (imagem != null)
                        {
                            var caminhoArquivo = Path.Combine(pastaDestinoImage, imagem.Url_Imagem);

                            if (File.Exists(caminhoArquivo))
                            {
                                File.Delete(caminhoArquivo);
                            }

                            await _unitOfWorkAdmin.DeleteAllByColumnAsync<Imagens_Products>("Id", imagemDeleteId);
                        }
                    }
                }

                if (product.removedVariants.Count() != 0)
                {
                    foreach (var VariantDeleteId in product.removedVariants)
                    {
                        await _unitOfWorkAdmin.DeleteAllByColumnAsync<Variante_Products>("Id", VariantDeleteId);
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
                             {"UpdateDate", DateTime.Now }
                         });


                if(Update_Product)
                {
                    if(product.Imagens != null) 
                    {
                        var raizCaminhoProjeto = Directory.GetCurrentDirectory();

                        // sobe duas pastas (Mercado.Api -> Backend -> novo_mercado_craibas_final)
                        var raizCaminho = Directory.GetParent(raizCaminhoProjeto)!.Parent!.FullName;

                        var pastaDestinoImage = Path.Combine(raizCaminho, "mercado-craibas", "Imagens", "Produtos");

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
                                InsertDate = DateTime.Now
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

    }
}
