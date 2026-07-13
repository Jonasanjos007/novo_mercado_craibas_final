using Baldan.Pricing.Application.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class Imagens_ProductRequest
    {
        public int Id_Product { get; set; }

        public string Url_Imagem { get; set; }
    }
}
