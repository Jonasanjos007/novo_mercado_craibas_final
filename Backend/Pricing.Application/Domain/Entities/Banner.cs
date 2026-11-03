using System;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class Banner : EntityBase
    {
        public string Imagem { get; set; }
        public string? Link { get; set; }
        public int Ordem { get; set; }
        public bool Ativo { get; set; }
        public DateTime? Data_Inicio { get; set; }
        public DateTime? Data_Fim { get; set; }
        public int? Id_User_Admin { get; set; }
    }
}
