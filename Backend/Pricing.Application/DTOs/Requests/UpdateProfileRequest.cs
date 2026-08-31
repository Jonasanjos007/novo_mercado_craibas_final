namespace Mercado.Craibas.Application.DTOs.Requests;

using Microsoft.AspNetCore.Http;

public class UpdateProfileRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public double? Phone { get; set; }
    public IFormFile Avatar { get; set; }
}
