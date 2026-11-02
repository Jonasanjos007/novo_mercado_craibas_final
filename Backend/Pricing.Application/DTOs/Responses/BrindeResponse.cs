using System;
using System.Collections.Generic;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class BrindeResponse
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string? Descricao { get; set; }
        public string? Imagem { get; set; }
        public int Estoque { get; set; }
        public bool Ativo { get; set; }
        public int? Quantidade_Compras { get; set; }
        public DateTime? Data_Inicio { get; set; }
        public DateTime? Data_Fim { get; set; }
        public string? Colecao { get; set; }
        public int Total_Entregues { get; set; }
        public int Total_Pendentes { get; set; }
    }

    public class BrindeClienteResponse
    {
        public int Id { get; set; }
        public int Id_Brinde { get; set; }
        public string Nome_Brinde { get; set; }
        public string? Imagem_Brinde { get; set; }
        public string? Colecao { get; set; }
        public int Id_User_Customer { get; set; }
        public string Nome_Cliente { get; set; }
        public int? Id_Order { get; set; }
        public string? Numero_Pedido { get; set; }
        public string Origem { get; set; }
        public string Status { get; set; }
        public DateTime? Entregue_Em { get; set; }
        public string? Quem_Entregou { get; set; }
        public DateTime InsertDate { get; set; }
    }

    public class BrindePedidoResponse
    {
        public int Id_User_Customer { get; set; }
        public bool Primeira_Compra { get; set; }
        public int Quantidade_Compras { get; set; }
        public List<BrindeClienteResponse> Brindes { get; set; } = new();
    }
}
