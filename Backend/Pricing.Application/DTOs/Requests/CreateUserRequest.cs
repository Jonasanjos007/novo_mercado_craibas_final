public class CreateUserRequest
{
    public string Name { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Role { get; set; } = default!;
    public string Password { get; set; } = default!;
    public string? Avatar { get; set; }
}