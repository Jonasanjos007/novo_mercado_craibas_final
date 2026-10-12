namespace Baldan.Pricing.Application.Commons;

/// <summary>
/// Regra única de senha do sistema.
/// Usada no cadastro do cliente, na troca de senha e na criação de usuários pelo admin.
///
/// - Mínimo de 8 caracteres
/// - Letra maiúscula, letra minúscula, número e caractere especial
/// - Não pode ser uma senha muito comum
/// </summary>
public static class PasswordPolicy
{
    public const int MinLength = 8;
    public const int MaxLength = 128;

    private static readonly HashSet<string> WeakPasswords = new(StringComparer.OrdinalIgnoreCase)
    {
        "12345678",
        "123456789",
        "1234567890",
        "password",
        "password123",
        "qwerty123",
        "senha123",
        "senha1234",
        "admin123",
        "Senha@123",
        "Admin@123",
        "Mudar@123"
    };

    /// <summary>Retorna null se a senha for válida, ou o erro.</summary>
    public static Error? Validate(string? password, string? confirmPassword, string code = "Senha")
    {
        if (string.IsNullOrWhiteSpace(password))
            return Error.Validation(code, "A senha é obrigatória.");

        if (password != confirmPassword)
            return Error.Validation(code, "As senhas não coincidem.");

        if (password.Length < MinLength)
            return Error.Validation(code, $"A senha deve possuir pelo menos {MinLength} caracteres.");

        if (password.Length > MaxLength)
            return Error.Validation(code, $"A senha deve possuir no máximo {MaxLength} caracteres.");

        if (WeakPasswords.Contains(password))
            return Error.Validation(code, "Essa senha é muito fácil de descobrir. Escolha uma senha mais forte.");

        if (!password.Any(char.IsUpper))
            return Error.Validation(code, "A senha deve possuir pelo menos uma letra maiúscula.");

        if (!password.Any(char.IsLower))
            return Error.Validation(code, "A senha deve possuir pelo menos uma letra minúscula.");

        if (!password.Any(char.IsDigit))
            return Error.Validation(code, "A senha deve possuir pelo menos um número.");

        if (!password.Any(ch => !char.IsLetterOrDigit(ch)))
            return Error.Validation(code, "A senha deve possuir pelo menos um caractere especial.");

        return null;
    }
}
