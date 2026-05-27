using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Commons;
public sealed record Error(
    string Code,
    string Message,
    ErrorType Type)
{
    public static readonly Error None =
        new(string.Empty, string.Empty, ErrorType.None);

    public static Error Failure(string code, string message) =>
        new(code, message, ErrorType.Failure);

    public static Error Validation(string code, string message) =>
        new(code, message, ErrorType.Validation);

    public static Error NotFound(string code, string message) =>
        new(code, message, ErrorType.NotFound);

    public static Error Conflict(string code, string message) =>
        new(code, message, ErrorType.Conflict);

    public static Error Unauthorized(string code, string message) =>
        new(code, message, ErrorType.Unauthorized);

    public static Error Forbidden(string code, string message) =>
        new(code, message, ErrorType.Forbidden);
}

public enum ErrorType
{
    Failure,      // 500
    Validation,   // 400
    NotFound,     // 404
    Conflict,     // 409
    Unauthorized, // 401
    Forbidden,    // 403
    None          // No error
}
