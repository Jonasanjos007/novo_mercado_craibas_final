namespace Mercado.Craibas.Application.DTOs.Requests
{
    /// <summary>
    /// Admin cria um novo acesso (somente ADMIN ou DELIVERY).
    /// Contas de cliente são criadas pelo cadastro do site.
    /// </summary>
    public class AdminCreateUserRequest
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? ConfirmEmail { get; set; }
        public string? Phone { get; set; }
        public string? Password { get; set; }
        public string? ConfirmPassword { get; set; }

        /// <summary>ADMIN ou DELIVERY.</summary>
        public string? Role { get; set; }

        /// <summary>Somente DELIVERY: meio de transporte.</summary>
        public string? Transport { get; set; }

        /// <summary>Senha do admin logado (obrigatória para criar outro ADMIN).</summary>
        public string? AdminPassword { get; set; }
    }
}
