namespace Mercado.Craibas.Application.DTOs.Requests;

using Microsoft.AspNetCore.Http;

public class UpdateProfileRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public IFormFile Avatar { get; set; }

    /// <summary>Somente entregador: meio de transporte (moto, bicicleta...).</summary>
    public string? Transport { get; set; }
}
