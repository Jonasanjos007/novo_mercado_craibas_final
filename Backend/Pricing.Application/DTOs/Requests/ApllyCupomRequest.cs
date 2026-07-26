using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class ApllyCupomRequest
    {
        public string Cod_upom { get; set; }
        public List<ProductApllyCupom> ApllyProduct { get; set; }

    }
}
