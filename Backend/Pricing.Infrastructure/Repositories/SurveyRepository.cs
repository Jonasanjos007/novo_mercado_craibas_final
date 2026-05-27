//using Baldan.Pricing.Application.Interfaces.Repositories;
//using Baldan.Pricing.Application.Models.Entities;
//using Mercado.Craibas.Infrastructure.Data.Context;
//using Microsoft.EntityFrameworkCore;
//using Pricing.Api.DTOs.Responses;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;
//using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

//namespace Mercado.Craibas.Infrastructure.Repositories
//{
//    public class SurveyRepository : ISurveyRepository
//    {

//        private readonly AppDbContext _context;

//        public SurveyRepository(AppDbContext context)
//        {
//            _context = context;
//        }

//        public async Task<IEnumerable<SurveyEntry?>> SearchAsync(int userId,
//        string? status,
//        string? vertical,
//        string? searchTerm
//            )
//        {

//            var query = _context.SurveyEntry.AsQueryable();

//            //query = query.Where(c => c.UserId == userId);

//            //if (!string.IsNullOrEmpty(search.SearchStatus.Status))
//            //{
//            //    query = query.Where(c => c.CycleStatus == search.SearchStatus.Status);
//            //}

//            //if (!string.IsNullOrEmpty(search.SearchStatus.Status))
//            //{
//            //    query = query.Where(c => c.CycleStatus == search.SearchStatus.Status);
//            //}

//            //if (!string.IsNullOrEmpty(vertical))
//            //{
//            //    query = query.Where(c => c.Vertical == vertical);
//            //}

//            //if (!string.IsNullOrEmpty(search))
//            //{
//            //    query = query.Where(c =>
//            //        c.OwnProductName.Contains(search) ||
//            //        c.CompetitorBrand != null && c.CompetitorBrand.Contains(search) ||
//            //        c.CompetitorModel != null && c.CompetitorModel.Contains(search)
//            //    );
//            //}

//            //if (!string.IsNullOrEmpty(searchTerm))
//            //{
//            //    query = query.Where(c =>
//            //        c.OwnProductName.Contains(searchTerm) ||
//            //        (c.CompetitorBrand != null && c.CompetitorBrand.Contains(searchTerm)) ||
//            //        (c.CompetitorModel != null && c.CompetitorModel.Contains(searchTerm))
//            //    );
//            //}

//            //return await query.ToListAsync();

//            return [];
//        }

//    }
//}

