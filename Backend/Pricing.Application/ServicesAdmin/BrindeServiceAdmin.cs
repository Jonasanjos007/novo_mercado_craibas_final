using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces.Services;
using Mercado.Craibas.Application.InterfacesAdmin;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
using Mercado.Craibas.Application.Payments;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.ServicesAdmin
{
    public class BrindeServiceAdmin : IBrindeAdminService
    {
        private readonly IUnitOfWorkAdmin _unitOfWorkAdmin;
        private readonly IConfiguration _configuration;
        private readonly IDeletionRecordService _deletionRecord;

        public BrindeServiceAdmin(IUnitOfWorkAdmin unitOfWorkAdmin, IConfiguration configuration, IDeletionRecordService deletionRecord)
        {
            _unitOfWorkAdmin = unitOfWorkAdmin;
            _configuration = configuration;
            _deletionRecord = deletionRecord;
        }

        public async Task<Result<bool>> PostSaveBrinde(BrindeRequest request, int IdUser)
        {
            if (string.IsNullOrWhiteSpace(request.Nome))
            {
                return Result<bool>.Failure(Error.Validation("Nome", "Informe o nome do brinde."));
            }
            if (request.Estoque < 0)
            {
                return Result<bool>.Failure(Error.Validation("Estoque", "O estoque não pode ser negativo."));
            }
            if (request.Quantidade_Compras is <= 0)
            {
                return Result<bool>.Failure(Error.Validation("Quantidade_Compras", "A quantidade de compras deve ser maior que zero."));
            }

            var nomeImagem = await SalvarImagem(request.Imagem);

            await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new Brinde
            {
                Nome = request.Nome.Trim(),
                Descricao = request.Descricao,
                Imagem = nomeImagem,
                Estoque = request.Estoque,
                Ativo = request.Ativo,
                Quantidade_Compras = request.Quantidade_Compras,
                Data_Inicio = request.Data_Inicio,
                Data_Fim = request.Data_Fim,
                Colecao = request.Colecao,
                InsertDate = DateTime.Now,
                Isdelete = false
            });

            return Result<bool>.Success(true);
        }

        public async Task<Result<List<BrindeResponse>>> GetListAllBrindes()
        {
            var brindes = await _unitOfWorkAdmin.Query<Brinde>()
                .Where(x => x.Isdelete != true)
                .AsNoTracking()
                .OrderByDescending(x => x.InsertDate)
                .ToListAsync();

            var entregas = await _unitOfWorkAdmin.Query<Brinde_Cliente>()
                .Where(x => x.Isdelete != true)
                .AsNoTracking()
                .GroupBy(x => new { x.Id_Brinde, x.Status })
                .Select(g => new { g.Key.Id_Brinde, g.Key.Status, Total = g.Count() })
                .ToListAsync();

            var lista = brindes.Select(b => new BrindeResponse
            {
                Id = b.Id,
                Nome = b.Nome,
                Descricao = b.Descricao,
                Imagem = b.Imagem,
                Estoque = b.Estoque,
                Ativo = b.Ativo,
                Quantidade_Compras = b.Quantidade_Compras,
                Data_Inicio = b.Data_Inicio,
                Data_Fim = b.Data_Fim,
                Colecao = b.Colecao,
                Total_Entregues = entregas.Where(e => e.Id_Brinde == b.Id && e.Status == "ENTREGUE").Sum(e => e.Total),
                Total_Pendentes = entregas.Where(e => e.Id_Brinde == b.Id && e.Status == "PENDENTE").Sum(e => e.Total)
            }).ToList();

            return Result<List<BrindeResponse>>.Success(lista);
        }

        public async Task<Result<bool>> PostUpdateBrinde(BrindeUpdateRequest request, int IdUser)
        {
 try
            {
                if (request.Id == 0)
                {
                    return Result<bool>.Failure(Error.Validation("Id", "Nenhum brinde selecionado."));
                }
                if (string.IsNullOrWhiteSpace(request.Nome))
                {
                    return Result<bool>.Failure(Error.Validation("Nome", "Informe o nome do brinde."));
                }
                if (request.Estoque < 0)
                {
                    return Result<bool>.Failure(Error.Validation("Estoque", "O estoque não pode ser negativo."));
                }
                if (request.Quantidade_Compras is <= 0)
                {
                    return Result<bool>.Failure(Error.Validation("Quantidade_Compras", "A quantidade de compras deve ser maior que zero."));
                }

                var brinde = await _unitOfWorkAdmin.GetClassAsyncWhere<Brinde>(x => x.Id == request.Id && x.Isdelete != true);
                if (brinde == null)
                {
                    return Result<bool>.Failure(Error.NotFound("Brinde", "Brinde não encontrado."));
                }

                var nomeImagem = brinde.Imagem;
                if (request.Imagem != null)
                {
                    nomeImagem = await SalvarImagem(request.Imagem);
                }
                else if (request.RemoverImagem)
                {
                    nomeImagem = null;
                }

                await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Brinde>(
                    filters: new Dictionary<string, object> { { "Id", brinde.Id } },
                    fieldsToUpdate: new Dictionary<string, object>
                    {
                    { "Nome", request.Nome.Trim() },
                    { "Descricao", request.Descricao },
                    { "Imagem", nomeImagem  },
                    { "Estoque", request.Estoque },
                    { "Ativo", request.Ativo },
                    { "Quantidade_Compras", request.Quantidade_Compras  },
                    { "Data_Inicio", request.Data_Inicio  },
                    { "Data_Fim", request.Data_Fim  },
                    { "Colecao",   request.Colecao  },
                    { "UpdateDate", DateTime.Now }
                    });
            }
            catch (Exception ex)
            {
                Console.WriteLine("ERRO AO ATUALIZAR BRINDE:");
                Console.WriteLine(ex.ToString());

                return Result<bool>.Failure(
                    Error.Failure("Brinde.UpdateError", ex.Message)
                );
            }

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeleteBrinde(int IdBrinde, int IdUser, string? reason)
        {
            if (IdBrinde == 0)
            {
                return Result<bool>.Failure(Error.Validation("Id", "Nenhum brinde selecionado."));
            }
            if (string.IsNullOrWhiteSpace(reason) || reason.Trim().Length < 5)
            {
                return Result<bool>.Failure(Error.Validation("Motivo", "Informe o motivo da exclusão (mínimo de 5 caracteres)."));
            }

            var brinde = await _unitOfWorkAdmin.GetClassAsyncWhere<Brinde>(x => x.Id == IdBrinde && x.Isdelete != true);
            if (brinde == null)
            {
                return Result<bool>.Failure(Error.NotFound("Brinde", "Brinde não encontrado ou já excluído."));
            }

            var admin = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == IdUser);

            await _deletionRecord.RegisterAsync(new DeletionRecordRequest
            {
                EntityType = EntityTypeDelete.Brinde,
                EntityId = brinde.Id,
                DisplayName = brinde.Nome,
                DeletedByUserId = IdUser,
                DeletedByRole = "ADMIN",
                DeletedByUserName = admin?.Name ?? "Administrador",
                Reason = reason.Trim(),
                Entity = brinde
            });

            await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Brinde>(
                filters: new Dictionary<string, object> { { "Id", brinde.Id } },
                fieldsToUpdate: new Dictionary<string, object>
                {
                    { "Isdelete", true },
                    { "Ativo", false },
                    { "UpdateDate", DateTime.Now }
                });

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> PostUpdateActive(int IdBrinde, int IdUser)
        {
            var brinde = await _unitOfWorkAdmin.GetClassAsyncWhere<Brinde>(x => x.Id == IdBrinde && x.Isdelete != true);
            if (brinde == null)
            {
                return Result<bool>.Failure(Error.NotFound("Brinde", "Brinde não encontrado."));
            }

            await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Brinde>(
                filters: new Dictionary<string, object> { { "Id", brinde.Id } },
                fieldsToUpdate: new Dictionary<string, object>
                {
                    { "Ativo", !brinde.Ativo },
                    { "UpdateDate", DateTime.Now }
                });

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> PostAtribuirBrinde(AtribuirBrindeRequest request, int IdUser)
        {
            var brinde = await _unitOfWorkAdmin.GetClassAsyncWhere<Brinde>(x => x.Id == request.Id_Brinde && x.Isdelete != true);
            if (brinde == null)
            {
                return Result<bool>.Failure(Error.NotFound("Brinde", "Brinde não encontrado."));
            }
            if (!brinde.Ativo)
            {
                return Result<bool>.Failure(Error.Validation("Brinde", "Este brinde está inativo."));
            }
            if (brinde.Estoque <= 0)
            {
                return Result<bool>.Failure(Error.Validation("Estoque", "Este brinde está sem estoque."));
            }

            var cliente = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Customer>(x => x.Id == request.Id_User_Customer);
            if (cliente == null)
            {
                return Result<bool>.Failure(Error.NotFound("Cliente", "Cliente não encontrado."));
            }

            var jaTem = await _unitOfWorkAdmin.Query<Brinde_Cliente>()
                .AnyAsync(x => x.Id_User_Customer == request.Id_User_Customer && x.Id_Brinde == request.Id_Brinde && x.Isdelete != true);
            if (jaTem)
            {
                return Result<bool>.Failure(Error.Conflict("Brinde", "Este cliente já recebeu este brinde."));
            }

            await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new Brinde_Cliente
            {
                Id_Brinde = request.Id_Brinde,
                Id_User_Customer = request.Id_User_Customer,
                Id_Order = request.Id_Order,
                Origem = "MANUAL",
                Status = "PENDENTE",
                InsertDate = DateTime.Now,
                Isdelete = false
            });

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> PostEntregarBrinde(int IdBrindeCliente, int IdUser)
        {
            var entrega = await _unitOfWorkAdmin.GetClassAsyncWhere<Brinde_Cliente>(x => x.Id == IdBrindeCliente && x.Isdelete != true);
            if (entrega == null)
            {
                return Result<bool>.Failure(Error.NotFound("Brinde", "Entrega de brinde não encontrada."));
            }
            if (entrega.Status == "ENTREGUE")
            {
                return Result<bool>.Failure(Error.Validation("Brinde", "Este brinde já foi entregue."));
            }

            var brinde = await _unitOfWorkAdmin.GetClassAsyncWhere<Brinde>(x => x.Id == entrega.Id_Brinde && x.Isdelete != true);
            if (brinde == null)
            {
                return Result<bool>.Failure(Error.NotFound("Brinde", "Brinde não encontrado."));
            }
            if (brinde.Estoque <= 0)
            {
                return Result<bool>.Failure(Error.Validation("Estoque", "Este brinde está sem estoque."));
            }

            var admin = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == IdUser);

            await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Brinde_Cliente>(
                filters: new Dictionary<string, object> { { "Id", entrega.Id } },
                fieldsToUpdate: new Dictionary<string, object>
                {
                    { "Status", "ENTREGUE" },
                    { "Entregue_Em", DateTime.Now },
                    { "Quem_Entregou", (object?)admin?.Name ?? DBNull.Value },
                    { "UpdateDate", DateTime.Now }
                });

            await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Brinde>(
                filters: new Dictionary<string, object> { { "Id", brinde.Id } },
                fieldsToUpdate: new Dictionary<string, object>
                {
                    { "Estoque", brinde.Estoque - 1 },
                    { "UpdateDate", DateTime.Now }
                });

            return Result<bool>.Success(true);
        }

        public async Task<Result<List<BrindeClienteResponse>>> GetListEntregas(string? status)
        {
            var query = _unitOfWorkAdmin.Query<Brinde_Cliente>()
                .Where(x => x.Isdelete != true);

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(x => x.Status == status);
            }

            var lista = await query
                .Include(x => x.Brinde)
                .Include(x => x.User_Customer)
                .Include(x => x.Order)
                .AsNoTracking()
                .OrderByDescending(x => x.InsertDate)
                .Select(x => new BrindeClienteResponse
                {
                    Id = x.Id,
                    Id_Brinde = x.Id_Brinde,
                    Nome_Brinde = x.Brinde.Nome,
                    Imagem_Brinde = x.Brinde.Imagem,
                    Colecao = x.Brinde.Colecao,
                    Id_User_Customer = x.Id_User_Customer,
                    Nome_Cliente = x.User_Customer.Name,
                    Id_Order = x.Id_Order,
                    Numero_Pedido = x.Order != null ? x.Order.Number_Order : null,
                    Origem = x.Origem,
                    Status = x.Status,
                    Entregue_Em = x.Entregue_Em,
                    Quem_Entregou = x.Quem_Entregou,
                    InsertDate = x.InsertDate
                })
                .ToListAsync();

            return Result<List<BrindeClienteResponse>>.Success(lista);
        }

        public async Task<Result<BrindePedidoResponse>> GetBrindesByOrder(int IdOrder)
        {
            var order = await _unitOfWorkAdmin.GetClassAsyncWhere<Orders>(x => x.Id == IdOrder && x.Isdelete != true);
            if (order == null)
            {
                return Result<BrindePedidoResponse>.Failure(Error.NotFound("Pedido", "Pedido não encontrado."));
            }

            var idCliente = order.Id_User_Customer ?? 0;

            var comprasConfirmadas = await _unitOfWorkAdmin.Query<Orders>()
                .CountAsync(x => x.Id_User_Customer == idCliente && x.Isdelete != true && x.Stock_Deducted_At != null);

            var brindes = await _unitOfWorkAdmin.Query<Brinde_Cliente>()
                .Where(x => x.Id_User_Customer == idCliente && x.Isdelete != true)
                .Include(x => x.Brinde)
                .Include(x => x.User_Customer)
                .Include(x => x.Order)
                .AsNoTracking()
                .OrderByDescending(x => x.InsertDate)
                .Select(x => new BrindeClienteResponse
                {
                    Id = x.Id,
                    Id_Brinde = x.Id_Brinde,
                    Nome_Brinde = x.Brinde.Nome,
                    Imagem_Brinde = x.Brinde.Imagem,
                    Colecao = x.Brinde.Colecao,
                    Id_User_Customer = x.Id_User_Customer,
                    Nome_Cliente = x.User_Customer.Name,
                    Id_Order = x.Id_Order,
                    Numero_Pedido = x.Order != null ? x.Order.Number_Order : null,
                    Origem = x.Origem,
                    Status = x.Status,
                    Entregue_Em = x.Entregue_Em,
                    Quem_Entregou = x.Quem_Entregou,
                    InsertDate = x.InsertDate
                })
                .ToListAsync();

            return Result<BrindePedidoResponse>.Success(new BrindePedidoResponse
            {
                Id_User_Customer = idCliente,
                Primeira_Compra = comprasConfirmadas <= 1,
                Quantidade_Compras = comprasConfirmadas,
                Brindes = brindes
            });
        }

        private async Task<string?> SalvarImagem(IFormFile? imagem)
        {
            if (imagem == null)
            {
                return null;
            }

            var pastaBase = _configuration["Storage:ImagesPath"];
            if (string.IsNullOrWhiteSpace(pastaBase))
            {
                throw new Exception("O caminho Storage:ImagesPath não foi configurado.");
            }

            var pastaDestino = Path.Combine(pastaBase, "Brindes");
            if (!Directory.Exists(pastaDestino))
            {
                Directory.CreateDirectory(pastaDestino);
            }

            var extensao = Path.GetExtension(imagem.FileName);
            var nomeArquivo = $"{Guid.NewGuid()}{extensao}";
            var caminhoCompleto = Path.Combine(pastaDestino, nomeArquivo);

            using var stream = new FileStream(caminhoCompleto, FileMode.Create);
            await imagem.CopyToAsync(stream);

            return nomeArquivo;
        }
    }
}
