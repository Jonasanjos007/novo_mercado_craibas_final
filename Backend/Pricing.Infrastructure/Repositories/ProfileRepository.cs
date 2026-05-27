//using Baldan.Pricing.Application.Domain.Enums;
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
//    public class ProfileRepository : IProfileRepository
//    {
//        private readonly AppDbContext _context;
//        public ProfileRepository(AppDbContext context)
//        {
//            _context = context;
//        }

//        public async Task<Profile?> GetByEnumAsync(ProfileEnum profileEnum)
//        {
//            return await _context.Profile
//                .AsNoTracking()
//                .FirstOrDefaultAsync(p => p.Profiles == profileEnum);
//        }
//    }
//}
