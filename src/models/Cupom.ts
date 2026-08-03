export interface Cupom {
    id?: number;
    name_Cupom?: string;
    cod_Cupom?: string;
    description?: string;
    discount_Type?: number;
    discont?: number;
    active?: boolean;
    minimum_Value?: number | null;
    maximum_Discount?: number | null;
    quantity_Uses?: number | null;
    quantity_Used?: number | null;
    per_User_Limit?: number | null;
    first_Order_Only?: boolean;
    application?: string;
    date_Start?: string | null;
    date_End?: string | null;
    date_end?: string | null;
    productIds?: number[];
    categoryIds?: number[];
    show_Flash_Offer: boolean;
}

export interface CupomAdmin {
    id?: number;
    name_Cupom?: string;
    cod_Cupom?: string;
    description?: string;
    discount_Type?: DiscountType;
    discount?: number;
    active?: boolean;
    minimum_Value?: number | null;
    maximum_Discount?: number | null;
    quantity_Uses?: number | null;
    quantity_Used?: number | null;
    per_User_Limit?: number | null;
    first_Order_Only?: boolean;
    application?: string;
    date_Start?: string | null;
    date_End?: string | null;
    productIds?: Coupon_Product[];
    categoryIds?: Coupon_Category[];
    // couponUse?: Coupon_Use[];
    show_Flash_Offer: boolean;
}
export type UpdateCouponRequest = CupomAdmin & {
    addedProducts: number[];
    removedProducts: number[];

    addedCategories: number[];
    removedCategories: number[];
};
export interface Coupon_Category {
    id: number;
    id_Cupom: number;
    id_Category: number;
    insertDate?: Date;
    updateDate?: Date | null;
}

export interface Coupon_Product {
    id: number;
    id_Cupom: number;
    id_Product: number;
    insertDate?: Date;
    updateDate?: Date;
}
export interface Coupon_Use {
    id: number;
    id_Cupom: number;
    Id_Order: number;
    Id_User: number;
    insertDate: Date;
    updateDate: Date;
}
export enum DiscountType {
    Percentage = "Percentage",
    FixedValue = "FixedValue",
    FreeShipping = "FreeShipping"
}
