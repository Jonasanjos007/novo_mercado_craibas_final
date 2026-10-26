import { Address } from "./Address";
import { Cupom } from "./Cupom";
import { Imagens_Products, Product, ProductSaveOrder, ProductVariation } from "./Product";

export interface OrderSave {
    total_Value_Order: number;
    total_Value_OrderCupom?: number;
    discont: number;
    discont_Percentage: number;
    status_Pay: string;
    payment_terms: string;
    address: Address;
    products: ProductSaveOrder[];
    id_Cupom?: number;
    shippingCost?: number;
    discount_Type?: string;
}
export enum Status_Pay {
    CANCELADO = "CANCELADO",
    CONFIRMADO = "CONFIRMADO",
    PENDENTE = "PENDENTE"
}
export type AdminTab = 'dashboard' | 'notifications' | 'products' | 'categories' | 'orders' | 'promotions' | 'movements' | 'profile' | 'settings' | 'cartegories' | 'users' | 'bin' | 'mydeliveries' | 'deliverers';

export interface Order {
    id_Order: number;
    number_Order: string;
    total_Value_Order: number;
    discont: number;
    quantity: number;
    origin_Price?: number;
    payment_terms: string;
    id_Cupom?: number;
    status_Pay: Status_Pay;
    products: ProductSaveOrder[];
    address: Address;
    insertDate: Date;
    order_Status: string;
    estimated_Delivery_Date: Date;
    couponApplied: boolean;
    discount_Type?: string;
    shippingCost?: number;
    total_Value_OrderCupom?: number;
    notifyViaWhatsApp?: boolean;
    customerDeliveryDate?: Date;
    whoReceivedIt?: string;
    /** Quem está entregando (entregador ou admin). */
    deliveryName?: string | null;
    deliveryAssigneeType?: 'DELIVERY' | 'ADMIN' | null;

    // Cancelamento e devolução
    cancel_Reason?: string | null;
    canceled_At?: string | null;
    /** CLIENTE ou ADMIN */
    canceled_By?: string | null;
    /** Nulo = sem devolução. */
    return_Status?: ReturnStatus | null;
    return_Reason?: string | null;
    return_Requested_At?: string | null;
    return_Admin_Note?: string | null;
    /** Até quando o cliente pode pedir devolução (7 dias após a entrega). */
    return_Deadline?: string | null;
}

/** Andamento da devolução (Orders.Return_Status). */
export type ReturnStatus = 'EM_ANALISE' | 'AGUARDANDO_COLETA' | 'DEVOLVIDO' | 'CANCELADA';

/** Linha da aba "Devoluções" do admin. */
export interface OrderReturnAdmin {
    id_Order: number;
    number_Order: string;
    customer_Name: string;
    customer_Phone?: string | null;
    customer_Email?: string | null;
    total_Value_Order: number;
    payment_terms: string;
    status_Pay: string;
    return_Status: ReturnStatus;
    return_Reason?: string | null;
    return_Admin_Note?: string | null;
    return_Requested_At?: string | null;
    return_Updated_At?: string | null;
    delivered_At?: string | null;
    items: number;
    first_Product?: string | null;
    first_Image?: string | null;
    address?: string | null;
    /** Pagamento online: estorno automático ao marcar como devolvido. */
    online_Refund: boolean;
}

export interface OrderReturnsAdmin {
    items: OrderReturnAdmin[];
    byStatus: Record<string, number>;
    open: number;
}
export interface SendMessageViaWhatsAppResponse {
    idOrder: number;
    status: string;
    telefone: string;
    number_Order: string;
    nome_Cliente: string;
}
type ReviewMedia = { name: string; type: string; url: string };

export interface RatingResponse {
    id: number;
    id_Product: number;
    id_Order: number;
    id_user_Customer: number;
    ranting: number;
    comment: string;
    media: string;
    mediaEdite?: ReviewMedia[];
    recommend: boolean;
    insertDate?: Date;
    updateDate?: Date;
    isDelete: boolean;
    product: Product;
    numberOrder: string;
}
export interface GeneralOrderInformation {
    ordersAmount?: number;
    ordersDelivered?: number;
    ordersCanceled?: number;
    couponAmount?: number;
    emptyCart?: boolean;
    totalExpenses?: number;
    paymentRequestPending?: boolean;
}
