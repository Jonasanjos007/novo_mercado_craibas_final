/* Portal de entregas (entregador e admin). */

export type DeliveryAssigneeType = 'NONE' | 'DELIVERY' | 'ADMIN';
export type DeliveryPayMode = 'POR_PEDIDO' | 'POR_DIA';
export type DeliveryValueType = 'FIXO' | 'PERCENTUAL';

export interface DeliveryOrderItem {
    name: string;
    variation?: string | null;
    quantity: number;
}

export interface DeliveryAddress {
    id: number;
    name?: string;
    phone?: string;
    road?: string;
    number?: number;
    neighborhood?: string;
    supplement?: string | null;
    referencePoint?: string | null;
    city?: string;
    state?: string | null;
}

export interface DeliveryOrder {
    id: number;
    number_Order: string;
    order_Status: string;
    payment_terms?: string | null;
    status_Pay?: string | null;
    total_Value_Order: number;
    shippingCost?: number | null;
    quantity: number;

    insertDate: string;
    estimated_Delivery_Date?: string | null;
    assignedAt?: string | null;
    dispatchedAt?: string | null;
    deliveredAt?: string | null;
    whoReceivedIt?: string | null;

    customerName?: string | null;
    customerPhone?: string | null;
    address?: DeliveryAddress | null;
    items: DeliveryOrderItem[];

    assigneeType: DeliveryAssigneeType;
    assigneeId?: number | null;
    assigneeName?: string | null;
    isMine: boolean;

    /** Ganho do entregador (só com gorjeta ativa no modo por pedido). */
    earning?: number | null;

    /** ENTREGA = levar o pedido; COLETA = buscar o produto de uma devolução. */
    kind?: 'ENTREGA' | 'COLETA';
    /** Coleta: motivo da devolução. */
    returnReason?: string | null;
    /** O cliente pediu o cancelamento e a loja ainda não respondeu. */
    cancelRequested?: boolean;
}

export interface DeliveryEarningEntry {
    /** PEDIDO = entrega; COLETA = coleta de devolução; DIA = dia trabalhado. */
    kind: 'PEDIDO' | 'COLETA' | 'DIA';
    orderId?: number | null;
    orderNumber?: string | null;
    orderTotal?: number | null;
    date: string;
    deliveries: number;
    amount: number;
    customTip: boolean;
    paid: boolean;
    paidAt?: string | null;
    payoutId?: number | null;
}

export interface DeliveryEarnings {
    enabled: boolean;
    mode?: DeliveryPayMode | null;
    orderValueType?: DeliveryValueType | null;
    currentValue?: number | null;
    pendingTotal: number;
    paidTotal: number;
    entries: DeliveryEarningEntry[];
}

export interface DeliveryProfile {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    transport?: string | null;
    avatar?: string | null;
    insertDate: string;
    activeOrders: number;
    deliveredTotal: number;
    deliveredToday: number;
    deliveredThisWeek: number;
}

export interface DeliveryDriver {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    transport?: string | null;
    avatar?: string | null;
    ativo: boolean;
    preparingOrders: number;
    enRouteOrders: number;
    deliveredTotal: number;
    deliveredToday: number;
    lastDeliveryAt?: string | null;
    pendingAmount: number;
    pendingItems: number;
    paidAmount: number;
    commissionDelivers?: number | null;
    dailyRate?: number | null;
}

export interface DeliverySettings {
    tipEnabled: boolean;
    mode: DeliveryPayMode;
    orderValueType: DeliveryValueType;
    orderValue: number;
    dailyValue: number;
    countFrom?: string | null;
    updateDate?: string | null;
    updatedByName?: string | null;
}

export interface DeliveryPayables {
    enabled: boolean;
    mode?: DeliveryPayMode | null;
    deliveryId: number;
    deliveryName: string;
    total: number;
    entries: DeliveryEarningEntry[];
}

export interface DeliveryPayout {
    id: number;
    deliveryId: number;
    deliveryName: string;
    mode: DeliveryPayMode;
    periodStart: string;
    periodEnd: string;
    total: number;
    itemsCount: number;
    deliveries: number;
    paidAt: string;
    paidByName?: string | null;
    note?: string | null;
    reversedAt?: string | null;
    reversedByName?: string | null;
    reversedReason?: string | null;
    items: DeliveryEarningEntry[];
}

export interface CreateDeliveryPayout {
    deliveryId: number;
    orderIds: number[];
    /** Coletas de devolução pagas (id do pedido). */
    pickupOrderIds?: number[];
    workDates: string[];
    note?: string;
}
