using Baldan.Pricing.Application.Commons;
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;
using Pricing.Api.DTOs.Responses;
namespace backend.services.interfaces;

public interface IUserService
{
    //task<result<string>> createuser(createuserrequest request);
    Task<Result<UserResponse>> GetbyIdUser(int userid , string role);
    Task<Result<bool>> UpdateProfile(int userId, string role, UpdateProfileRequest request);
    Task<Result<bool>> PostSaveAddressUserService(AddressRequest NewAnddress);
    Task<Result<List<AddressResponse>>> GetAddressbyIdUserService(int Id_User);
    Task<Result<bool>> PostUpdateAddressUserService(AddressRequest NewAnddress);
    Task<Result<bool>> DeleteAddressService(AddressRequest DeleteAddress);
    Task<Result<bool>> SaveColorGlobalInsertService(string Color, int Id_User);
    Task<Result<bool>> SaveLogUser(LogRequest Log, int? UserId);
    Task<Result<RegisterStartResponse>> RegisterStartAsync(RegisterStartRequest request);
    Task<Result<RegisterEmailResponse>> RegisterEmailConfirm(RegisterEmailRequest request);
    Task<Result<RegisterEmailResponse>> RegisterEmailCodeConfirm(int userId, string code);
    Task<Result<RegisterPasswordResponse>> RegisterPassword(int userId, string password, string confirmPassword);
    Task<Result<RegisterEmailResponse>> ResendCode(int userId, string email, string phone, string ipAddress);
    Task<Result<RegisterEmailResponse>> EditEmailNew(string emailInvalid, int userId);
}

