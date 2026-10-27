import { Activity, FolderPlus, LogIn, MessageCircle, Lock, Pencil, PlusCircle, RefreshCcw, Star, TicketCheck, TicketPlus, TicketX, Trash2, UserCheck, UserPlus, UserX, PackageCheck, CookingPot, Truck, PackageOpen, PackageX, UserRoundCheck, UserRoundX, Settings2, CircleDollarSign, HandCoins, BadgeCheck, BadgeX, Wallet, RotateCcw } from "lucide-react";

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

/** Andamento da devolução (pedido entregue). */
export const returnStatusLabels: Record<string, string> = {
  EM_ANALISE: 'Em análise de devolução',
  AGUARDANDO_COLETA: 'Coleta aprovada',
  EM_COLETA: 'Saiu para coleta',
  COLETADO: 'Produto coletado',
  DEVOLVIDO: 'Devolvido e estornado',
  CANCELADA: 'Devolução cancelada',
};

export const returnStatusColors: Record<string, string> = {
  EM_ANALISE: 'bg-amber-50 text-amber-700 border border-amber-200',
  AGUARDANDO_COLETA: 'bg-blue-50 text-blue-700 border border-blue-200',
  EM_COLETA: 'bg-violet-50 text-violet-700 border border-violet-200',
  COLETADO: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  DEVOLVIDO: 'bg-green-50 text-green-700 border border-green-200',
  CANCELADA: 'bg-red-50 text-red-700 border border-red-200',
};

/** Etapas da devolução mostradas ao cliente (no lugar das etapas da entrega). */
export const returnStatusSteps = ['EM_ANALISE', 'AGUARDANDO_COLETA', 'EM_COLETA', 'COLETADO', 'DEVOLVIDO'] as const;
export const returnStepLabels: Record<string, string> = {
  EM_ANALISE: 'Em análise',
  AGUARDANDO_COLETA: 'Aprovada',
  EM_COLETA: 'Buscando',
  COLETADO: 'Coletado',
  DEVOLVIDO: 'Estornado',
};

/** Devolução em andamento ou concluída: o produto não pode ser avaliado. */
export const returnBlocksReview = (status?: string | null) => !!status && status !== 'CANCELADA';

/** Pedido de cancelamento (pedido pago precisa da aprovação da loja). */
export const cancelStatusLabels: Record<string, string> = {
  SOLICITADO: 'Cancelamento em andamento',
  RECUSADO: 'Cancelamento recusado',
  APROVADO: 'Cancelamento aprovado',
};

export const cancelStatusColors: Record<string, string> = {
  SOLICITADO: 'bg-amber-50 text-amber-700 border border-amber-200',
  RECUSADO: 'bg-red-50 text-red-700 border border-red-200',
  APROVADO: 'bg-green-50 text-green-700 border border-green-200',
};

/** Dias para pedir devolução depois da entrega (direito de arrependimento). */
export const RETURN_WINDOW_DAYS = 7;

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

