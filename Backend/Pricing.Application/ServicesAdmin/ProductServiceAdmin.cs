using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Interfaces;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;
using Mercado.Craibas.Application.Interfaces.Services;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.Interfaces.Repositories;
using Mercado.Craibas.Application.InterfacesAdmin;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Pricing.Api.DTOs.Responses;
using Mercado.Craibas.Application.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;
namespace Mercado.Craibas.Application.ServicesAdmin
{
    public class ProductServiceAdmin : IProductServiceAdmin
    {
        private readonly IUnitOfWorkAdmin _unitOfWorkAdmin;
        private readonly IConfiguration _configuration;
        private readonly IDeletionRecordService _deletionRecord;

        public ProductServiceAdmin(
            IUnitOfWorkAdmin unitOfWorkAdmin,
            IConfiguration configuration,
            IDeletionRecordService deletionRecord)
        {
            _unitOfWorkAdmin = unitOfWorkAdmin;
            _configuration = configuration;
            _deletionRecord = deletionRecord;
        }
        //prod
        private string GetImagesFolder(string subPasta)
        {
            var pastaBase = _configuration["Storage:ImagesPath"];

            if (string.IsNullOrWhiteSpace(pastaBase))
            {
                throw new Exception(
                    "O caminho Storage:ImagesPath não foi configurado."
                );
            }

            if (string.IsNullOrWhiteSpace(subPasta))
            {
                throw new Exception(
                    "A subpasta da imagem não foi informada."
                );
            }

            var nomeSeguro = Path.GetFileName(subPasta);

            var pastaDestino = Path.Combine(
                pastaBase,
                nomeSeguro
            );

            Directory.CreateDirectory(pastaDestino);

            return pastaDestino;
        }
        // local
        //public string GetImagesFolder(string subPasta)
        //{
        //    if (string.IsNullOrWhiteSpace(subPasta))
        //        throw new Exception("A subpasta da imagem não foi informada.");

        //    var pastaDestino = Path.Combine(
        //        "..",
        //        "..",
        //        "Imagens",
        //        Path.GetFileName(subPasta)
        //    );

        //    Directory.CreateDirectory(pastaDestino);

        //    return pastaDestino;
        //}
        public async Task<Result<List<ProductResponse>>> GetProductListAdmin()
        {
            var Products = await _unitOfWorkAdmin.GetClassListAsyncWhere<Product>(x => x.Isdelete != true);

            if (Products == null || !Products.Any())
            {
                return Result<List<ProductResponse>>.Failure(Error.Failure("Produtos","Produtos não encontrados!"));
            }

            // Antes: 3 consultas por produto. Agora: 3 consultas no total, mesmo resultado.
            var productList = await BuildProductResponsesAsync(Products);

            return Result<List<ProductResponse>>.Success(productList);
        }

        // ═════════════════════════ PAGINAÇÃO ═════════════════════════

