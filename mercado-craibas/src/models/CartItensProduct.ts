import { CartUser } from "./CartUser";
import { DiscountType } from "./Cupom";
import { Product, ProductVariation } from "./Product";
import { User } from "./User";

export interface CartItensProduct {
    id?: number;
    id_Cart?: number;
    quantity: number;
    product?: Product;
    selectedVariation?: ProductVariation;
    cartUser?: CartUser;
    user?: User;
    operador?: string;
    valorDicont?: number
}

export interface CartUserResponse {
    cartItensProduct: CartItensProduct[];
    subTotal?: number;
    discount: number;
    total?: number;
    cupom?: string;
    id_Cupom?: number;
    erroCupom?: boolean;
    menssege?: string;
    shippingCost?: number;
    discount_Type?: string;
    couponApplied: Boolean;
    WhereApplyCoupon?: string;
}