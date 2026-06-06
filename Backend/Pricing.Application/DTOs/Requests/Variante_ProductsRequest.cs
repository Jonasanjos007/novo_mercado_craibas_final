using Baldan.Pricing.Application.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class Variante_ProductsRequest
    {
        public int Id { get; set; }
        public int Id_Product { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }
        public string Type { get; set; }
        public int Stoke { get; set; }
        public double? Price_Modifier { get; set; }
    }
}
