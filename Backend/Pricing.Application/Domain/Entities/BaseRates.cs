using Baldan.Pricing.Application.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Domain.Entities
{
    public class BaseRates : EntityBase
    {
        public double? ShippingCost { get; set; }
        public double? TimeframeBusinessDays { get; set; }
    }
}
