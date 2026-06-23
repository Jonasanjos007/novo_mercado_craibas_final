import { createJSONStorage, persist } from "zustand/middleware";
import { Address } from "../models/Address";
import { UseUserStore } from "./UseUserStore";
import { create } from "zustand";
import { AddressService } from "../service/AddressService";
import { makeResult } from "../utils/Result";

interface AddressState {
    saveAddress: (anddres: Address, Id_User: number) => Promise<{ success?: boolean; error?: string }>;
    updateAddress: (anddres: Address) => Promise<{ success?: boolean; error?: string }>;
    removerAddress: (Address: Address) => Promise<{ success?: boolean; error?: { data: any; success: boolean; }; }>;
    setAddress: (address: Address[] | []) => void;
    address: Address[];
}

export const UseAddressStore = create<AddressState>()(persist((set, get) => ({
    address: [],
    saveAddress: async (anddres: Address, Id_User: number) => {
        anddres.id_User_Customer = Id_User;
        const result = await AddressService.PostSaveAddres(anddres);
        if (!result.success) {
            return makeResult(false, false, result.error);
        }
        const ListAddresNew = await AddressService.GetAddresByIdUser(Id_User);
        if (ListAddresNew.data) {
            set({ address: ListAddresNew.data });
        }
        return makeResult(true, true);
    },
    updateAddress: async (anddres: Address) => {

        const result = await AddressService.PostUpdateAddress(anddres);

        if (!result.success) {
            return makeResult(false, false, result.error);
        }
        const ListAddresNew = await AddressService.GetAddresByIdUser(anddres.id_User_Customer ?? 0);
        console.log("ListAddresNew", ListAddresNew)
        if (ListAddresNew.data && ListAddresNew.data.length > 0) {
            set({ address: ListAddresNew.data });
        }
        return makeResult(true, true);
    },
    removerAddress: async (Address: Address) => {
        const result = await AddressService.DeleteAddress(Address);
        console.log("teste", result)
        if (result.data && !result.success) {
            const ListAddresNew = await AddressService.GetAddresByIdUser(Address.id_User_Customer ?? 0);


            set({ address: ListAddresNew.data });
            return { success: false, error: { data: result.data, success: result.success } };
        }
        if (!result.success) {
            const ListAddresNew = await AddressService.GetAddresByIdUser(Address.id_User_Customer ?? 0);

            set({ address: ListAddresNew.data });
            return { success: false, error: { data: result.data, success: result.success } };
        }
        const ListAddresNew = await AddressService.GetAddresByIdUser(Address.id_User_Customer ?? 0);
        if (ListAddresNew.data && ListAddresNew.data.length > 0) {
            set({ address: ListAddresNew.data });
        }
        return { success: true };
    },
    setAddress: (Address) => set({ address: Address }),
}), {
    name: "@address-storage",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
        address: state.address ?? [],
    }),
}
));