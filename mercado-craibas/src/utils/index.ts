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

export const categoryIcons: Record<string, string> = {
  eletronicos: '📱',
  garrafas: '🧊',
  acessorios: '🎧',
  virais: '🔥',
};

export const badgeLabels: Record<string, string> = {
  novo: 'NOVO',
  'mais-vendido': 'MAIS VENDIDO',
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
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  saiu_entrega: 'Saiu para Entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export const orderStatusColors: Record<string, string> = {
  pendente: 'text-yellow-600 bg-yellow-50',
  confirmado: 'text-blue-600 bg-blue-50',
  preparando: 'text-purple-600 bg-purple-50',
  saiu_entrega: 'text-orange-600 bg-orange-50',
  entregue: 'text-green-600 bg-green-50',
  cancelado: 'text-red-600 bg-red-50',
};

export const orderStatusSteps = ['confirmado', 'preparando', 'saiu_entrega', 'entregue'];
