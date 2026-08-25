import { Order } from './OrderSave';

export type ClientNotificationKind = 'ORDER' | 'DELIVERY' | 'PAYMENT' | 'READ' | 'ASSESSMENT';

export type ClientNotificationItem = {
  id: string;
  kind: ClientNotificationKind;
  title: string;
  description: string;
  date: Date;
  orderId: number;
  orderNumber: string;
};

const statusContent: Record<string, { kind: ClientNotificationKind; title: string; description: string }> = {
  PENDENTE: { kind: 'PAYMENT', title: 'Pedido aguardando confirmação', description: 'Recebemos seu pedido e estamos aguardando a confirmação.' },
  CONFIRMADO: { kind: 'ORDER', title: 'Pedido confirmado', description: 'Seu pedido foi confirmado e seguirá para preparação.' },
  PREPARANDO: { kind: 'ORDER', title: 'Pedido em preparação', description: 'A loja já está separando os produtos do seu pedido.' },
  SAIU_PARA_ENTREGA: { kind: 'DELIVERY', title: 'Pedido saiu para entrega', description: 'Seu pedido está a caminho do endereço informado.' },
  SAIU_ENTREGA: { kind: 'DELIVERY', title: 'Pedido saiu para entrega', description: 'Seu pedido está a caminho do endereço informado.' },
  ENTREGUE: { kind: 'DELIVERY', title: 'Pedido entregue', description: 'A entrega foi concluída. Esperamos que você aproveite sua compra!' },
  CANCELADO: { kind: 'PAYMENT', title: 'Pedido cancelado', description: 'O pedido foi cancelado. Consulte os detalhes para mais informações.' },
};

export function buildClientNotifications(orders: Order[]): ClientNotificationItem[] {
  return orders.map(order => {
    const status = String(order.order_Status || order.status_Pay || 'PENDENTE').toUpperCase();
    const content = statusContent[status] || statusContent.PENDENTE;
    return {
      id: `order-${order.id_Order}-${status}`,
      ...content,
      date: new Date(order.insertDate || Date.now()),
      orderId: order.id_Order,
      orderNumber: order.number_Order || String(order.id_Order),
    };
  }).sort((a, b) => b.date.getTime() - a.date.getTime());
}
