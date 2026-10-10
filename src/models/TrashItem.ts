export type TrashEntityType =
    | 'USER'
    | 'ADDRESS'
    | 'PRODUCT'
    | 'PRODUCT_IMAGE'
    | 'PRODUCT_VARIANT'
    | 'CATEGORY'
    | 'COUPON'
    | 'COUPON_PRODUCT'
    | 'COUPON_CATEGORY'
    | 'ORDER'
    | 'CART'
    | 'CART_ITEM'
    | 'LOG'
    | 'NOTIFICATION'
    | 'RATING'
    | 'COUPON_USE'
    | 'EMAIL_VERIFICATION'
    | 'CUSTOMIZE'
    | 'ORDER_ITEM'
    | 'OTHER';

export interface TrashItem {
    /** Id do registro na Lixeira. */
    id: number;
    entityType: TrashEntityType;
    /** Id do item original. */
    entityId?: number;
    entityName: string;

    /** Dono do dado. */
    userId?: number | null;
    userName?: string | null;
    userEmail?: string | null;
    userRole?: string | null;

    deletedAt?: string | null;
    permanentDeleteAt?: string | null;
    description?: string | null;

    /** Por que foi excluído. */
    reason?: string | null;

    /** Quem excluiu. */
    deletedById?: number | null;
    deletedByName?: string | null;
    deletedByRole?: string | null;

    /** Cópia dos dados no momento da exclusão. */
    data?: Record<string, any>;

    /** Itens excluídos junto (addresses, orders, products...). */
    related?: Record<string, TrashItem[] | undefined>;
}

export interface TrashBulkResult {
    succeeded: number;
    failed: { id: number; message: string }[];
}
