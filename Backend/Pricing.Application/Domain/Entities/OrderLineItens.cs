using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class OrderLineItens : EntityBase
    {
        public int Id_Order {  get; set; }
        public Orders Orders { get; set; }
        public int Id_Product { get; set; }
        public Product Product { get; set; }
        public int Id_Variante_Product { get; set; }
        public string Name_Product { get; set; }
        public string Variante_Name { get; set; }
        public string Variante_Value { get; set; }
        public string Variante_Type { get; set; }
        public int Quantity { get; set; }
        public double Total_Price { get; set; }
        public double Origin_Price { get; set; }
        public double Price_Unit { get; set; }
        public double? Discont { get; set; }
    }
}