        /// <summary>
        /// Produtos paginados. Mesmas regras da tela e da lista completa:
        /// - só aparecem produtos não excluídos, com pelo menos uma variação e com categoria ativa;
        /// - busca: nome contém o texto; categoria: igual à escolhida;
        /// - ordem: mais recentes primeiro.
        /// Também devolve os contadores dos chips de categoria (sobre a busca atual).
        /// </summary>
        public async Task<Result<ProductsPageResponse>> GetProductsPagedAsync(int page, int pageSize, string? search, int? categoryId)
        {
            page = Paging.Page(page);
            pageSize = Paging.Size(pageSize);

            var categories = _unitOfWorkAdmin.Query<Product_Category>().AsNoTracking();
            var variants = _unitOfWorkAdmin.Query<Variante_Products>().AsNoTracking();

            // Mesmas regras de "continue" da lista completa
            var query = _unitOfWorkAdmin.Query<Product>()
                .AsNoTracking()
                .Where(x => x.Isdelete != true
                            && variants.Any(v => v.Id_Product == x.Id && v.Isdelete != true)
                            && categories.Any(c => c.Id == x.Id_Category && c.Isdelete != true));

            // A tela usa toLowerCase().includes(...) sem trim: a busca vazia não filtra
            var term = search ?? string.Empty;
            if (term.Length > 0)
                query = query.Where(x => x.Name.Contains(term));

            // Chips: total da busca e total por categoria
            var countsByCategory = await query
                .GroupBy(x => x.Id_Category)
                .Select(g => new { CategoryId = g.Key, Count = g.Count() })
                .ToListAsync();

            if (categoryId.HasValue)
                query = query.Where(x => x.Id_Category == categoryId.Value);

            var total = await query.CountAsync();

            var pageProducts = await query
                .OrderByDescending(x => x.InsertDate)
                .ThenBy(x => x.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = await BuildProductResponsesAsync(pageProducts);

            return Result<ProductsPageResponse>.Success(new ProductsPageResponse
            {
                Items = items,
                TotalCount = total,
                PageNumber = page,
                PageSize = pageSize,
                SearchTotal = countsByCategory.Sum(x => x.Count),
                CountsByCategory = countsByCategory.ToDictionary(x => x.CategoryId, x => x.Count)
            });
        }

        /// <summary>
        /// Monta a resposta dos produtos com as mesmas regras de sempre
        /// (pula produto sem variação ou sem categoria ativa), buscando
        /// variações, imagens e categorias de uma vez só.
        /// </summary>
        private async Task<List<ProductResponse>> BuildProductResponsesAsync(List<Product> Products)
        {
            var productList = new List<ProductResponse>();

            if (Products.Count == 0)
                return productList;

            var ids = Products.Select(x => x.Id).Distinct().ToList();
            var categoryIds = Products.Select(x => x.Id_Category).Distinct().ToList();

            var allVariants = await _unitOfWorkAdmin.GetClassListAsyncWhere<Variante_Products>(x => ids.Contains(x.Id_Product) && x.Isdelete != true);
            var allImages = await _unitOfWorkAdmin.GetClassListAsyncWhere<Imagens_Products>(x => ids.Contains(x.Id_Product) && x.Isdelete != true);
            var allCategories = await _unitOfWorkAdmin.GetClassListAsyncWhere<Product_Category>(x => categoryIds.Contains(x.Id) && x.Isdelete != true);

            var variantsByProduct = allVariants.GroupBy(x => x.Id_Product).ToDictionary(g => g.Key, g => g.ToList());
            var imagesByProduct = allImages.GroupBy(x => x.Id_Product).ToDictionary(g => g.Key, g => g.ToList());
            var categoriesById = allCategories.GroupBy(x => x.Id).ToDictionary(g => g.Key, g => g.First());

            foreach (var Product in Products)
            {
                if (!variantsByProduct.TryGetValue(Product.Id, out var variants) || variants.Count == 0)
                {
                    continue;
                }

                var Imagens_Product = imagesByProduct.TryGetValue(Product.Id, out var images) ? images : new List<Imagens_Products>();

                if (!categoriesById.TryGetValue(Product.Id_Category, out var CategoryName))
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

            return productList;
        }

        public async Task<Result<bool>> PostSaveProduct(ProductRequest product)
        {

            try
            {
                if (product.Name == null)
                {
                    return Result<bool>.Failure(Error.Failure("Produto", "Nome do produto e obrigatório!"));
                }
                if (product.Description == null)
                {
                    return Result<bool>.Failure(Error.Failure("Produto", "Descrição do produto e obrigatório!"));
                }
                if (product.Price_Unit == 0)
                {
                    return Result<bool>.Failure(Error.Failure("Produto", "Preço do produto e obrigatório!"));
                }
                if (product.Origin_Price == 0)
                {
                    return Result<bool>.Failure(Error.Failure("Produto", "Preço original do produto e obrigatório!"));
                }
                if (product.Origin_Price < product.Price_Unit)
                {
                    return Result<bool>.Failure(Error.Failure("Produto", "Preço original deve ser maior que o preço do produto!"));
                }
                if (product.Id_Category == null || product.Id_Category == 0)
                {
                    return Result<bool>.Failure(Error.Failure("Produto", "Categoria do produto e obrigatório!"));
                }
                if (product.Tags == null)
                {
                    return Result<bool>.Failure(Error.Failure("Produto", "Tags do produto e obrigatório!"));
                }
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
                    FreeShipping = false,
                    installments = product.installments,
                    Tags = product.Tags,
                    Featured = product.Featured,
                    Ativo = product.Ativo,
                    InsertDate = DateTime.Now,
                    Isdelete = false,
                    ShowBanner = product.ShowBanner,
                    ReviewCount = 0
                };


                var InsertProduct = await _unitOfWorkAdmin.InsertAsyncReturnObjeto(OnePoduct);

                if (InsertProduct.Id == 0)
                {
                    return Result<bool>.Failure(Error.Failure("Pedido", "Erro ao salvar o pedido. Entre em contato com suporte!"));
                }
                var pastaDestino = GetImagesFolder("Produtos");

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

        public async Task<Result<bool>>PostEditProduct(ProductRequest product,int IdUser)
        {
            try
            {



                if (product.Id == null)
                {
                    return Result<bool>.Failure(Error.Failure("Error", " Produto não selecionado!"));
                }
                if (product.Name == null)
                {
                    return Result<bool>.Failure(Error.Failure("Produto", "Nome do produto e obrigatório!"));
                }
                if (product.Description == null)
                {
                    return Result<bool>.Failure(Error.Failure("Produto", "Descrição do produto e obrigatório!"));
                }
                if (product.Price_Unit == 0)
                {
                    return Result<bool>.Failure(Error.Failure("Produto", "Preço do produto e obrigatório!"));
                }
                if (product.Origin_Price == 0)
                {
                    return Result<bool>.Failure(Error.Failure("Produto", "Preço original do produto e obrigatório!"));
                }
                if (product.Origin_Price < product.Price_Unit)
                {
                    return Result<bool>.Failure(Error.Failure("Produto", "Preço original deve ser maior que o preço do produto!"));
                }
                if (product.Id_Category == null || product.Id_Category == 0)
                {
                    return Result<bool>.Failure(Error.Failure("Produto", "Categoria do produto e obrigatório!"));
                }
                if (product.Tags == null)
                {
                    return Result<bool>.Failure(Error.Failure("Produto", "Tags do produto e obrigatório!"));
                }
                var produtoAtual = await _unitOfWorkAdmin.GetClassById<Product, int>(product.Id.Value,"Id");

                if (produtoAtual == null)
                {
                    return Result<bool>.Failure(
                        Error.Failure("Produto", "Produto não encontrado!")
                    );
                }

                var nomeAnterior = produtoAtual.Name;
                var descricaoAnterior = produtoAtual.Description;
                var precoAnterior = produtoAtual.Price_Unit;
                var precoOriginalAnterior = produtoAtual.Origin_Price;
                var categoriaAnterior = produtoAtual.Id_Category;
                var estoqueAnterior = produtoAtual.Total_Stock;
                var badgeAnterior = produtoAtual.Badge;
                var parcelasAnterior = produtoAtual.installments;
                var tagsAnterior = produtoAtual.Tags;
                var destaqueAnterior = produtoAtual.Featured ?? false;
                var ativoAnterior = produtoAtual.Ativo ?? true;
                var bannerAnterior = produtoAtual.ShowBanner ?? false;
                if (product.RemovedImages?.Any() == true)
                {
                    var pastaDestinoImage = GetImagesFolder("Produtos");

                    foreach (var imagemDeleteId in product.RemovedImages)
                    {
                        // Busca a imagem antes de excluir
                        var imagem = await _unitOfWorkAdmin.GetClassById<Imagens_Products,int>(imagemDeleteId, "Id");


                        if (imagem != null)
                        {

                       //      await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Imagens_Products>(filters: new Dictionary<string, object>
                       // {
                       //         { "Id", imagem.Id }
                       // },

                       //fieldsToUpdate: new Dictionary<string, object>
                       //{
                            
                       //      {"Isdelete",true},
                       //      {"UpdateDate", DateTime.Now }
                       // });
                            var caminhoArquivo = Path.Combine(pastaDestinoImage, imagem.Url_Imagem);

                            if (File.Exists(caminhoArquivo))
                            {
                                File.Delete(caminhoArquivo);
                            }

                            await _unitOfWorkAdmin.DeleteAllByColumnAsync<Imagens_Products>("Id", imagem.Id);
                        }
                    }
                }

                if (product.removedVariants.Count() != 0)
                {
                    foreach (var VariantDeleteId in product.removedVariants)
                    {
                      //  await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Variante_Products>(filters: new Dictionary<string, object>
                      //  {
                      //          { "Id", VariantDeleteId }
                      //  },

                      //fieldsToUpdate: new Dictionary<string, object>
                      //{

                      //       {"Isdelete",true},
                      //       {"UpdateDate", DateTime.Now }
                      // });
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
                             {"FreeShipping",false},
                             {"installments",product.installments},
                             {"Tags",product.Tags},
                             { "Featured", product.Featured},
                             { "Ativo", product.Ativo},
                             {"ShowBanner",product.ShowBanner},
                             {"UpdateDate", DateTime.Now }
                         });


                if (Update_Product)
                {
                    if (product.Imagens?.Any() == true)
                    {
                        var pastaDestinoImage = GetImagesFolder("Produtos");

                        foreach (var imagem in product.Imagens)
                        {
                            if (imagem.Length == 0)
                            {
                                continue;
                            }

                            var extensao = Path.GetExtension(imagem.FileName);
                            var nomeArquivo = $"{Guid.NewGuid()}{extensao}";

                            var caminhoCompleto = Path.Combine(
                                pastaDestinoImage,
                                nomeArquivo
                            );

                            await using var stream = new FileStream(
                                caminhoCompleto,
                                FileMode.Create
                            );

                            await imagem.CopyToAsync(stream);

                            await _unitOfWorkAdmin.InsertAsyncReturnObjeto(
                                new Imagens_Products
                                {
                                    Id_Product = product.Id ?? 0,
                                    Url_Imagem = nomeArquivo
                                }
                            );
                        }
                    }
                }
                if (product.Variants != null)
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
                             {"UpdateDate", DateTime.Now }
                      });
                        }
                      

                    }
                }
                var alteracoes = new List<string>();

