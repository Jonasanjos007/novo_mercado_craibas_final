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
export type AdminTab = 'dashboard' | 'notifications' | 'products' | 'categories' | 'orders' | 'promotions' | 'movements' | 'profile' | 'settings' | 'cartegories';

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
}
export interface SendMessageViaWhatsAppResponse {
    idOrder: number;
    status: string;
    telefone: number;
    number_Order: string;
    nome_Cliente: string;
}
