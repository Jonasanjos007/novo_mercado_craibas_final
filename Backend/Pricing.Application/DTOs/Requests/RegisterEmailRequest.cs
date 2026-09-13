using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class RegisterEmailRequest
    {
        public int UserId { get; set; }

        public string Email { get; set; } = string.Empty;

        public string ConfirmEmail { get; set; } = string.Empty;
    }
}
