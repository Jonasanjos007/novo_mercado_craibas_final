//using Baldan.Pricing.Application.Commons;
//using Baldan.Pricing.Application.Domain.Enums;
//using Baldan.Pricing.Application.DTOs.Requests;
//using Baldan.Pricing.Application.DTOs.Responses;
//using Baldan.Pricing.Application.Interfaces.Repositories;
//using Baldan.Pricing.Application.Models.Entities;
//using Mercado.Craibas.Infrastructure.Data.Context;
//using Microsoft.EntityFrameworkCore;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace Mercado.Craibas.Infrastructure.Repositories
//{
//    public class DashboardRepository : IDashboardRepository
//    {

//        private readonly AppDbContext _context;

//        public DashboardRepository(AppDbContext context)
//        {
//            _context = context;
//        }


//        //public async Task<List<ResponseSearch>> SellerDashboardResearch(Ulid userId)
//        //{
//        //    var searches = await _context.Search
//        //        .Where(s => s.UserId == userId)
//        //        .Select(s => new
//        //        {
//        //            Search = s,
//        //            Users = s.User,
//        //            Period = s.Period,
//        //            OwnerProduct = s.OwnerProduct,
//        //            Family = s.OwnerProduct.Family,
//        //            ThirdProduct = s.ThirdProduct,
//        //            Manufacturer = s.ThirdProduct.Manufacturer,
//        //            SearchStatus = s.SearchStatus,
//        //            SurveyEntry = s.SurveyEntries,
//        //        })
//        //        .ToListAsync();

//        //    var result = new List<ResponseSearch>();

//        //    foreach (var item in searches)
//        //    {
//        //        var survey = item.SurveyEntry.FirstOrDefault();
//        //        result.Add(new ResponseSearch
//        //            {
//        //                Period = item.Period.TwoMonthPeriod,
//        //                PeriodStatus = item.Period.PeriodStatus.ToString(),
//        //                Vertical = item.OwnerProduct.Vertical,
//        //                Family = item.Family.Name,
//        //                OwnerProducts = item.OwnerProduct.Name,
//        //                Manufacturer = item.Manufacturer.Name,
//        //                Derivacion = item.OwnerProduct.Derivation,
//        //                TrirdProduct = item.ThirdProduct.Name,
//        //                Uf = survey?.Uf,
//        //                City = survey?.City,
//        //                ResalePrice = survey.ResalePrice,
//        //                PriceIncludingTax = survey.PriceIncludingTax,
//        //                ShippingIncludede = survey.ShippingIncluded,
//        //                Percentage = survey.Percentage,
//        //                PaymentTerms = survey?.PaymentTerms,
//        //                Source = survey?.Source,
//        //                NameSource = survey?.NameSource,
//        //                Attachment = survey?.Attachment,
//        //                Observation = survey?.Observation,
//        //                EntryStatus = survey?.EntryStatus,
//        //                InsertDate = item.Search.InsertDate,
//        //                UpdateDate = item.Search.UpdateDate
//        //        });
//        //    }
//        //    return result;

//        //}

//        public async Task<PagedResult<Search>> GetSellerDashboardAsync(
//    SellerDashboardFilter filters,
//    int userId)
//        {
//            var query = _context.Search
//                .Where(s => s.UserId == userId);

//            query = ApplyFilters(query, filters);

//            var totalCount = await query.CountAsync();

//            var items = await query
//                .Include(s => s.Period)
//                .Include(s => s.OwnerProduct)
//                    .ThenInclude(op => op.Family)
//                .Include(s => s.ThirdProduct)
//                    .ThenInclude(tp => tp.Manufacturer)
//                .Include(s => s.SurveyEntries)
//                .OrderByDescending(s => s.Period.TwoMonthPeriod)
//                .ThenBy(s => s.OwnerProduct.Name)
//                .Skip((filters.PageNumber - 1) * filters.PageSize)
//                .Take(filters.PageSize)
//                .AsNoTracking()
//                .ToListAsync();

//            return new PagedResult<Search>(
//                items,
//                totalCount,
//                filters.PageNumber,
//                filters.PageSize
//            );
//        }

//        private IQueryable<Search> ApplyFilters(
//    IQueryable<Search> query,
//    SellerDashboardFilter filters)
//        {
//            if (filters.PeriodStatus.HasValue)
//            {
//                query = query.Where(s =>
//                    s.Period.PeriodStatus == filters.PeriodStatus.Value);
//            }

//            if (!string.IsNullOrWhiteSpace(filters.Vertical))
//            {
//                query = query.Where(s =>
//                    s.OwnerProduct.Vertical == filters.Vertical);
//            }

//            if (!string.IsNullOrWhiteSpace(filters.Search))
//            {
//                var search = filters.Search.Trim();

//                query = query.Where(s =>
//                    EF.Functions.Like(s.OwnerProduct.Name, $"%{search}%") ||
//                    EF.Functions.Like(s.ThirdProduct.Name, $"%{search}%"));
//            }

//            if (filters.EntryStatus.HasValue)
//            {
//                query = query.Where(s =>
//                    s.SurveyEntries.Any(se =>
//                        se.EntryStatus == filters.EntryStatus.Value.ToString()));
//            }

//            if (!string.IsNullOrWhiteSpace(filters.Period))
//            {
//                query = query.Where(s =>
//                    s.Period.TwoMonthPeriod == filters.Period);
//            }

//            return query;
//        }

//    }
//}
