using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class Cupom : EntityBase
    {
        public string Name_Cupom { get; set; }
        public string Cod_Cupom { get; set; }
        public string Descriotion { get; set; }
        public double Discont { get; set; }
        public bool Active { get; set; }
        public string Date_Start { get; set; }
        public string Date_end { get; set; }
        public double? Minimum_Value { get; set; }
        public ICollection<Orders> Orders { get; set; } = [];

    }
}
