using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class UpdateQuantityRequest
    {
        public int Cart_Itens_Id { get; set; }
        public int Quantity { get; set; }
        public string Operador { get; set; } = string.Empty;
    }
}
