using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class RegisterPasswordResponse
    {
        public int IdUser { get; set; }

        public string NextStep { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

    }
}
