using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class InfoSiteRequest
    {
        public string StoreName { get; set; }
        public IFormFile StoreImage { get; set; }
        public IFormFile StoreImageIcone { get; set; }
        /// <summary>Telefone/WhatsApp da loja. Vazio = mantém o atual.</summary>
        public string? PhoneSupport { get; set; }
        /// <summary>E-mail de contato da loja. Vazio = mantém o atual.</summary>
        public string? EmailSupport { get; set; }

    }
}
