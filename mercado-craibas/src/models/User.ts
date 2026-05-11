export interface User {
    id: string;
    name: string;
    email: string;
    senha?: string;
    avatar?: string;
    role: 'customer' | 'admin' | 'delivery';
    address?: Address;
    phone?: string;
    bio?: string;
    vehicle?: string;
    region?: string;
    joinDate?: string;
    preferences?: UserPreferences;
}
export interface Address {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
}
export interface UserPreferences {
    notifications: boolean;
    newsletter: boolean;
    darkMode: boolean;
    language: string;
}