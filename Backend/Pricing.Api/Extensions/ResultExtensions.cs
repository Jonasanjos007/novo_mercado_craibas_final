using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.DTOs.API;
using Microsoft.AspNetCore.Mvc;

namespace Pricing.Api.Extensions;

public static class ResultExtensions
{
    public static IActionResult ToActionResult<T>(
        this Result<T> result)
    {
        if (result.IsSuccess)
        {
            return new OkObjectResult(
                ApiResponse<T>.Ok(result.Value)
            );
        }

        return result.Error.ToActionResult();
    }

    public static IActionResult ToActionResult(
        this Result result)
    {
        if (result.IsSuccess)
        {
            return new OkObjectResult(
                new ApiResponse<object>(true, null, null)
            );
        }

        return result.Error.ToActionResult();
    }
}
