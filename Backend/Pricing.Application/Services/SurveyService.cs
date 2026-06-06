////using Backend.Services.Interfaces;
////using Baldan.Pricing.Application.Models.Entities;
////using Microsoft.EntityFrameworkCore;
////using Pricing.Api.DTOs.Requests;
////using Pricing.Api.DTOs.Responses;

////public class SurveyService : ISurveyService
////{
////    private readonly ISurveyService _service;

////    public async Task<IEnumerable<DashboardCollectionResponse>> GetDashboardAsync(
////        Guid userId,
////        string? cycleStatus,
////        string? status,
////        string? vertical,
////        string? search
////    )
////    {

////    }

////    public async Task<Ulid> CreateSurveyAsync(Ulid userId, CollectionUpsertRequest request)
////    {
////        var entity = new Collection
////        {
////            UserId = userId,
////            CycleName = request.CycleName,
////            CycleStatus = request.CycleStatus,
////            Vertical = request.Vertical,
////            OwnProductName = request.OwnProductName,
////            Price = request.Price,
////            City = request.City,
////            Uf = request.Uf,
////            CompetitorBrand = request.CompetitorBrand,
////            CompetitorModel = request.CompetitorModel
////        };

////        _context.Collections.Add(entity);
////        await _context.SaveChangesAsync();

////        throw new NotImplementedException("Ainda estou refatorando aqui!");
////    }

////    public async Task<bool> UpdateSurveyAsync(Ulid id, CollectionUpsertRequest request)
////    {
////        var entity = await _context.Collections.FirstOrDefaultAsync(c => c.Id == id);
////        if (entity == null) return false;

////        entity.CycleName = request.CycleName;
////        entity.CycleStatus = request.CycleStatus;
////        entity.Vertical = request.Vertical;
////        entity.OwnProductName = request.OwnProductName;
////        entity.Price = request.Price;
////        entity.City = request.City;
////        entity.Uf = request.Uf;
////        entity.CompetitorBrand = request.CompetitorBrand;
////        entity.CompetitorModel = request.CompetitorModel;

////        await _context.SaveChangesAsync();
////        throw new NotImplementedException("Ainda estou refatorando aqui!");
////    }

////    public async Task<CollectionDetailResponse?> GetSurveyByIdAsync(Ulid id)
////    {
////        return await _context.Collections
////            .Where(c => c.Id == id)
////            .Select(c => new CollectionDetailResponse
////            {
////                Id = c.Id.ToString(),
////                UserId = c.UserId.ToString(),
////                CycleName = c.CycleName,
////                CycleStatus = c.CycleStatus,
////                Vertical = c.Vertical,
////                OwnProductName = c.OwnProductName,
////                Price = c.Price,
////                City = c.City,
////                Uf = c.Uf,
////                CompetitorBrand = c.CompetitorBrand,
////                CompetitorModel = c.CompetitorModel
////            })
////            .FirstOrDefaultAsync();

////        throw new NotImplementedException("Ainda estou refatorando aqui!");
////    }

////    public Task<Ulid> CreateSurveyAsync(Ulid userId)
////    {
////        throw new NotImplementedException();
////    }

////    public Task<bool> UpdateSurveyAsync(Ulid id)
////    {
////        throw new NotImplementedException();
////    }

////    Task<SurveyEntry?> ISurveyService.GetSurveyByIdAsync(Ulid id)
////    {
////        throw new NotImplementedException();
////    }

////    Task<IEnumerable<DashboardCollectionResponse>> ISurveyService.GetDashboardAsync(Guid userId, string? cycleStatus, string? status, string? vertical, string? search)
////    {
////        throw new NotImplementedException();
////    }

////    public Task<Guid> CreateAsync(Guid userId, CollectionUpsertRequest request)
////    {
////        throw new NotImplementedException();
////    }

////    public Task<bool> UpdateAsync(Guid id, CollectionUpsertRequest request)
////    {
////        throw new NotImplementedException();
////    }

////    Task<CollectionDetailResponse?> ISurveyService.GetByIdAsync(Guid id)
////    {
////        throw new NotImplementedException();
////    }
////}
