using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.DTOs.API
{
    public sealed record ApiResponse<T>(
    bool Success,
    T? Data,
    ApiError? Error
)
    {
        public static ApiResponse<T> Ok(T data)
            => new(true, data, null);

        public static ApiResponse<T> Fail(ApiError error)
            => new(false, default, error);
    }
}
