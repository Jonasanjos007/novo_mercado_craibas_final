using System;
using System.Collections.Generic;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class FinancasResumoResponse
    {
        public int Ano { get; set; }
        public int Mes { get; set; }
        public double Receita_Produtos { get; set; }
        public double Receita_Frete { get; set; }
        public double Receita_Total { get; set; }
        public double Custo_Produtos { get; set; }
        public double Lucro_Bruto { get; set; }
        public double Gastos { get; set; }
        public double Lucro_Liquido { get; set; }
        public double Margem_Percentual { get; set; }
        public double Desconto_Cupons { get; set; }
        public int Total_Pedidos { get; set; }
        public int Total_Itens { get; set; }
        public double Ticket_Medio { get; set; }
        public double Receita_Total_Anterior { get; set; }
        public double Lucro_Liquido_Anterior { get; set; }
        public double? Variacao_Receita_Percentual { get; set; }
        public double? Variacao_Lucro_Percentual { get; set; }
    }

    public class FinancasMesResponse
    {
        public int Ano { get; set; }
        public int Mes { get; set; }
        public string Label { get; set; }
        public double Receita { get; set; }
        public double Lucro_Liquido { get; set; }
        public double Gastos { get; set; }
    }

    public class TopProdutoLucroResponse
    {
        public int Id_Product { get; set; }
        public string Nome { get; set; }
        public int Quantidade_Vendida { get; set; }
        public double Receita { get; set; }
        public double Custo { get; set; }
        public double Lucro { get; set; }
        public double Margem_Percentual { get; set; }
    }

    public class DespesaResponse
    {
        public int Id { get; set; }
        public string Descricao { get; set; }
        public double Valor { get; set; }
        public string? Categoria { get; set; }
        public DateTime Data { get; set; }
        public string? Nome_Admin { get; set; }
    }
}
