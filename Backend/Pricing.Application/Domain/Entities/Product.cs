using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class Product : EntityBase
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public double Price_Unit { get; set; }
        public double Origin_Price { get; set; }
        public int Id_Category { get; set; }
        public Product_Category Product_Category { get; set; }
        public double? Rating { get; set; }
        public int? ReviewCount { get; set; }
        public int CountSold { get; set; }
        public int Total_Stock { get; set; }
        public string? Badge { get; set; }
        public bool FreeShipping { get; set; }
        public int? installments { get; set; }
        public string Tags { get; set; }
        public bool? Featured { get; set; }
        public  string? Cod_Cupom { get; set; }
        public ICollection<Imagens_Products> Imagens_Products { get; set; } = [];
        public ICollection<Variante_Products> Variante_Products { get; set; } = [];
        public ICollection<Cart_Item> Cart_Items { get; set; } = [];
        public ICollection<OrderLineItens> OrderLineItens { get; set; } = [];

        public ICollection<Rating> Ratings { get; set; } = [];

    }
}
