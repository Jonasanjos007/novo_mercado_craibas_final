using Baldan.Pricing.Application.Domain.Enums;
using Baldan.Pricing.Application.Models.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.DTOs.Requests
{
    public class SellerDashboardFilter
    {
        public PeriodStatusEnum? PeriodStatus { get; init; }
        public SurveyEntryStatusEnum? EntryStatus { get; init; }
        public string? Vertical { get; init; }
        public string? Period { get; init; }
        public string? Search { get; init; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
    }
}
