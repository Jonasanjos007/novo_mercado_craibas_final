using Pricing.Api.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class CartItemResponse
    {
        public int Id { get; set; }
        public int Id_Cart { get; set; }
        public int Quantity { get; set; }
        public ProductVariationResponse SelectedVariation { get; set; }
        public ProductResponse Product { get; set; }
    }
}
