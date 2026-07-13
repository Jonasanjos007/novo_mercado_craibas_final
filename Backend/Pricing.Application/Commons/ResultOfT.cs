using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Baldan.Pricing.Application.Commons;

public sealed class Result<T>
{
    private readonly T _value;

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Error Error { get; }

    private Result(T value, bool isSuccess, Error error)
    {
        if (isSuccess && error != Error.None)
            throw new InvalidOperationException("Sucesso não pode conter erro.");

        if (!isSuccess && error == Error.None)
            throw new InvalidOperationException("Falha deve conter um erro.");

        if (isSuccess && value is null)
            throw new InvalidOperationException("Sucesso deve conter um valor.");

        _value = value!;
        IsSuccess = isSuccess;
        Error = error;
    }

    public static Result<T> Success(T value)
        => new(value, true, Error.None);

    public static Result<T> Failure(Error error)
        => new(default!, false, error);

    public T Value =>
        IsSuccess
            ? _value
            : throw new InvalidOperationException(
                "Não é possível acessar Value quando o Result é falho.");
}