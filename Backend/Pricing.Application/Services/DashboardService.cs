//using Baldan.Pricing.Application.Commons;
//using Baldan.Pricing.Application.DTOs.Requests;
//using Baldan.Pricing.Application.DTOs.Responses;
//using Baldan.Pricing.Application.Interfaces.Repositories;
//using Baldan.Pricing.Application.Interfaces.Services;
//using Baldan.Pricing.Application.Models.Entities;
//using Pricing.Api.DTOs.Responses;

//public class DashboardService : IDashboardService
//{
//    private readonly IDashboardRepository _dashboardRepository;

//    public DashboardService(IDashboardRepository dashboardRepository)
//    {
//        _dashboardRepository = dashboardRepository;
//    }

//    public async Task<Result<PagedResult<ResponseSearch>>> SellerDashboardResearch(
//    SellerDashboardFilter filters,
//    int userId)
//    {
//        var pagedSearch =
//            await _dashboardRepository.GetSellerDashboardAsync(filters, userId);

//        var mapped = pagedSearch.Items.Select(s =>
//        {
//            var entry = s.SurveyEntries
//                .OrderBy(e => e.InsertDate)
//                .FirstOrDefault();

//            return new ResponseSearch
//            {
//                Period = s.Period.TwoMonthPeriod,
//                PeriodStatus = s.Period.PeriodStatus.ToString(),
//                Vertical = s.OwnerProduct.Vertical,
//                Family = s.OwnerProduct.Family.Name,
//                OwnerProducts = s.OwnerProduct.Name,
//                Manufacturer = s.ThirdProduct.Manufacturer.Name,
//                Derivacion = s.OwnerProduct.Derivation,
//                TrirdProduct = s.ThirdProduct.Name,
//                Uf = entry?.Uf ?? string.Empty,
//                City = entry?.City ?? string.Empty,
//                ResalePrice = entry?.ResalePrice ?? 0,
//                PriceIncludingTax = entry?.PriceIncludingTax ?? default,
//                ShippingIncludede = entry?.ShippingIncluded ?? default,
//                Percentage = entry?.Percentage ?? 0,
//                PaymentTerms = entry?.PaymentTerms ?? string.Empty,
//                Source = entry?.Source ?? string.Empty,
//                NameSource = entry?.NameSource ?? string.Empty,
//                Attachment = entry?.Attachment ?? string.Empty,
//                Observation = entry?.Observation ?? string.Empty,
//                EntryStatus = entry?.EntryStatus ?? string.Empty,
//                InsertDate = entry?.InsertDate ?? DateTime.MinValue,
//                UpdateDate = entry?.UpdateDate ?? DateTime.MinValue
//            };
//        }).ToList();

//        var result = new PagedResult<ResponseSearch>(
//            mapped,
//            pagedSearch.TotalCount,
//            pagedSearch.PageNumber,
//            pagedSearch.PageSize
//        );

//        return Result<PagedResult<ResponseSearch>>.Success(result);
//    }


//}