                if (nomeAnterior != product.Name)
                {
                    alteracoes.Add($"Nome: '{nomeAnterior}' → '{product.Name}'");
                }

                if (descricaoAnterior != product.Description)
                {
                    alteracoes.Add("Descrição do produto foi alterada");
                }

                if (precoAnterior != product.Price_Unit)
                {
                    alteracoes.Add($"Preço: R$ {precoAnterior:N2} → R$ {product.Price_Unit:N2}");
                }

                if (precoOriginalAnterior != product.Origin_Price)
                {
                    alteracoes.Add($"Preço original: R$ {precoOriginalAnterior:N2} → R$ {product.Origin_Price:N2}");
                }

                if (categoriaAnterior != product.Id_Category)
                {
                    alteracoes.Add($"Categoria: {categoriaAnterior} → {product.Id_Category}");
                }

                if (estoqueAnterior != product.Total_Stock)
                {
                    alteracoes.Add($"Estoque: {estoqueAnterior} → {product.Total_Stock}");
                }
                if (badgeAnterior != product.Badge)
                {
                    alteracoes.Add($"Badge: '{badgeAnterior}' → '{product.Badge}'");
                }
                if (parcelasAnterior != product.installments)
                {
                    alteracoes.Add($"Parcelamento: '{parcelasAnterior}' → '{product.installments}'");
                }
                if (tagsAnterior != product.Tags)
                {
                    alteracoes.Add($"Tags: '{tagsAnterior}' → '{product.Tags}'");
                }
                if (destaqueAnterior != product.Featured)
                {
                    alteracoes.Add($"Destaque: {(destaqueAnterior ? "Sim" : "Não")} → " + $"{(product.Featured ?? false ? "Sim" : "Não")}");
                }
                if (ativoAnterior != product.Ativo)
                {
                    alteracoes.Add($"Status: {(ativoAnterior ? "Ativo" : "Inativo")} → " + $"{(product.Ativo ? "Ativo" : "Inativo")}");
                }
                if (bannerAnterior != product.ShowBanner)
                {
                    alteracoes.Add($"Exibição no banner: {(bannerAnterior ? "Sim" : "Não")} → " + $"{(product.ShowBanner ?? false ? "Sim" : "Não")}");
                }
                // IMAGENS
                if (product.Imagens?.Any() == true)
                {
                    alteracoes.Add($"{product.Imagens.Count} nova(s) imagem(ns) adicionada(s)");
                }
                if (product.RemovedImages?.Any() == true)
                {
                    alteracoes.Add($"{product.RemovedImages.Count} imagem(ns) removida(s)");
                }
                // VARIANTES
                if (product.Variants?.Any() == true)
                {
                    var novasVariantes = product.Variants.Count(x => x.New == true);
                    var variantesEditadas = product.Variants.Count(x => x.New != true);

                    if (novasVariantes > 0)
                    {
                        alteracoes.Add($"{novasVariantes} nova(s) variante(s) adicionada(s)");
                    }

                    if (variantesEditadas > 0)
                    {
                        alteracoes.Add($"{variantesEditadas} variante(s) editada(s)");
                    }
                }

