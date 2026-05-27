using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Baldan.Pricing.Application.Commons;

namespace Baldan.Pricing.Application.Commons;

public sealed class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Error Error { get; }

    private Result(bool isSuccess, Error error)
    {
        if (isSuccess && error != Error.None)
            throw new InvalidOperationException("Sucesso não pode conter erro.");

        if (!isSuccess && error == Error.None)
            throw new InvalidOperationException("Falha deve conter um erro.");

        IsSuccess = isSuccess;
        Error = error;
    }

    public static Result Success()
        => new(true, Error.None);

    public static Result Failure(Error error)
        => new(false, error);
}
