using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class ProductReviewrequest
    {
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int Rating { get; set; }
        public List<IFormFile>Media { get; set; }
        public bool Recommend { get; set; }
        public string Comment { get; set; }

    }
}
