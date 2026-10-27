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
        /// <summary>Telefone/WhatsApp da loja (só dígitos, com DDI).</summary>
        public string? PhoneSupport { get; set; }
        /// <summary>E-mail de contato da loja.</summary>
        public string? EmailSupport { get; set; }
    }
}
