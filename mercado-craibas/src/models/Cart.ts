import { Product, ProductVariation } from "./Product";

export interface CartItem {
    product: Product; 
    quantity: number; 
    selectedVariation?: ProductVariation;
}