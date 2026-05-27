using Baldan.Pricing.Application.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class Orders : EntityBase
    {
        public string Number_Order {  get; set; }
        public double Total_Value_Order { get; set; }
        public double Discont {  get; set; }
        public double Discont_Percentage { get; set; }
        public int? Id_Cupom { get; set; }
        public Cupom? Cupom { get; set; }
        public string Payment_terms { get; set; }
        public int Id_User_Customer { get; set; }
        public User_Customer User_Customer { get; set; }
        public Order_Status Order_Status { get; set; }
        public int Id_Address { get; set; }
        public Address Address { get; set; }
        public int Id_User_Delivery { get; set; }
        public User_Delivery User_Delivery { get; set; }
        public double? Delivery_Commission { get; set; }
        public DateTime Estimated_Delivery_Date { get; set; }
        public ICollection<OrderLineItens> OrderLineItens { get; set; } = [];

    }
}
