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
        public string PhoneSupport { get; set; }

    }
}
