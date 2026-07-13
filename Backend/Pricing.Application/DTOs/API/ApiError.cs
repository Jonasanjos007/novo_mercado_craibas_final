using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.DTOs.API
{
    public sealed record ApiError(
    string Code,
    string Message
    );
}
