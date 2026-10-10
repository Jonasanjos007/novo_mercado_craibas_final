using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Models.Enums;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;
using Mercado.Craibas.Application.Interfaces.Services;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.InterfacesAdmin;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace Mercado.Craibas.Application.ServicesAdmin
{
    public class CategoriaServiceAdmin : ICategoriaServiceAdmin
    {
        private readonly IUnitOfWorkAdmin _unitOfWorkAdmin;
        private readonly IConfiguration _configuration;
        private readonly IDeletionRecordService _deletionRecord;
        public CategoriaServiceAdmin(IUnitOfWorkAdmin unitOfWorkAdmin, IConfiguration configuration, IDeletionRecordService deletionRecord)
        {
            _unitOfWorkAdmin = unitOfWorkAdmin;
            _configuration = configuration;
            _deletionRecord = deletionRecord;
        }
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
        public async Task<Result<bool>> PostSaveCategory(CategoryRequest category, int IdUser)
        {
            if (category.Name == null)
            {
                return Result<bool>.Failure(Error.Failure("Campo Obrigatorio!", "Nome categoria obrigatorio!")
                );
            }
            if (category.Description == null)
            {
                    return Result<bool>.Failure(Error.Failure("Campo Obrigatorio!", "Descrição categoria obrigatorio!"));
            }
            if (category.Imagem == null)
            {
                    return Result<bool>.Failure(Error.Failure("Campo Obrigatorio!", "Imagem categoria obrigatorio!"));
            }
            if (category.Banners == null)
            {
                return Result<bool>.Failure(Error.Failure("Campo Obrigatorio!", "Pelo menos um banner categoria obrigatorio!"));
            }
            if (category.Meta_Title == null)
            {
                return Result<bool>.Failure(Error.Failure("Campo Obrigatorio!", "Titlo categoria obrigatorio!"));
            }
            if (category.Meta_Description == null)
            {
                return Result<bool>.Failure(Error.Failure("Campo Obrigatorio!", "Meta descrição categoria obrigatorio!"));
            }

            try
            {
                var OneCategory = new Product_Category();

                var pastaDestino = GetImagesFolder("Categorias");

                var nomesBanners = new List<string>();

                foreach (var imagem in category.Banners)
                {
                    var extensaoBanner = Path.GetExtension(imagem.FileName);
                    var nomeArquivoBanner = $"{Guid.NewGuid()}{extensaoBanner}";

                    nomesBanners.Add(nomeArquivoBanner);

                    var caminhoCompletoBanner = Path.Combine(pastaDestino, nomeArquivoBanner);

                    using var streamBanner = new FileStream(caminhoCompletoBanner, FileMode.Create);
                    await imagem.CopyToAsync(streamBanner);
                }

                var bannersString = string.Join(";", nomesBanners);

                var extensaoImage = Path.GetExtension(category.Imagem.FileName);
                var nomeArquivoImage = $"{Guid.NewGuid()}{extensaoImage}";
                var caminhoCompletoImage = Path.Combine(pastaDestino, nomeArquivoImage);
                using var stream = new FileStream(caminhoCompletoImage, FileMode.Create);
                await category.Imagem.CopyToAsync(stream);

                OneCategory = new Product_Category
                {
                    Category = category.Name,
                    Description = category.Description,
                    Banners = bannersString,
                    Color = category.Color,
                    Meta_Title = category.Meta_Title,
                    Imagem = nomeArquivoImage,
                    Meta_Description = category.Meta_Description,
                    Ativo = category.Ativo,
                };

                var InsertProduct = await _unitOfWorkAdmin.InsertAsyncReturnObjeto(OneCategory);

                if (InsertProduct is null)
                {
                    return Result<bool>.Failure(Error.Failure("Salvar Cátegoria", "Erro ao salvar a categoria!"));
                }
                var User = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == IdUser);

                if (User != null)
                {
                    var dataLog = DateTime.Now;

                    await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(
                        new Logs
                        {
                            Id_User = User.Id,
                            Log =
                                $"O administrador {User.Name} criou a categoria '{category.Name}' (ID: {InsertProduct.Id}).\n" +
                                $"Descrição: {category.Description}\n" +
                                $"Meta Title: {category.Meta_Title}\n" +
                                $"Meta Description: {category.Meta_Description}\n" +
                                $"Cor: {category.Color}\n" +
                                $"Status: {(category.Ativo == true ? "Ativo" : "Inativo")}\n" +
                                $"Imagem: {nomeArquivoImage}\n" +
                                $"Banners adicionados: {nomesBanners.Count}\n" +
                                $"Data/Hora: {dataLog:dd/MM/yyyy HH:mm:ss}",
                            Tipo = "NOVA CATEGORIA",
                            Nivel = "Admin",
                            Acao = "Criou uma categoria",
                            Info =
                                $"{User.Name} criou a categoria '{category.Name}' " +
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


        private static async Task<string> SalvarArquivo(IFormFile arquivo,string pastaDestino)
        {
            var extensao = Path
                .GetExtension(arquivo.FileName)
                .ToLowerInvariant();

            var extensoesPermitidas = new[]
            {".jpg",".jpeg",".png",".webp"};

            if (!extensoesPermitidas.Contains(extensao))
            {
                throw new InvalidOperationException(
                    $"Extensão de arquivo não permitida: {extensao}"
                );
            }

            var nomeArquivo = $"{Guid.NewGuid():N}{extensao}";

            var caminhoCompleto = Path.Combine(
                pastaDestino,
                nomeArquivo
            );

            await using var stream = new FileStream(
                caminhoCompleto,
                FileMode.CreateNew,
                FileAccess.Write,
                FileShare.None
            );

            await arquivo.CopyToAsync(stream);

            return nomeArquivo;
        }

        private static void RemoverArquivo(string pastaDestino,string? nomeArquivo)
        {
            if (string.IsNullOrWhiteSpace(nomeArquivo))
            {
                return;
            }

            /*
             * Path.GetFileName impede que alguém envie caminhos como:
             * ../../arquivo.config
             */
            var nomeSeguro = Path.GetFileName(nomeArquivo);

            var caminhoCompleto = Path.Combine(
                pastaDestino,
                nomeSeguro
            );

            if (File.Exists(caminhoCompleto))
            {
                File.Delete(caminhoCompleto);
            }
        }

        private static List<string> SepararNomesArquivos(string? arquivos)
        {
            if (string.IsNullOrWhiteSpace(arquivos))
            {
                return new List<string>();
            }

            return arquivos.Split(';',StringSplitOptions.RemoveEmptyEntries |StringSplitOptions.TrimEntries)
                .Select(Path.GetFileName).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        }
        public async Task<Result<bool>> UpdateCategory(CategoryRequest category,int IdUser)
        {
            if (category.Id <= 0)
            {
                return Result<bool>.Failure(Error.Failure("Categoria inválida","O ID da categoria é obrigatório."));
            }

            if (string.IsNullOrWhiteSpace(category.Name))
            {
                return Result<bool>.Failure(Error.Failure("Campo obrigatório","Nome da categoria obrigatório."));
            }

            if (string.IsNullOrWhiteSpace(category.Description))
            {
                return Result<bool>.Failure(Error.Failure("Campo obrigatório","Descrição da categoria obrigatória."));
            }

            if (string.IsNullOrWhiteSpace(category.Meta_Title))
            {
                return Result<bool>.Failure(Error.Failure("Campo obrigatório","Título da categoria obrigatório."));
            }

            if (string.IsNullOrWhiteSpace(category.Meta_Description))
            {
                return Result<bool>.Failure(Error.Failure("Campo obrigatório","Meta descrição da categoria obrigatória."));
            }

            try
            {
                var existingCategory = await _unitOfWorkAdmin.GetClassAsyncWhere<Product_Category>(x => x.Id == category.Id && x.Isdelete != true && x.Ativo == true);

                if (existingCategory is null)
                {
                    return Result<bool>.Failure(Error.Failure("Categoria não encontrada","Não foi possível localizar a categoria informada."));
                }
                var nomeAnterior = existingCategory.Category;
                var descricaoAnterior = existingCategory.Description;
                var corAnterior = existingCategory.Color;
                var metaTitleAnterior = existingCategory.Meta_Title;
                var metaDescriptionAnterior = existingCategory.Meta_Description;
                var ativoAnterior = existingCategory.Ativo;
                var imagemAnterior = existingCategory.Imagem;
                var bannersAnteriores = existingCategory.Banners;

                var pastaDestino = GetImagesFolder("Categorias");

                Directory.CreateDirectory(pastaDestino);

                /*
                 * IMAGEM PRINCIPAL
                 *
                 * Se category.Imagem vier preenchida:
                 * 1. salva a imagem nova;
                 * 2. remove a imagem antiga;
                 * 3. atualiza o nome no banco.
                 *
                 * Se vier null, mantém a imagem atual.
                 */
                if (category.Imagem is not null && category.Imagem.Length > 0)
                {
                    var nomeNovaImagem = await SalvarArquivo(
                        category.Imagem,
                        pastaDestino
                    );

                    var nomeImagemAntiga = existingCategory.Imagem;

                    existingCategory.Imagem = nomeNovaImagem;

                    RemoverArquivo(pastaDestino,nomeImagemAntiga);
                }

                /*
                 * BANNERS ANTIGOS
                 *
                 * Exemplo salvo no banco:
                 * banner1.jpg;banner2.jpg;banner3.jpg
                 */
                var bannersAntigos = SepararNomesArquivos(existingCategory.Banners);

                /*
                 * Banners que o frontend informou que devem continuar.
                 */
                var bannersMantidos = category.ExistingBanners?
                    .Where(nome => !string.IsNullOrWhiteSpace(nome))
                    .Select(Path.GetFileName)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList()
                    ?? new List<string>();

                /*
                 * Evita que o frontend informe nomes de arquivos que não
                 * pertenciam originalmente à categoria.
                 */
                bannersMantidos = bannersMantidos
                    .Where(nomeAntigo =>
                        bannersAntigos.Contains(
                            nomeAntigo,
                            StringComparer.OrdinalIgnoreCase
                        )).ToList();

                /*
                 * Descobre quais banners foram removidos no frontend.
                 */
                var bannersRemovidos = bannersAntigos
                    .Where(nomeAntigo =>
                        !bannersMantidos.Contains(
                            nomeAntigo,
                            StringComparer.OrdinalIgnoreCase
                        )).ToList();

                /*
                 * Salva apenas os banners novos.
                 */
                var novosNomesBanners = new List<string>();

                if (category.Banners is not null)
                {
                    foreach (var banner in category.Banners)
                    {
                        if (banner is null || banner.Length == 0)
                        {
                            continue;
                        }

                        var nomeNovoBanner = await SalvarArquivo(banner,pastaDestino);

                        novosNomesBanners.Add(nomeNovoBanner);
                    }
                }

                /*
                 * Resultado final:
                 * banners mantidos + banners novos.
                 */
                var bannersFinais = bannersMantidos
                    .Concat(novosNomesBanners)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                if (bannersFinais.Count == 0)
                {
                    /*
                     * Remove os arquivos novos que foram salvos antes
                     * de detectar que a categoria ficou sem banners.
                     */
                    foreach (var novoBanner in novosNomesBanners)
                    {
                        RemoverArquivo(pastaDestino,novoBanner);
                    }

                    return Result<bool>.Failure(Error.Failure("Campo obrigatório","Pelo menos um banner é obrigatório."));
                }

             
                var atualizado = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Product_Category>(filters: new Dictionary<string, object>
                        {
                                { "Id", existingCategory.Id },
                        },

                     fieldsToUpdate: new Dictionary<string, object>
                     {
                                {"Category",category.Name},
                                {"Description", category.Description},
                                {"Color", category.Color},
                                {"Meta_Title", category.Meta_Title},
                                {"Meta_Description", category.Meta_Description},
                                {"Ativo", category.Ativo},
                                {"Banners",string.Join(";", bannersFinais)},
                                {"Imagem", existingCategory.Imagem},
                                {"UpdateDate",  DateTime.Now}

                      });

                if (!atualizado)
                {
                    /*
                     * Caso o banco falhe, remove os arquivos novos
                     * para evitar arquivos órfãos.
                     */
                    foreach (var novoBanner in novosNomesBanners)
                    {
                        RemoverArquivo(pastaDestino,novoBanner);
                    }

                    return Result<bool>.Failure(Error.Failure("Atualizar categoria","Erro ao atualizar a categoria."));
                }

                /*
                 * Somente depois que o banco atualizou corretamente,
                 * remove os banners antigos que não são mais utilizados.
                 */
                foreach (var bannerRemovido in bannersRemovidos)
                {
                    RemoverArquivo(pastaDestino,bannerRemovido);
                }
                var User = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == IdUser);

                if (User != null)
                {
                    var dataLog = DateTime.Now;
                    var alteracoes = new List<string>();

                    if (nomeAnterior != category.Name)
                    {
                        alteracoes.Add($"Nome: '{nomeAnterior}' → '{category.Name}'");
                    }

                    if (descricaoAnterior != category.Description)
                    {
                        alteracoes.Add("Descrição da categoria foi alterada");
                    }

                    if (corAnterior != category.Color)
                    {
                        alteracoes.Add($"Cor: '{corAnterior}' → '{category.Color}'");
                    }
                    if (metaTitleAnterior != category.Meta_Title)
                    {
                        alteracoes.Add($"Meta Title: '{metaTitleAnterior}' → '{category.Meta_Title}'");
                    }
                    if (metaDescriptionAnterior != category.Meta_Description)
                    {
                        alteracoes.Add("Meta Description da categoria foi alterada");
                    }
                    if (ativoAnterior != category.Ativo)
                    {
                        alteracoes.Add($"Status: {(ativoAnterior == true ? "Ativo" : "Inativo")} → " + $"{(category.Ativo == true ? "Ativo" : "Inativo")}");
                    }
                    if (imagemAnterior != existingCategory.Imagem)
                    {
                        alteracoes.Add($"Imagem: '{imagemAnterior ?? "Nenhuma"}' → " + $"'{existingCategory.Imagem ?? "Nenhuma"}'");
                    }
                    var bannersAntigosSet = SepararNomesArquivos(bannersAnteriores);

                    var bannersAdicionados = novosNomesBanners.Count;
                    var bannersExcluidos = bannersRemovidos.Count;

                    if (bannersAdicionados > 0)
                    {
                        alteracoes.Add($"{bannersAdicionados} novo(s) banner(s) adicionado(s)");
                    }
                    if (bannersExcluidos > 0)
                    {
                        alteracoes.Add($"{bannersExcluidos} banner(s) removido(s)");
                    }
                    await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(
                        new Logs
                        {
                            Id_User = User.Id,

                            Log =
                                $"O administrador {User.Name} editou a categoria '{category.Name}' (ID: {existingCategory.Id}).\n" +
                                $"Alterações realizadas:\n" +
                                $"{(alteracoes.Count > 0
                                    ? string.Join("\n", alteracoes)
                                    : "Nenhuma alteração identificada.")}\n" +
                                $"Data/Hora: {dataLog:dd/MM/yyyy HH:mm:ss}",

                            Tipo = "Edicao",
                            Nivel = "Admin",
                            Acao = "Editou a categoria",

                            Info =
                                $"{User.Name} editou a categoria '{category.Name}' " +
                                $"em {dataLog:dd/MM/yyyy HH:mm}.",

                            InsertDate = dataLog
                        }
                    );
                }
                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure(Error.Failure("Categoria",ex.Message));
            }
        }

        public async Task<Result<bool>> DeleteCategory(DeleteCategoryRequest request ,int IdUser)
        {
            Product_Category categoryset = null;
            if (request.Id <= 0)
            {
                return Result<bool>.Failure(Error.Failure("Categoria inválida","O ID da categoria é obrigatório."));
            }

            if (string.IsNullOrWhiteSpace(request.Reason) || request.Reason.Trim().Length < 5)
            {
                return Result<bool>.Failure(Error.Validation("Motivo", "Informe o motivo da exclusão (mínimo de 5 caracteres)."));
            }

            // Lixeira: produtos (e suas imagens/variações) excluídos junto com a categoria
            var deletedImages = new List<Imagens_Products>();
            var deletedVariants = new List<Variante_Products>();

            var action = request.Action?.Trim().ToLowerInvariant();
            if (action is not "move" and not "delete")
            {
                return Result<bool>.Failure(Error.Failure("Ação inválida","Informe se os produtos devem ser substituídos ou excluídos."));
            }

            try
            {
                var category = await _unitOfWorkAdmin.GetClassAsyncWhere<Product_Category>(x => x.Id == request.Id && x.Isdelete != true);

                if (category is null)
                {
                    return Result<bool>.Failure(Error.Failure("Categoria não encontrada","A categoria informada não existe ou já foi excluída."));
                }

                var products = await _unitOfWorkAdmin.GetClassListAsyncWhere<Product>(x => x.Id_Category == request.Id && x.Isdelete != true);

                if (action == "move")
                {
                var replacement = await _unitOfWorkAdmin.GetClassAsyncWhere<Product_Category>(x => x.Id == request.ReplacementCategoryId.Value && x.Isdelete != true && x.Ativo == true);
                    categoryset = replacement;
                    if (!request.ReplacementCategoryId.HasValue || request.ReplacementCategoryId.Value <= 0 || request.ReplacementCategoryId.Value == request.Id)
                    {
                        return Result<bool>.Failure(Error.Failure("Categoria substituta inválida","Selecione outra categoria para receber os produtos."));
                    }


                    if (replacement is null)
                    {
                        return Result<bool>.Failure(Error.Failure("Categoria substituta não encontrada","A categoria substituta não existe ou está inativa."));
                    }

                    foreach (var product in products)
                    {
                        var moved = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Product>(new Dictionary<string, object> 
                            {
                                { "Id",product.Id }
                            },
                            new Dictionary<string, object>
                            {
                                { "Id_Category",replacement.Id },
                                { "UpdateDate",DateTime.Now }
                            });

                        if (!moved)
                        {
                            return Result<bool>.Failure(Error.Failure("Mover produtos","Não foi possível mover todos os produtos para a categoria substituta."));
                        }
                    }
                }
                else
                {
                    foreach (var product in products)
                    {
                        var deleted = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Product>(
                            new Dictionary<string, object> { { "Id",product.Id } },
                            new Dictionary<string, object>
                            {
                                { "Isdelete",true },
                                { "Ativo",false },
                                { "UpdateDate",DateTime.Now }
                            });

                        if (!deleted)
                        {
                            return Result<bool>.Failure(Error.Failure("Excluir produtos","Não foi possível excluir todos os produtos vinculados."));
                        }

                        var images = await _unitOfWorkAdmin.GetClassListAsyncWhere<Imagens_Products>(x => x.Id_Product == product.Id && x.Isdelete != true);
                        deletedImages.AddRange(images);

                        foreach (var image in images)
                        {
                            await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Imagens_Products>(
                                new Dictionary<string, object> { { "Id",image.Id } },
                                new Dictionary<string, object> { { "Isdelete",true } });
                        }

                        var variants = await _unitOfWorkAdmin.GetClassListAsyncWhere<Variante_Products>(x =>x.Id_Product == product.Id && x.Isdelete != true);
                        deletedVariants.AddRange(variants);

                        foreach (var variant in variants)
                        {
                            await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Variante_Products>(
                                new Dictionary<string, object> { { "Id",variant.Id } },
                                new Dictionary<string, object> { { "Isdelete",true } });
                        }
                    }
                }

                var categoryDeleted = await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Product_Category>(
                    new Dictionary<string, object> { { "Id",category.Id } },
                    new Dictionary<string, object>
                    {
                        { "Isdelete",true },
                        { "Ativo",false },
                        { "UpdateDate",DateTime.Now }
                
                    });

                var user = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == IdUser);

                // Lixeira
                if (categoryDeleted)
                {
                    var adminName = user?.Name ?? "Administrador";

                    var parentRecordId = await _deletionRecord.RegisterAsync(new DeletionRecordRequest
                    {
                        EntityType = EntityTypeDelete.Category,
                        EntityId = category.Id,
                        DisplayName = category.Category,
                        DeletedByUserId = IdUser,
                        DeletedByRole = "ADMIN",
                        DeletedByUserName = adminName,
                        Reason = request.Reason!.Trim(),
                        Entity = category,
                        Extra = action == "move"
                            ? new Dictionary<string, object?>
                            {
                                { "ProdutosMovidos", products.Count },
                                { "MovidosParaCategoria", categoryset?.Category },
                                { "MovidosParaCategoriaId", categoryset?.Id }
                            }
                            : new Dictionary<string, object?>
                            {
                                { "ProdutosExcluidos", products.Count }
                            }
                    });

                    if (action == "delete")
                    {
                        var productNames = products.ToDictionary(p => p.Id, p => p.Name);

                        var children = products
                            .Select(p => new DeletionRecordRequest
                            {
                                EntityType = EntityTypeDelete.Product,
                                EntityId = p.Id,
                                DisplayName = p.Name,
                                Entity = p
                            })
                            .Concat(deletedImages.Select(i => new DeletionRecordRequest
                            {
                                EntityType = EntityTypeDelete.ProductImage,
                                EntityId = i.Id,
                                DisplayName = $"Imagem do produto {productNames.GetValueOrDefault(i.Id_Product, $"#{i.Id_Product}")}",
                                Entity = i
                            }))
                            .Concat(deletedVariants.Select(v => new DeletionRecordRequest
                            {
                                EntityType = EntityTypeDelete.ProductVariant,
                                EntityId = v.Id,
                                DisplayName = $"{v.Name}: {v.Value} ({productNames.GetValueOrDefault(v.Id_Product, $"#{v.Id_Product}")})",
                                Entity = v
                            }))
                            .Select(c =>
                            {
                                c.DeletedByUserId = IdUser;
                                c.DeletedByRole = "ADMIN";
                                c.DeletedByUserName = adminName;
                                c.Reason = "Excluído junto com a categoria";
                                return c;
                            })
                            .ToList();

                        await _deletionRecord.RegisterChildrenAsync(parentRecordId, children);
                    }
                }

                if (user != null)
                {
                    var dataLog = DateTime.Now;

                    var acaoLog = action == "move"
                        ? "Excluiu a categoria e moveu os produtos"
                        : "Excluiu a categoria e os produtos";


                    var logDetalhado = action == "move"
                        ? $"O administrador {user.Name} excluiu a categoria '{category.Category}'.\n" +
                          $"Produtos vinculados: {products.Count}\n" +
                          $"Nova categoria dos produtos: '{categoryset!.Category}' (ID: {categoryset.Id})\n" +
                          $"Os produtos foram movidos para a categoria substituta antes da exclusão da categoria.\n" +
                          $"Data/Hora: {dataLog:dd/MM/yyyy HH:mm:ss}"
                        : $"O administrador {user.Name} excluiu a categoria '{category.Category}'.\n" +
                          $"Produtos vinculados excluídos: {products.Count}\n" +
                          $"Imagens e variantes dos produtos também foram marcadas como excluídas.\n" +
                          $"Data/Hora: {dataLog:dd/MM/yyyy HH:mm:ss}";

                    await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(
                        new Logs
                        {
                            Id_User = user.Id,
                            Log = logDetalhado,
                            Tipo = "EXCLUSAO CUPOM",
                            Nivel = "Admin",
                            Acao = acaoLog,
                            Info =
                                action == "move"
                                    ? $"{user.Name} excluiu a categoria '{category.Category}' " +
                                      $"e moveu {products.Count} produto(s) para outra categoria " +
                                      $"em {dataLog:dd/MM/yyyy HH:mm}."
                                    : $"{user.Name} excluiu a categoria '{category.Category}' " +
                                      $"e {products.Count} produto(s) vinculados " +
                                      $"em {dataLog:dd/MM/yyyy HH:mm}.",
                            InsertDate = dataLog
                        }
                    );
                }

                return categoryDeleted
                    ? Result<bool>.Success(true)
                    : Result<bool>.Failure(Error.Failure("Excluir categoria","Não foi possível excluir a categoria."));
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure(Error.Failure("Excluir categoria",ex.Message));
            }
        }
    }
}
