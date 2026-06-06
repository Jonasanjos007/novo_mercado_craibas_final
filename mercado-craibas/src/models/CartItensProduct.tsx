import { CartUser } from "./CartUser";
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
}