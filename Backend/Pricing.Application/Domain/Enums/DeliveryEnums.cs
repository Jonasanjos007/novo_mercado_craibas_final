namespace Mercado.Craibas.Application.Domain.Enums
{
    /// <summary>Como o entregador recebe.</summary>
    public enum DeliveryPayModeEnum
    {
        /// <summary>Um valor por pedido entregue.</summary>
        POR_PEDIDO,

        /// <summary>Um valor fixo por dia trabalhado (dia com pelo menos 1 entrega).</summary>
        POR_DIA
    }

    /// <summary>Tipo do valor no modo por pedido.</summary>
    public enum DeliveryValueTypeEnum
    {
        /// <summary>Valor fixo em R$.</summary>
        FIXO,

        /// <summary>Porcentagem do valor do pedido.</summary>
        PERCENTUAL
    }
}
