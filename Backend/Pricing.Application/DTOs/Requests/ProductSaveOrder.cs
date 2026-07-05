using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class ProductSaveOrder
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public double Price_Unic { get; set; }
        public int Quantity { get; set; }
        public double Origin_Price { get; set; }
        public Variante_ProductsRequest Variations { get; set; }

    }
}
