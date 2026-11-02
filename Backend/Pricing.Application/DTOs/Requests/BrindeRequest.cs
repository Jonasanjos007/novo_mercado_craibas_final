using System;
using Microsoft.AspNetCore.Http;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class BrindeRequest
    {
        public string Nome { get; set; }
        public string? Descricao { get; set; }
        public int Estoque { get; set; }
        public bool Ativo { get; set; } = true;
        public int? Quantidade_Compras { get; set; }
        public DateTime? Data_Inicio { get; set; }
        public DateTime? Data_Fim { get; set; }
        public string? Colecao { get; set; }
        public IFormFile? Imagem { get; set; }
    }

    public class BrindeUpdateRequest
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string? Descricao { get; set; }
        public int Estoque { get; set; }
        public bool Ativo { get; set; } = true;
        public int? Quantidade_Compras { get; set; }
        public DateTime? Data_Inicio { get; set; }
        public DateTime? Data_Fim { get; set; }
        public string? Colecao { get; set; }
        public IFormFile? Imagem { get; set; }
        public bool RemoverImagem { get; set; } = false;
    }

    public class AtribuirBrindeRequest
    {
        public int Id_Brinde { get; set; }
        public int Id_User_Customer { get; set; }
        public int? Id_Order { get; set; }
    }
}
