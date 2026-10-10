namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class UserSessionResponse
    {
        public int Id { get; set; }
        public string DeviceName { get; set; } = string.Empty;
        public string DeviceType { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime LastUsedAt { get; set; }
        public bool IsCurrent { get; set; }
    }
}
