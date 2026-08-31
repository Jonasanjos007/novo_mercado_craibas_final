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
    phone?: number;
    customize?: Customize;
    //bio?: string;
    // vehicle?: string;
    //region?: string;
    insert_Date?: string;
    updateDate?: string;
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
export type AdminProfileData = {
    name: string;
    email: string;
    phone: string | number;
    avatar: string;
    avatarFile?: File | null;
    tema: boolean;
};
export interface UserRanting {
    name: string;
    avatar: string;
    role: string;
};
export interface UserProfile {
    name: string;
    avatar: string;
    email: string;
    phone: number;
};
export interface ChangePassword {
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
};

