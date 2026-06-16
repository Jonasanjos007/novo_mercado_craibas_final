using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class AddressRequest
    {
        public int? Id { get; set; }
        public string Road { get; set; }
        public string City { get; set; }
        public int Number { get; set; }
        public string State { get; set; }
        public int Id_User_Customer { get; set; }
        public string Neighborhood { get; set; }
        public string? referencePoint { get; set; }
        public string? supplement { get; set; }
        public bool? standard { get; set; }
    }
}
