using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class  Address : EntityBase
    {
        public string Road {  get; set; }
        public string Neighborhood { get; set; }
        public string? Supplement { get; set; }
        public string ReferencePoint { get; set; }
        public string City { get; set; }
        public int Number { get; set; }
        public string? State { get; set; }
        public bool? Standard { get; set; } 
        public int? Id_User_Customer { get; set; }
        public User_Customer? User_Customer {  get; set; }
        public int? Id_User_Delivery { get; set; }
        public User_Delivery? User_Delivery {  get; set; }
        public ICollection<Orders> Orders { get; set; } = [];


    }
}
