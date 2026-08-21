using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class SendMessageViaWhatsAppResponse
    {
        public int IdOrder { get; set; }
        public string Status { get; set; }
        public double? Telefone { get; set; }
        public string Number_Order { get; set; }
        public string NomeCliente { get; set; }
    }
}
