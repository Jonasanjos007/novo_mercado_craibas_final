using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Mercado.Craibas.Application.Interfaces.Services;
using Mercado.Craibas.Application.InterfacesAdmin;
using Mercado.Craibas.Application.InterfacesAdmin.Services;
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
    public class BannerServiceAdmin : IBannerAdminService
    {
        private readonly IUnitOfWorkAdmin _unitOfWorkAdmin;
        private readonly IConfiguration _configuration;
        private readonly IDeletionRecordService _deletionRecord;

        public BannerServiceAdmin(IUnitOfWorkAdmin unitOfWorkAdmin, IConfiguration configuration, IDeletionRecordService deletionRecord)
        {
            _unitOfWorkAdmin = unitOfWorkAdmin;
            _configuration = configuration;
            _deletionRecord = deletionRecord;
        }

        public async Task<Result<bool>> PostSaveBanner(BannerRequest request, int IdUser)
        {
            if (request.Imagem == null)
            {
                return Result<bool>.Failure(Error.Validation("Imagem", "Envie a imagem do banner."));
            }
            if (request.Data_Inicio.HasValue && request.Data_Fim.HasValue && request.Data_Fim < request.Data_Inicio)
            {
                return Result<bool>.Failure(Error.Validation("Data_Fim", "A data final não pode ser menor que a inicial."));
            }

            var nomeImagem = await SalvarImagem(request.Imagem);

            await _unitOfWorkAdmin.InsertAsyncReturnObjeto(new Banner
            {
                Imagem = nomeImagem,
                Link = string.IsNullOrWhiteSpace(request.Link) ? null : request.Link.Trim(),
                Ordem = request.Ordem,
                Ativo = request.Ativo,
                Data_Inicio = request.Data_Inicio,
                Data_Fim = request.Data_Fim,
                Id_User_Admin = IdUser,
                InsertDate = DateTime.Now
            });

            return Result<bool>.Success(true);
        }

        public async Task<Result<List<BannerResponse>>> GetListAllBanners()
        {
            var banners = await _unitOfWorkAdmin.Query<Banner>()
                .Where(x => x.Isdelete != true)
                .AsNoTracking()
                .OrderBy(x => x.Ordem)
                .ThenByDescending(x => x.InsertDate)
                .ToListAsync();

            return Result<List<BannerResponse>>.Success(banners.Select(MapTo).ToList());
        }

        public async Task<Result<List<BannerResponse>>> GetBannersAtivos()
        {
            var agora = DateTime.Now;

            var banners = await _unitOfWorkAdmin.Query<Banner>()
                .Where(x => x.Isdelete != true && x.Ativo
                    && (x.Data_Inicio == null || x.Data_Inicio <= agora)
                    && (x.Data_Fim == null || x.Data_Fim >= agora))
                .AsNoTracking()
                .OrderBy(x => x.Ordem)
                .ThenByDescending(x => x.InsertDate)
                .ToListAsync();

            return Result<List<BannerResponse>>.Success(banners.Select(MapTo).ToList());
        }

        public async Task<Result<bool>> PostUpdateBanner(BannerRequest request, int IdUser)
        {
            if (request.Id == 0)
            {
                return Result<bool>.Failure(Error.Validation("Id", "Nenhum banner selecionado."));
            }
            if (request.Data_Inicio.HasValue && request.Data_Fim.HasValue && request.Data_Fim < request.Data_Inicio)
            {
                return Result<bool>.Failure(Error.Validation("Data_Fim", "A data final não pode ser menor que a inicial."));
            }

            var banner = await _unitOfWorkAdmin.GetClassAsyncWhere<Banner>(x => x.Id == request.Id && x.Isdelete != true);
            if (banner == null)
            {
                return Result<bool>.Failure(Error.NotFound("Banner", "Banner não encontrado."));
            }

            var nomeImagem = banner.Imagem;
            if (request.Imagem != null)
            {
                nomeImagem = await SalvarImagem(request.Imagem);
            }

            await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Banner>(
                filters: new Dictionary<string, object> { { "Id", banner.Id } },
                fieldsToUpdate: new Dictionary<string, object>
                {
                    { "Imagem", nomeImagem },
                    { "Link", string.IsNullOrWhiteSpace(request.Link) ? null : request.Link.Trim() },
                    { "Ordem", request.Ordem },
                    { "Ativo", request.Ativo },
                    { "Data_Inicio", request.Data_Inicio },
                    { "Data_Fim", request.Data_Fim },
                    { "UpdateDate", DateTime.Now }
                });

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> PostUpdateActive(int IdBanner, int IdUser)
        {
            var banner = await _unitOfWorkAdmin.GetClassAsyncWhere<Banner>(x => x.Id == IdBanner && x.Isdelete != true);
            if (banner == null)
            {
                return Result<bool>.Failure(Error.NotFound("Banner", "Banner não encontrado."));
            }

            await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Banner>(
                filters: new Dictionary<string, object> { { "Id", banner.Id } },
                fieldsToUpdate: new Dictionary<string, object>
                {
                    { "Ativo", !banner.Ativo },
                    { "UpdateDate", DateTime.Now }
                });

            return Result<bool>.Success(true);
        }

        public async Task<Result<bool>> DeleteBanner(int IdBanner, int IdUser, string? reason)
        {
            if (IdBanner == 0)
            {
                return Result<bool>.Failure(Error.Validation("Id", "Nenhum banner selecionado."));
            }
            if (string.IsNullOrWhiteSpace(reason) || reason.Trim().Length < 5)
            {
                return Result<bool>.Failure(Error.Validation("Motivo", "Informe o motivo da exclusão (mínimo de 5 caracteres)."));
            }

            var banner = await _unitOfWorkAdmin.GetClassAsyncWhere<Banner>(x => x.Id == IdBanner && x.Isdelete != true);
            if (banner == null)
            {
                return Result<bool>.Failure(Error.NotFound("Banner", "Banner não encontrado ou já excluído."));
            }

            var admin = await _unitOfWorkAdmin.GetClassAsyncWhere<User_Admin>(x => x.Id == IdUser);

            await _deletionRecord.RegisterAsync(new DeletionRecordRequest
            {
                EntityType = EntityTypeDelete.Banner,
                EntityId = banner.Id,
                DisplayName = $"Banner #{banner.Id}",
                DeletedByUserId = IdUser,
                DeletedByRole = "ADMIN",
                DeletedByUserName = admin?.Name ?? "Administrador",
                Reason = reason.Trim(),
                Entity = banner
            });

            await _unitOfWorkAdmin.UpdateFieldsAsyncEntity<Banner>(
                filters: new Dictionary<string, object> { { "Id", banner.Id } },
                fieldsToUpdate: new Dictionary<string, object>
                {
                    { "Isdelete", true },
                    { "Ativo", false },
                    { "UpdateDate", DateTime.Now }
                });

            return Result<bool>.Success(true);
        }

        private static BannerResponse MapTo(Banner b) => new BannerResponse
        {
            Id = b.Id,
            Imagem = b.Imagem,
            Link = b.Link,
            Ordem = b.Ordem,
            Ativo = b.Ativo,
            Data_Inicio = b.Data_Inicio,
            Data_Fim = b.Data_Fim
        };

        private async Task<string> SalvarImagem(IFormFile imagem)
        {
            var pastaBase = _configuration["Storage:ImagesPath"];
            if (string.IsNullOrWhiteSpace(pastaBase))
            {
                throw new Exception("O caminho Storage:ImagesPath não foi configurado.");
            }

            var pastaDestino = Path.Combine(pastaBase, "Banners");
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
