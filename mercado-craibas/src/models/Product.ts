export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: ProductCategory;
    rating: number;
    reviewCount: number;
    sold: number;
    variations: ProductVariation[];
    stock: number;
    badge?: 'novo' | 'mais-vendido' | 'oferta' | 'viral';
    freeShipping: boolean;
    installments?: number;
    tags: string[];
    featured: boolean;
}
export interface ProductVariation {
    id: string;
    name: string;
    value: string;
    type: 'color' | 'model' | 'size';
    stock: number;
    priceModifier?: number;
}
export type ProductCategory = 'eletronicos' | 'garrafas' | 'acessorios' | 'virais';
