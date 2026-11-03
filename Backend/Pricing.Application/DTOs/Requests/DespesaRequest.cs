using System;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class DespesaRequest
    {
        public string Descricao { get; set; }
        public double Valor { get; set; }
        public string? Categoria { get; set; }
        public DateTime Data { get; set; }
    }

    public class DespesaUpdateRequest
    {
        public int Id { get; set; }
        public string Descricao { get; set; }
        public double Valor { get; set; }
        public string? Categoria { get; set; }
        public DateTime Data { get; set; }
    }
}
