using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class ProductVariationResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }
        public string Type { get; set; }
        public int Stock { get; set; }
        public int Id_Product { get; set; }
        public double? Price_Modifier { get; set; }
        /// <summary>Eixos desta variação (ex.: Cor=Preto, Memória=128GB). Vazio = variação simples.</summary>
        public List<VariationAttributeResponse> Atributos { get; set; } = new();
    }

    public class VariationAttributeResponse
    {
        public string Eixo { get; set; }
        public string Valor { get; set; }
    }
}
