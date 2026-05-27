using Baldan.Pricing.Application.Commons;
using Baldan.Pricing.Application.DTOs.API;
using Microsoft.AspNetCore.Mvc;

namespace Pricing.Api.Extensions;

public static class ErrorExtensions
{
    public static IActionResult ToActionResult(
        this Error error)
    {
        var apiError = new ApiError(
            error.Code,
            error.Message
        );

        var response = ApiResponse<object>.Fail(apiError);

        return error.Type switch
        {
            ErrorType.Validation =>
                new BadRequestObjectResult(response),

            ErrorType.Unauthorized =>
                new UnauthorizedObjectResult(response),

            ErrorType.NotFound =>
                new NotFoundObjectResult(response),

            ErrorType.Conflict =>
                new ConflictObjectResult(response),

            _ =>
                new ObjectResult(response)
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                }
        };
    }
}


