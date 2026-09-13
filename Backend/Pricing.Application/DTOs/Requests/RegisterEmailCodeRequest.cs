using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class RegisterEmailCodeRequest
    {
        public int UserId { get; set; }
        public string Code { get; set; } = string.Empty;
    }
}
