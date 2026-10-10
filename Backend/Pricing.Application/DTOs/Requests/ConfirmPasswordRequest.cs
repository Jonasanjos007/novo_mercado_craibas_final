namespace Mercado.Craibas.Application.DTOs.Requests
{
    /// <summary>
    /// Senha para confirmar uma ação sensível (ex: remover dispositivo).
    /// </summary>
    public class ConfirmPasswordRequest
    {
        public string? Password { get; set; }
    }
}
