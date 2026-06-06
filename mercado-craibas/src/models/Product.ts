export interface Product {
    id: number;
    name: string;
    description: string;
    price_Unic: number;
    origin_Price?: number;
    imagens: Imagens_Products[];
    category: string;
    count_Rating: number;
    review_Count: number;
    count_Sold: number;
    variations: ProductVariation[];
    total_Stock: number;
    badge?: string;
    freeShipping: boolean;
    installments?: number;
    tags: string;
    featured: boolean;
}
export interface ProductVariation {
    id: string;
    name: string;
    value: string;
    type: string;
    stock: number;
    price_Modifier?: number;
}
export type ProductCategory = 'eletronicos' | 'garrafas' | 'acessorios' | 'virais';

export interface Imagens_Products {
    id: string;
    id_Product: string;
    url_Imagem: string;
} 