namespace Pricing.Api.DTOs.Responses;

public class LoggedUserResponse
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Role { get; set; } = default!;
    public string? Avatar { get; set; }
}
