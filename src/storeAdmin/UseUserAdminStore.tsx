import { create } from "zustand";
import { makeResult, Result } from "../utils/Result";
import { Product, ProductAdmin } from "../models/Product";
import { ProductsService } from "../service/ProductsService";
import { ProductServiceAdmin } from "../adminService/ProductServiceAdmin";
import { UserServiceAdmin } from "../adminService/UserServiceAdmin";
import { UseUserStore } from "../store/UseUserStore";
import { UserService } from "../service/UserService";



interface UsertState {
    PostEditeUserAdmin: (formData: FormData) => Promise<Result<boolean>>;
    PostEditeTemaAdmin: () => Promise<Result<boolean>>;
}

export const UseUserAdminStore = create<UsertState>((set) => ({

    PostEditeUserAdmin: async (formData: FormData): Promise<Result<boolean>> => {
        const result = await UserServiceAdmin.PostUpdateUserAdmin(formData);

        if (result.success) {
            const getUser = await UserService.getUser("ADMIN");

            if (getUser.success && getUser.data) {
                UseUserStore.getState().setUser(getUser.data);
            }

            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },
    PostEditeTemaAdmin: async (): Promise<Result<boolean>> => {
        const temaAtual = UseUserStore.getState().user?.customize?.tema ?? false;
        const novoTema = !temaAtual;
        const result = await UserServiceAdmin.PostUpdateTemaAdmin(novoTema);

        if (result.success) {
            const getUser = await UserService.getUser("ADMIN");

            if (getUser.success && getUser.data) {
                UseUserStore.getState().setUser(getUser.data);
            }

            return makeResult(true, true);
        }
        return makeResult(false, false, result.error);
    },

}));
