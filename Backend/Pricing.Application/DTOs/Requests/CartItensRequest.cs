using Baldan.Pricing.Application.Domain.Entities;
using Pricing.Api.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class CartItensRequest
    {
        public int Id { get; set; }
        public int Id_Cart { get; set; }
        public int Quantity { get; set; }
        public ProductResponse Product { get; set; }
        public Variante_ProductsRequest SelectedVariation { get; set; }
        public UserRequest User { get; set; }
        public string Operador { get; set; }
    }
}
