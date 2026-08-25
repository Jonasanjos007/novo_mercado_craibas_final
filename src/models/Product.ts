import { UserRanting } from "./User";

export interface Product {
    id?: number;
    name: string;
    description: string;
    price_Unic: number;
    origin_Price?: number;
    imagens: Imagens_Products[];
    id_category: number;
    review_Count: number;
    count_Sold: number;
    variations: ProductVariation[];
    total_Stock: number;
    badge?: string;
    freeShipping: boolean;
    installments?: number;
    tags: string;
    featured: boolean;
    insertDate: Date;
    ativo?: boolean;
    showBanner?: boolean;
    valorDicont?: number;
    rating: number;

}

export interface ProductAdmin {
    id: number;
    name: string;
    description: string;
    price_Unic: number;
    origin_Price?: number;
    imagens: Imagens_Products[];
    id_category: number;
    rating: number;
    review_Count: number;
    count_Sold: number;
    variations: ProductVariation[];
    total_Stock: number;
    badge?: string;
    freeShipping: boolean;
    installments?: number;
    tags: string;
    featured: boolean;
    insertDate: Date;
    removedImages: number[];
    removedVariants: number[];
    ativo?: boolean;
    showBanner?: boolean;
}

export interface ProductSaveOrder {
    id: number;
    name: string;
    price_Unic: number;
    quantity: number;
    imagens?: Imagens_Products[];
    freeShipping?: boolean;
    category?: string;
    origin_Price?: number;
    badge?: string;
    Count_Rating?: number;
    variations: ProductVariation | null;
    id_category?: number;
    valorDicont?: number;
    evaluated?: boolean

}
export interface ProductVariation {
    id: number;
    id_Product?: number;
    name: string;
    value: string;
    type: string;
    stoke: number;
    price_Modifier?: number;
    new?: boolean;
}
export type ProductCategory = 'eletronicos' | 'garrafas' | 'acessorios' | 'virais';

export interface Imagens_Products {
    id: number;
    id_Product: number;
    url_Imagem: string;
    file?: File;
}
export interface Category {
    id: number;
    category: string;
    description: string;
    banners?: string | string[];
    imagem: string;
    color: string;
    meta_Title: string;
    meta_Description: string;
    ativo: boolean;
    insertDate?: Date;

}
export interface RantingAllProduct {
    id: number;
    id_Product: number;
    id_User_Customer: number;
    ranting: number;
    comment: string;
    media: string;
    recomend: Boolean;
    insertDate: Date;
    updateDate: Date;
    isDelete: boolean;
    user: UserRanting;
}