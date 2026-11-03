using System;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class Despesa : EntityBase
    {
        public string Descricao { get; set; }
        public double Valor { get; set; }
        public string? Categoria { get; set; }
        public DateTime Data { get; set; }
        public int? Id_User_Admin { get; set; }
    }
}
