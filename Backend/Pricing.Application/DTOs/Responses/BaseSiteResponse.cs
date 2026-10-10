using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class BaseSiteResponse
    {
        public string StoreName { get; set; }
        public string StoreImage { get; set; }
        public string StoreImageIcone { get; set; }
        public double? ShippingCost { get; set; }
        public double? TimeframeBusinessDays { get; set; }
    }
}
