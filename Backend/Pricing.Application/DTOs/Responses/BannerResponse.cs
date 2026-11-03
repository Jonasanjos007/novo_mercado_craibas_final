using System;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class BannerResponse
    {
        public int Id { get; set; }
        public string Imagem { get; set; }
        public string? Link { get; set; }
        public int Ordem { get; set; }
        public bool Ativo { get; set; }
        public DateTime? Data_Inicio { get; set; }
        public DateTime? Data_Fim { get; set; }
    }
}
