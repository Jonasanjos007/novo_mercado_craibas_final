// export type ProductCategory = 'eletronicos' | 'garrafas' | 'acessorios' | 'virais';

import { CartItem } from "../models/CartUser";
import { Product } from "../models/Product";

// export interface ProductVariation {
//   id: string;
//   name: string;
//   value: string;
//   type: 'color' | 'model' | 'size';
//   stock: number;
//   priceModifier?: number;
// }

// export interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   originalPrice?: number;
//   images: string[];
//   category: ProductCategory;
//   rating: number;
//   reviewCount: number;
//   sold: number;
//   variations: ProductVariation[];
//   stock: number;
//   badge?: 'novo' | 'mais-vendido' | 'oferta' | 'viral';
//   freeShipping: boolean;
//   installments?: number;
//   tags: string[];
//   featured: boolean;
// }

// export interface CartItem {
//   product: Product; quantity: number; selectedVariation?: ProductVariation;
// }

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   avatar?: string;
//   role: 'customer' | 'admin' | 'delivery';
//   address?: Address;
//   phone?: string;
//   bio?: string;
//   vehicle?: string;
//   region?: string;
//   joinDate?: string;
//   preferences?: UserPreferences;
// }

// export interface UserPreferences {
//   notifications: boolean; 
//   newsletter: boolean;
//    darkMode: boolean;
//     language: string;
// }

export interface Address {
  street: string; number: string; complement?: string;
  neighborhood: string; city: string; state: string; zipCode: string;
}

export type OrderStatus = 'pendente' | 'confirmado' | 'preparando' | 'saiu_entrega' | 'entregue' | 'cancelado';

export interface Order {
  id: string;
  userId:
  string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  address: Address;
  paymentMethod: string;
  trackingCode?: string;
  deliveryPersonId?: string;
  deliveryCommission?: number;
  date?: Date;
}

export interface Promotion {
  id: string; title: string; description: string;
  discount: number; code: string; minValue?: number;
  validUntil: Date; active: boolean;
  productIds?: string[];
  type?: 'percent' | 'fixed';
}

export interface WishlistItem { product: Product; addedAt: Date; }

export type AppPage =
  | 'home' | 'product' | 'cart' | 'checkout' | 'orders' | 'login' | 'register'
  | 'admin-dashboard' | 'admin-products' | 'admin-orders' | 'admin-promotions'
  | 'delivery-dashboard' | 'category' | 'search' | 'wishlist'
  | 'flash-sale' | 'brands' | 'about' | 'profile';
