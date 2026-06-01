using Baldan.Pricing.Application.Commons;
using Pricing.Api.DTOs.Responses;
namespace backend.services.interfaces;

public interface IUserService
{
    //task<result<string>> createuser(createuserrequest request);
    Task<Result<UserResponse>> GetbyIdUser(int userid , string role);
}

