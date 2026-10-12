using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;

namespace Mercado.Craibas.Application.Domain.Entities
{
    /// <summary>
    /// Configuração do pagamento dos entregadores (uma linha só).
    /// </summary>
    public class DeliverySettings : EntityBase
    {
        /// <summary>Desligado: o sistema não calcula nada para os entregadores.</summary>
        public bool TipEnabled { get; set; }

        public DeliveryPayModeEnum Mode { get; set; } = DeliveryPayModeEnum.POR_PEDIDO;

        /// <summary>Modo por pedido: valor fixo (R$) ou porcentagem do pedido.</summary>
        public DeliveryValueTypeEnum OrderValueType { get; set; } = DeliveryValueTypeEnum.FIXO;

        /// <summary>Modo por pedido: R$ ou % (depende de OrderValueType).</summary>
        public double OrderValue { get; set; }

        /// <summary>Modo por dia: valor de cada dia trabalhado.</summary>
        public double DailyValue { get; set; }

        /// <summary>Só conta entregas a partir desta data (null = todas).</summary>
        public DateTime? CountFrom { get; set; }

        /// <summary>Admin que alterou por último.</summary>
        public int? UpdatedById { get; set; }
    }
}
