using System;
using System.Collections.Generic;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class Brinde : EntityBase
    {
        public string Nome { get; set; }
        public string? Descricao { get; set; }
        public string? Imagem { get; set; }
        public int Estoque { get; set; }
        public bool Ativo { get; set; } = true;
        public int? Quantidade_Compras { get; set; }
        public DateTime? Data_Inicio { get; set; }
        public DateTime? Data_Fim { get; set; }
        public string? Colecao { get; set; }
        public ICollection<Brinde_Cliente> Brinde_Clientes { get; set; } = [];
    }
}
