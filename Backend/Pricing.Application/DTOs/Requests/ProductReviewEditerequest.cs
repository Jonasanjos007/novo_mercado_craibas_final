using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class ProductReviewEditerequest
    {
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public bool Recommend { get; set; }

        // Arquivos novos
        public List<IFormFile>? Media { get; set; }

        // Arquivos antigos que permaneceram
        public string? MediaEdite { get; set; }
    }
}
