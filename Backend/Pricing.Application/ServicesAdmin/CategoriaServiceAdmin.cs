using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Models.Enums;
using Mercado.Craibas.Application.Domain.Entities;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.InterfacesAdmin;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Microsoft.AspNetCore.Http;
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
        public CategoriaServiceAdmin(IUnitOfWorkAdmin unitOfWorkAdmin)
        {
            _unitOfWorkAdmin = unitOfWorkAdmin;
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
      
                var raizProjeto = Directory.GetCurrentDirectory();

                // sobe duas pastas (Mercado.Api -> Backend -> novo_mercado_craibas_final)
                var raiz = Directory.GetParent(raizProjeto)!.Parent!.FullName;

                var pastaDestino = Path.Combine(raiz, "Imagens", "Categorias");

                if (!Directory.Exists(pastaDestino))
                {
                    Directory.CreateDirectory(pastaDestino);
                }

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

                await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(new Logs
                {
                    Id_User = IdUser,
                    Log = "Criou a Categoria" + " " + category.Name,
                    Tipo = "Adição",
                    Nivel = "Admin", 
                    Acao = User.Name + " " + User.Role + " " + $"Criou uma Categoria",
                    Info = User.Name + " " + User.Role + " " + $"Criou a Categoria em {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
                    InsertDate = DateTime.Now
                });
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

                var raizProjeto = Directory.GetCurrentDirectory();

                var raiz = Directory.GetParent(raizProjeto)!.Parent!.FullName;

                var pastaDestino = Path.Combine(raiz,"Imagens","Categorias");

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
                await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(new Logs
                {
                    Id_User = IdUser,
                    Log = $"Editou a categoria {category.Name} --------- {JsonSerializer.Serialize(category)}",
                    Tipo = "Edicao",
                    Nivel = "Admin",
                    Acao = User.Name + " " + User.Role + " " + $"Editou o Categoria",
                    Info = User.Name + " " + User.Role + " " + $"Editou o Categoria em {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
                    InsertDate = DateTime.Now
                });
                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure(Error.Failure("Categoria",ex.Message));
            }
        }

        public async Task<Result<bool>> DeleteCategory(DeleteCategoryRequest request ,int IdUser)
        {
            if (request.Id <= 0)
            {
                return Result<bool>.Failure(Error.Failure("Categoria inválida","O ID da categoria é obrigatório."));
            }

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
                    if (!request.ReplacementCategoryId.HasValue || request.ReplacementCategoryId.Value <= 0 || request.ReplacementCategoryId.Value == request.Id)
                    {
                        return Result<bool>.Failure(Error.Failure("Categoria substituta inválida","Selecione outra categoria para receber os produtos."));
                    }

                    var replacement = await _unitOfWorkAdmin.GetClassAsyncWhere<Product_Category>(x =>x.Id == request.ReplacementCategoryId.Value && x.Isdelete != true && x.Ativo == true);

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

                        foreach (var image in images)
                        {
                            await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Imagens_Products>(
                                new Dictionary<string, object> { { "Id",image.Id } },
                                new Dictionary<string, object> { { "Isdelete",true } });
                        }

                        var variants = await _unitOfWorkAdmin.GetClassListAsyncWhere<Variante_Products>(x =>x.Id_Product == product.Id && x.Isdelete != true);

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

                var User = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == IdUser);

                await _unitOfWorkAdmin.InsertAsyncReturnObjeto<Logs>(new Logs
                {
                    Id_User = IdUser,
                    Log = "Apagou a Categoria" + " " + category.Category ,
                    Tipo = "Deletou",
                    Nivel = "Admin",
                    Acao = User.Name + " " + User.Role + " " + $"apagou o Categoria",
                    Info = User.Name + " " + User.Role + " " + $"apagou o Categoria em {DateTime.Now:dd/MM/yyyy HH:mm:ss}",
                    InsertDate = DateTime.Now
                });

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
