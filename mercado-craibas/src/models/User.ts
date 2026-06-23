import { Address } from "./Address";
import { CartUser } from "./CartUser";
import { Customize } from "./Customize";

export interface User {
    id: number;
    name: string;
    email: string;
    senha?: string;
    avatar?: string;
    role: string;
    CartUser?: CartUser;
    address?: Address[];
    phone?: string;
    customize?: Customize;
    //bio?: string;
    // vehicle?: string;
    //region?: string;
    insert_Date?: string;
    // preferences?: UserPreferences;
}
// export interface Address {
//     street: string;
//     number: string;
//     complement?: string;
//     neighborhood: string;
//     city: string;
//     state: string;
//     zipCode: string;
// }
export interface UserPreferences {
    notifications: boolean;
    newsletter: boolean;
    darkMode: boolean;
    language: string;
}