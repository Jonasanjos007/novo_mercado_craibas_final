using Baldan.Pricing.Application.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Domain.Entities
{
    public class BaseSite : EntityBase
    {
        public string StoreName { get; set; }
        public string StoreImage { get; set; }
        public string StoreImageIcone { get; set; }
        /// <summary>Telefone/WhatsApp da loja, só dígitos com DDI (ex.: 5582999999999).</summary>
        public string PhoneSupport { get; set; }
        /// <summary>E-mail de contato da loja (aparece no site).</summary>
        public string? EmailSupport { get; set; }

    }
}
