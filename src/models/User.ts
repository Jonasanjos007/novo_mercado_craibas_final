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
    ativo?: boolean;
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

export interface RegisterStart {
    name: string;
    phone: string;
};
export interface RegisterEmail {
    userId: number;
    email: string;
    confirmEmail: string;
};


export interface RegisterStartResponse {
    idUser: number;
    nextStep: string;
    name: string;
    phone: string;
    backRegistration?: boolean;
    email?: string;
    expiresAt?: Date;
};
export interface RegisterResponse {
    idUser?: number;
    nextStep?: string;
    name?: string;
    phone?: string;
    email?: string;
    expiresAt?: Date;
    backRegistration?: boolean;
};
export interface SavePasswordResponse {
    idUser: number;
    nextStep: string;
    message: string;
};

export interface InfoSiteInterface {
    storeName: string;
    primaryColor?: string;
    storeLogo?: string;
    storeLogoIcone?: string;
    storeImageIconeFile?: File | null;
    storeImageFile?: File | null;
    ImageNewIcone?: boolean;

    ImageNew?: boolean;
};
export interface BaseRatesInterface {
    timeframeBusinessDays: number;
    shippingCost?: number;
};
export interface BaseSiteInterface {
    storeImage?: string;
    storeName?: string;
    storeImageIcone?: string;
    shippingCost?: number;
    timeframeBusinessDays?: number;
}
export interface UserAdminAll {
    id?: number;
    name?: string;
    email?: string;
    avatar?: string;
    role: UserRole;
    ativo: boolean;
    phone: string;
    insert_Date: Date;
    updateDate?: Date;
}

export type RegistrationStep = 'Started' | 'PersonalDataCompleted' | 'EmailCompleted' | 'PasswordCompleted' | 'EmailVerificationPending' | 'Completed';


export type UserRole = 'ADMIN' | 'CLIENTE' | 'DELIVERY';

export type UserFilter = 'ALL' | UserRole;