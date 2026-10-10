using Baldan.Pricing.Application.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class UserAdminResponse
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Avatar { get; set; }
        public ProfileEnum Role { get; set; }
        public bool Ativo { get; set; }
        public string? Phone { get; set; }
        public DateTime Insert_Date { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