                if (product.removedVariants?.Any() == true)
                {
                    alteracoes.Add($"{product.removedVariants.Count} variante(s) removida(s)");
                }

                var user = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(
                    x => x.Id == IdUser
                );

                if (user != null)
                {
                    var dataLog = DateTime.Now;

                    await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(
                        new Logs
                        {
                            Id_User = user.Id,
                            Log =
                                $"O administrador {user.Name} editou o produto '{product.Name}' (ID: {product.Id}).\n" +
                                $"Alterações realizadas:\n" +
                                $"{(alteracoes.Count > 0
                                    ? string.Join("\n", alteracoes)
                                    : "Nenhuma alteração identificada.")}\n" +
                                $"Data/Hora: {dataLog:dd/MM/yyyy HH:mm:ss}",
                            Tipo = "EDICAO",
                            Nivel = "Admin",
                            Acao = "Editou o produto",
                            Info =
                                $"{user.Name} editou o produto '{product.Name}' " +
                                $"em {dataLog:dd/MM/yyyy HH:mm}.",

                            InsertDate = dataLog
                        }
                    );
                }
                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure(Error.Failure("Product", ex.Message));
            }
        }

        public async Task<Result<bool>> DeleteProductId(int Id_Product, int IdUser, string? reason)
        {
            try
            {
                if(Id_Product == 0)
                {
                    return Result<bool>.Failure(Error.Failure("Id Usuario", "Erro Nunhum id selecionado!"));
                }

                if (string.IsNullOrWhiteSpace(reason) || reason.Trim().Length < 5)
                {
                    return Result<bool>.Failure(Error.Validation("Motivo", "Informe o motivo da exclusão (mínimo de 5 caracteres)."));
                }

                var Produto = await _unitOfWorkAdmin.GetClassAsyncWhere<Product>(x => x.Id == Id_Product && x.Isdelete != true);

                if (Produto is null)
                {
                    return Result<bool>.Failure(Error.NotFound("Produto", "Produto não encontrado ou já excluído."));
                }

                // Somente o que ainda não estava excluído (para a Lixeira restaurar exatamente isso)
                var ImagensDelete = await _unitOfWorkAdmin.GetClassListAsyncWhere<Imagens_Products>(x => x.Id_Product == Id_Product && x.Isdelete != true);
                var VariantsDelete = await _unitOfWorkAdmin.GetClassListAsyncWhere<Variante_Products>(x => x.Id_Product == Id_Product && x.Isdelete != true);

                await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Product>(filters: new Dictionary<string, object>
                        {
                                { "Id", Produto.Id}
                        },

                 fieldsToUpdate: new Dictionary<string, object>
                 {
                             {"Isdelete",true },
                             {"Ativo",false },
                             {"UpdateDate",DateTime.Now },
                  });

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

                // Lixeira
                var admin = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == IdUser);

                var parentRecordId = await _deletionRecord.RegisterAsync(new DeletionRecordRequest
                {
                    EntityType = EntityTypeDelete.Product,
                    EntityId = Produto.Id,
                    DisplayName = Produto.Name,
                    DeletedByUserId = IdUser,
                    DeletedByRole = "ADMIN",
                    DeletedByUserName = admin?.Name ?? "Administrador",
                    Reason = reason.Trim(),
                    Entity = Produto
                });

                var children = ImagensDelete
                    .Select(i => new DeletionRecordRequest
                    {
                        EntityType = EntityTypeDelete.ProductImage,
                        EntityId = i.Id,
                        DisplayName = $"Imagem do produto {Produto.Name}",
                        Entity = i
                    })
                    .Concat(VariantsDelete.Select(v => new DeletionRecordRequest
                    {
                        EntityType = EntityTypeDelete.ProductVariant,
                        EntityId = v.Id,
                        DisplayName = $"{v.Name}: {v.Value} ({Produto.Name})",
                        Entity = v
                    }))
                    .Select(c =>
                    {
                        c.DeletedByUserId = IdUser;
                        c.DeletedByRole = "ADMIN";
                        c.DeletedByUserName = admin?.Name ?? "Administrador";
                        c.Reason = "Excluído junto com o produto";
                        return c;
                    })
                    .ToList();

                await _deletionRecord.RegisterChildrenAsync(parentRecordId, children);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure(Error.Failure("Product", ex.Message));
            }
        }

    }
}
