using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class Imagens_Products : EntityBase
    {
        public int Id_Product { get; set; }

        public Product Product { get; set; }

        public string Url_Imagem { get; set; }
    }
}
