using System;
namespace Baldan.Pricing.Application.Domain.Entities
{
    /// <summary>
    /// Um eixo de uma variação/SKU. Ex.: o SKU "Preto / 128GB" tem dois atributos:
    /// (Eixo="Cor", Valor="Preto") e (Eixo="Memória", Valor="128GB").
    /// Assim um produto pode ter duas ou mais variantes (cor × memória, etc.).
    /// </summary>
    public class Variante_Atributos : EntityBase
    {
        public int Id_Variante { get; set; }
        public Variante_Products Variante { get; set; }
        /// <summary>Nome do eixo (ex.: "Cor", "Memória", "Tamanho").</summary>
        public string Eixo { get; set; }
        /// <summary>Opção escolhida nesse eixo (ex.: "Preto", "128GB").</summary>
        public string Valor { get; set; }
    }
}
