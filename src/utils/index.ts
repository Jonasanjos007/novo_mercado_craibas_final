export const formatPrice = (price: number): string => {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const formatDiscount = (original: number, current: number): number => {
  return Math.round(((original - current) / original) * 100);
};

export const formatInstallments = (price: number, installments: number): string => {
  const value = price / installments;
  return `${installments}x de ${formatPrice(value)}`;
};

export const getStarRating = (rating: number): string => {
  return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(rating));
};

export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const categoryLabels: Record<string, string> = {
  eletronicos: 'Eletrônicos',
  garrafas: 'Garrafas Stanley',
  acessorios: 'Acessórios',
  virais: 'Produtos Virais',
};
export const badgeLabel: Record<string, string> = {
  mais_vendido: 'Mais Vendido ',
  viral: 'Viral',
  oferta: 'Oferta',
  virais: 'Virais',
};

export const categoryIcons: Record<string, string> = {
  eletronicos: '📱',
  garrafas: '🧊',
  acessorios: '🎧',
  virais: '🔥',
};

export const badgeLabels: Record<string, string> = {
  novo: 'NOVO',
  'mais_vendido': 'MAIS VENDIDO',
  oferta: 'OFERTA',
  viral: 'VIRAL 🔥',
};

export const badgeColors: Record<string, string> = {
  novo: 'bg-blue-500',
  'mais-vendido': 'bg-amber-500',
  oferta: 'bg-rose-500',
  viral: 'bg-orange-500',
};

export const orderStatusLabels: Record<string, string> = {
  PENDENTE: 'PENDENTE',
  CONFIRMADO: 'CONFIRMADO',
  PREPARANDO: 'PREPARANDO',
  SAIU_PARA_ENTREGA: 'SAIU_PARA_ENTREGA',
  ENTREGUE: 'ENTREGUE',
  CANCELADO: 'CANCELADO',
};
export const orderStatusLabelsAtualize: Record<string, string> = {
  // PENDENTE: 'PENDENTE',
  CONFIRMADO: 'CONFIRMADO',
  PREPARANDO: 'PREPARANDO',
  SAIU_PARA_ENTREGA: 'SAIU_PARA_ENTREGA',
  ENTREGUE: 'ENTREGUE',
  CANCELADO: 'CANCELADO',
};
export const cupomStatusLabels: Record<string, string> = {
  active: "Ativos",
  paused: "Pausados",
  expired: "Vencidos",
  all: "Todos",
};

export const orderStatusColors: Record<string, string> = {
  PENDENTE: 'text-yellow-600 bg-yellow-50',
  CONFIRMADO: 'text-blue-600 bg-blue-50',
  PREPARANDO: 'text-purple-600 bg-purple-50',
  SAIU_PARA_ENTREGA: 'text-orange-600 bg-orange-50',
  ENTREGUE: 'text-green-600 bg-green-50',
  CANCELADO: 'text-red-600 bg-red-50',
};

export const orderStatusSteps = ['CONFIRMADO', 'PREPARANDO', 'SAIU_PARA_ENTREGA', 'ENTREGUE'];

export const getMensagemWhatsApp = (
  status: string,
  numeroPedido: string,
  nomeCliente?: string
) => {
  const cliente = nomeCliente
    ? `Olá, ${nomeCliente}! 👋`
    : "Olá! 👋";

  switch (status) {

    case orderStatusLabels.PENDENTE:
      return `${cliente}

         🛍️ *Mercado Craíbas*
         Recebemos o seu pedido *#${numeroPedido}* com sucesso.
         
         ⏳ Neste momento, seu pedido está *pendente de confirmação*.
         
         Assim que tivermos uma nova atualização, avisaremos você por aqui.
         
         Obrigado por comprar com o Mercado Craíbas! 🧡`;

    case orderStatusLabels.CONFIRMADO:
      return `${cliente}
         
         ✅ *Pedido confirmado!*
         
         Seu pedido *#${numeroPedido}* foi confirmado com sucesso.
         
         Agora ele seguirá para a próxima etapa e em breve começaremos a preparação.
         
         Obrigado por escolher o *Mercado Craíbas*! 🧡`;

    case orderStatusLabels.PREPARANDO:
      return `${cliente}
         
         📦 *Estamos preparando seu pedido!*
         
         Seu pedido *#${numeroPedido}* já está sendo separado e preparado com todo cuidado.
         
         Assim que ele sair para entrega, avisaremos você por aqui. 🚚
         
         *Mercado Craíbas* 🧡`;

    case orderStatusLabels.SAIU_PARA_ENTREGA:
      return `${cliente}
         
         🚚 *Seu pedido saiu para entrega!*
         
         Boas notícias!
         
         O pedido *#${numeroPedido}* já está a caminho do endereço informado.
         
         Fique atento para recebê-lo. 😊
         
         *Mercado Craíbas* 🧡`;

    case orderStatusLabels.ENTREGUE:
      return `${cliente}
         
         🎉 *Pedido entregue!*
         
         O pedido *#${numeroPedido}* foi marcado como entregue.
         
         Esperamos que você aproveite sua compra!
         
         Muito obrigado por comprar no *Mercado Craíbas*. 🧡`;

    case orderStatusLabels.CANCELADO:
      return `${cliente}
         
         ❌ *Pedido cancelado*
         
         O pedido *#${numeroPedido}* foi cancelado.
         
         Se tiver alguma dúvida sobre o cancelamento ou precisar de ajuda, entre em contato conosco.
         
         Estamos à disposição.
         
         *Mercado Craíbas* 🧡`;

    default:
      return `${cliente}
         
         📋 Temos uma nova atualização sobre o pedido *#${numeroPedido}*.
         
         Acompanhe as informações pelo Mercado Craíbas.`;
  }
};