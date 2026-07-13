using Baldan.Pricing.Application.Domain.Enums;
using Baldan.Pricing.Application.Models.Enums;

namespace Baldan.Pricing.Application.DTOs.Responses
{
    public class ResponseSearch
    {
        public string Period { get; set; }
        public string PeriodStatus { get; set; }
        public string Vertical { get; set; }
        public string Family { get; set; }
        public string OwnerProducts { get; set; }
        public string Manufacturer { get; set; }
        public int Derivacion { get; set; }
        public string TrirdProduct { get; set; }
        public string Uf { get; set; }
        public string City { get; set; }
        public decimal ResalePrice { get; set; }
        public PriceIncludingTaxEnum PriceIncludingTax { get; set; }
        public ShippingIncludedeEnum ShippingIncludede { get; set; }
        public decimal Percentage { get; set; }
        public string PaymentTerms { get; set; }
        public string Source { get; set; }
        public string NameSource { get; set; }
        public string Attachment { get; set; }
        public string Observation { get; set; }
        public string EntryStatus { get; set; }
        public DateTime InsertDate { get; set; }
        public DateTime UpdateDate { get; set; }
    }
}
