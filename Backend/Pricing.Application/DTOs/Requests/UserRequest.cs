using Baldan.Pricing.Application.Domain.Enums;
using Mercado.Craibas.Application.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class UserRequest
    {
        public int Id { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Avatar { get; set; } = default!;
        public ProfileEnum Role { get; set; } = default!;
        public bool Ativo { get; set; } = default!;
        public double Phone { get; set; } = default!;
        public CartResponse? Cart_User { get; set; }
        public DateTime Insert_Date { get; set; } = default!;
    }
}
