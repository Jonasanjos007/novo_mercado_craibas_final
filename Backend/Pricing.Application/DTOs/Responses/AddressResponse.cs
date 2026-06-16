using Baldan.Pricing.Application.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class AddressResponse
    {
        public int Id { get; set; }
        public string Road { get; set; }
        public string Neighborhood { get; set; }
        public string Supplement { get; set; }
        public string ReferencePoint { get; set; }
        public string City { get; set; }
        public bool? Standard { get; set; }
        public int Number { get; set; }
        public string State { get; set; }
        public int? Id_User_Customer { get; set; }
        public int? Id_User_Delivery { get; set; }
    }
}
