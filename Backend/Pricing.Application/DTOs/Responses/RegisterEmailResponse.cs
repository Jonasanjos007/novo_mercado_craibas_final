using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class RegisterEmailResponse
    {
        public int IdUser { get; set; }
        public string NextStep { get; set; }
        public string Name { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool? BackRegistration { get; set; }
    }
}
