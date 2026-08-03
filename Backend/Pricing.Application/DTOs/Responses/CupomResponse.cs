using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class CupomResponse
    {
        public int Id { get; set; }
        public string Name_Cupom { get; set; }
        public string Cod_Cupom { get; set; }
        public string Description { get; set; }
        public double Discont { get; set; }
        public int? Quantity_Used { get; set; }
        public int? Quantity_Uses { get; set; }
        public double? Minimum_Value { get; set; }
        public bool Active { get; set; }
        public DateTime? Date_Start { get; set; }
        public bool Show_Flash_Offer { get; set; }
        public DateTime? Date_end { get; set; }
    }
}
