using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class UserAdminRequest
    {
        public string Name{ get; set; }
        public string Email{ get; set; }
        public string Telefone{ get; set; }
        public IFormFile Avatar { get; set; }
        public bool Tema { get; set; }
    }
}