export const configs: Record<string, {
  text: string;
  bg: string;
  border: string;
  bar: string;
  icon: React.ElementType;
  label: string;
}> = {
  "NOVA CATEGORIA": {
    text: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10",
    border: "border-fuchsia-500/20",
    bar: "bg-fuchsia-500",
    icon: FolderPlus,
    label: "Nova categoria",
  },
  "ATIVAÇÃO CUPOM": {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    bar: "bg-emerald-500",
    icon: TicketCheck,
    label: "Ativação de cupom",
  },
  "ACESSO": {
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    bar: "bg-blue-500",
    icon: LogIn,
    label: "Acesso ao sistema",
  },
  "PÓS-VENDA": {
    text: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    bar: "bg-orange-500",
    icon: RotateCcw,
    label: "Cancelamento e devolução",
  },
  "PAGAMENTO": {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    bar: "bg-emerald-500",
    icon: Wallet,
    label: "Pagamento",
  },
  "ATUALIZAR STATUS": {
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    bar: "bg-cyan-500",
    icon: RefreshCcw,
    label: "Atualização de status",
  },

  "AVALIAÇÃO PRODUTO": {
    text: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    bar: "bg-yellow-500",
    icon: Star,
    label: "Avaliação de produto",
  },

  "AVISOU O CLIENTE VIA WHATSAPP": {
    text: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    bar: "bg-green-500",
    icon: MessageCircle,
    label: "Aviso via WhatsApp",
  },
  "NOVO CUPOM": {
    text: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    bar: "bg-violet-500",
    icon: TicketPlus,
    label: "Novo cupom",
  },
  "EDICAO": {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    bar: "bg-amber-500",
    icon: Pencil,
    label: "Edição de registro",
  },

  "EXCLUSÃO": {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    bar: "bg-red-500",
    icon: Trash2,
    label: "Exclusão de registro",
  },
  "EXCLUSAO CUPOM": {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    bar: "bg-rose-500",
    icon: TicketX,
    label: "Exclusão de cupom",
  },

  "NOVO": {
    text: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    bar: "bg-violet-500",
    icon: PlusCircle,
    label: "Novo registro",
  },

  "SISTEMA": {
    text: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
    bar: "bg-zinc-500",
    icon: Activity,
    label: "Evento do sistema",
  },
  "ALTERAÇÃO DE SENHA": {
    text: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    bar: "bg-orange-500",
    icon: Lock,
    label: "Alteração de senha",
  },
  "CADASTRO": {
    text: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    bar: "bg-green-500",
    icon: UserPlus,
    label: "Novo cadastro",
  },
  "ATIVAÇÃO USUÁRIO": {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    bar: "bg-emerald-500",
    icon: UserCheck,
    label: "Ativação de usuário",
  },

  "DESATIVAÇÃO USUÁRIO": {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    bar: "bg-rose-500",
    icon: UserX,
    label: "Desativação de usuário",
  },
  "ENTREGUE": {
    text: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    bar: "bg-teal-500",
    icon: PackageCheck,
    label: "Pedido entregue",
  },
  "PEDIDO SAIU PARA ENTREGA": {
    text: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    bar: "bg-sky-500",
    icon: Truck,
    label: "Saiu para entrega",
  },
  "PEDIDO RETIRADO PARA ENTREGA": {
    text: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    bar: "bg-indigo-500",
    icon: PackageOpen,
    label: "Entregador retirou o pedido",
  },
  "PEDIDO DEVOLVIDO": {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    bar: "bg-rose-500",
    icon: PackageX,
    label: "Pedido devolvido",
  },
  "ENTREGA ATRIBUÍDA": {
    text: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    bar: "bg-violet-500",
    icon: UserRoundCheck,
    label: "Entrega atribuída ao entregador",
  },
  "ENTREGADOR REMOVIDO": {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    bar: "bg-red-500",
    icon: UserRoundX,
    label: "Entregador removido do pedido",
  },
  "ALTEROU CONFIGURAÇÃO DE ENTREGAS": {
    text: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    bar: "bg-orange-500",
    icon: Settings2,
    label: "Alteração nas configurações de entregas",
  },
  "ALTEROU VALOR DO ENTREGADOR": {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    bar: "bg-emerald-500",
    icon: CircleDollarSign,
    label: "Alteração no valor do entregador",
  },
  "ALTEROU GORJETA DO PEDIDO": {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    bar: "bg-amber-500",
    icon: HandCoins,
    label: "Alteração na gorjeta do pedido",
  },
  "DEU BAIXA NO ENTREGADOR": {
    text: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    bar: "bg-teal-500",
    icon: BadgeCheck,
    label: "Baixa de pagamento do entregador",
  },
  "ESTORNOU BAIXA DO ENTREGADOR": {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    bar: "bg-rose-500",
    icon: BadgeX,
    label: "Estorno da baixa de pagamento do entregador",
  },
  "PRODUTO COLETADO": {
  text: "text-teal-400",
  bg: "bg-teal-500/10",
  border: "border-teal-500/20",
  bar: "bg-teal-500",
  icon: PackageCheck,
  label: "Produto da devolução coletado",
},

"SAIU PARA COLETA": {
  text: "text-sky-400",
  bg: "bg-sky-500/10",
  border: "border-sky-500/20",
  bar: "bg-sky-500",
  icon: Truck,
  label: "Saiu para coleta",
},

"COLETA RETIRADA PARA BUSCAR": {
  text: "text-indigo-400",
  bg: "bg-indigo-500/10",
  border: "border-indigo-500/20",
  bar: "bg-indigo-500",
  icon: PackageOpen,
  label: "Coleta de devolução retirada pelo entregador",
}
};
