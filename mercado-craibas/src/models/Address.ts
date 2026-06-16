import { CartUser } from "./CartUser";
import { Product, ProductVariation } from "./Product";
import { User } from "./User";

export interface Address {
    id?: number;
    road?: string;
    city: string;
    number?: number;
    state?: string;
    Id_User_Customer?: number;
    neighborhood?: string;
    referencePoint?: string;
    supplement?: string;
    standard?: boolean;
}