using Baldan.Pricing.Application.Domain.Entities;
using Baldan.Pricing.Application.Domain.Enums;
using Mercado.Craibas.Application.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class UserRantingresponse
    {
        public string Name { get; set; }
        public string? Avatar { get; set; }
        public ProfileEnum Role { get; set; }
    }
}
