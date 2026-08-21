import { create } from "zustand";
import { User } from "../models/User";
import { Address } from "../models/Address";
import { AppPage } from "../types";
import { CartItensProduct } from "../models/CartItensProduct";
import { persist } from 'zustand/middleware';
import { useState } from "react";
import { UseAddressStore } from "./UseAddressStore";
import { UseCartStore } from "./UseCartStore";
import { UserService } from "../service/UserService";
import { makeResult, Result } from "../utils/Result";
import { getColorConfig } from "../types/Colors";
import { UseRouteStore } from "./UseRouteStore";
import { UseUserAdminStore } from "../storeAdmin/UseUserAdminStore";


interface UserState {
    user: User | null;
    currentPage: AppPage;
    NameColorGlobal: string;
    ColorGlobalTema: string;
    ColorGlobalText: string;
    ColorGlobalHover: string;
    ColorGlobalHoverText: string;
    saveUser: (user: User) => boolean;
    updateUser: (updates: Partial<User>) => void;
    logout: () => void;
    SaveColorGlobal: (NameColorGlobal: string, UserId: number) => Promise<Result<boolean>>;
    setUser: (User: User) => void;

}
export const UseUserStore = create<UserState>()(persist((set, get) => ({
    user: null,
    ColorGlobalTema: "bg-brand-500",
    ColorGlobalText: "text-brand-400",
    ColorGlobalHover: "hover:bg-brand-600",
    NameColorGlobal: "",
    ColorGlobalHoverText: "group-hover:text-brand-600",
    saveUser: (User: User) => {
        // const newUser: User = {
        //   id: `u${Date.now()}`,
        //   name: '',
        //   email: '',
        //   role: 'customer',
        //   phone: '',
        //   //bio: '',
        //   Insert_date: new Date().toLocaleDateString('pt-BR'),
        //   preferences: { notifications: true, newsletter: false, darkMode: false, language: 'pt-BR' },
        //   address: { street: '', number: '', neighborhood: '', city: 'Craibas', state: 'AL', zipCode: '' },
        // };
        const colorConfig = getColorConfig(User.customize?.global_Site_Color);
        set({ user: User });
        set({ NameColorGlobal: User.customize?.global_Site_Color })
        set({ ColorGlobalTema: colorConfig.class });
        set({ ColorGlobalText: colorConfig.class_text });
        set({ ColorGlobalHover: colorConfig.class_hover });
        set({ ColorGlobalHoverText: colorConfig.class_group_hover_text });

        // UseAddressStore.getState().setAddress(User.address ?? []);
        return true;
    },

    updateUser: (updates) => set(s => ({ user: s.user ? { ...s.user, ...updates } : null })),

    currentPage: 'home',

    logout: () => {
        set({ user: null, currentPage: 'home', ColorGlobalTema: " bg-brand-500", ColorGlobalText: "text-brand-400", ColorGlobalHover: "bg-brand-600", ColorGlobalHoverText: "group-hover:text-brand-600" });
        set({ NameColorGlobal: "brand" })
        UseCartStore.getState().clearCart();
        UseRouteStore.getState().setPages("home");
    },
    SaveColorGlobal: async (NameColorGlobal: string, UserId: number) => {
        if (!NameColorGlobal) {
            return makeResult(false, false);
        }
        const responseTema = await UserService.saveColorGlobalService(NameColorGlobal, UserId);
        if (responseTema.success) {
            const colorConfig = getColorConfig(NameColorGlobal);
            set({ NameColorGlobal: NameColorGlobal })
            set({ ColorGlobalTema: colorConfig.class || "bg-brand-500" });
            set({ ColorGlobalText: colorConfig.class_text || "text-brand-400" });
            set({ ColorGlobalHover: colorConfig.class_hover || "hover:bg-brand-600" });
            set({ ColorGlobalHoverText: colorConfig.class_group_hover_text || "group-hover:text-brand-600" });
        }
        if (!responseTema.success) {
            set({ ColorGlobalTema: "bg-brand-600" });
            return makeResult(false, false, responseTema.error);
        }
        return makeResult(true, true);
    },
    setUser: (User: User) => set({ user: User }),

}), {
    name: '@user-storage',
    partialize: (state) => ({
        user: state.user,
        NameColorGlobal: state.NameColorGlobal,
        ColorGlobalTema: state.ColorGlobalTema,
        ColorGlobalText: state.ColorGlobalText,
        ColorGlobalHover: state.ColorGlobalHover,
        ColorGlobalHoverText: state.ColorGlobalHoverText
    }),
}
));