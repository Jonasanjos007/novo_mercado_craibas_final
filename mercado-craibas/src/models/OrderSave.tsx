import { Address } from "./Address";
import { Cupom } from "./Cupom";
import { Imagens_Products, Product, ProductSaveOrder, ProductVariation } from "./Product";

export interface OrderSave {
    total_Value_Order: number;
    discont: number;
    discont_Percentage: number;
    status_Pay: string;
    payment_terms: string;
    address: Address;
    products: ProductSaveOrder[];
    cupom?: Cupom;
}
export enum Status_Pay {
    CANCELADO = "CANCELADO",
    CONFIRMADO = "CONFIRMADO",
    PENDENTE = "PENDENTE"
}

export interface Order {
    id_Order: number;
    number_Order: string;
    total_Value_Order: number;
    discont: number;
    quantity: number;
    origin_Price?: number;
    payment_terms: string;
    status_Pay: Status_Pay;
    products: ProductSaveOrder[];
    address: Address;
    insertDate: Date;
    order_Status: string;
    estimated_Delivery_Date: Date;
}