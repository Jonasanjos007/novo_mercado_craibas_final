using Baldan.Pricing.Application.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Domain.Entities
{
    public class Favorite : EntityBase
    {
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;
    }
}
