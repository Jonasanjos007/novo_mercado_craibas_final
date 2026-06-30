import { Address } from "../models/Address";
import { create } from "zustand";
import { AddressService } from "../service/AddressService";
import { makeResult } from "../utils/Result";
import { User } from "../models/User";

interface AddressState {
    saveAddress: (anddres: Address, Id_User: number) => Promise<{ success?: boolean; error?: string }>;
    updateAddress: (anddres: Address) => Promise<{ success?: boolean; error?: string }>;
    removerAddress: (Address: Address) => Promise<{ success?: boolean; error?: { data: any; success: boolean; }; }>;
    setAddress: (address: Address[] | []) => void;
    address: Address[];
    LoadAddressUser: () => Promise<{ success?: boolean; error?: string }>;
}

export const UseAddressStore = create<AddressState>((set, get) => ({
    address: [],
    LoadAddressUser: async () => {
        const ListAddress = await AddressService.GetAddresByIdUser();

        if (!ListAddress.success) {
            set({ address: [] });
            return makeResult(false, ListAddress.error || "Erro ao carregar carrinho");
        }
        set({ address: ListAddress.data || [] });
        return makeResult(true);
    },
    saveAddress: async (anddres: Address, Id_User: number) => {
        anddres.id_User_Customer = Id_User;
        const result = await AddressService.PostSaveAddres(anddres);
        if (!result.success) {
            return makeResult(false, false, result.error);
        }
        const ListAddresNew = await AddressService.GetAddresByIdUser();
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
        const ListAddresNew = await AddressService.GetAddresByIdUser();
        if (ListAddresNew.data && ListAddresNew.data.length > 0) {
            set({ address: ListAddresNew.data });
        }
        return makeResult(true, true);
    },
    removerAddress: async (Address: Address) => {
        const result = await AddressService.DeleteAddress(Address);
        if (result.data && !result.success) {
            const ListAddresNew = await AddressService.GetAddresByIdUser();


            set({ address: ListAddresNew.data });
            return { success: false, error: { data: result.data, success: result.success } };
        }
        if (!result.success) {
            const ListAddresNew = await AddressService.GetAddresByIdUser();

            set({ address: ListAddresNew.data });
            return { success: false, error: { data: result.data, success: result.success } };
        }
        const ListAddresNew = await AddressService.GetAddresByIdUser();
        if (ListAddresNew.data && ListAddresNew.data.length > 0) {
            set({ address: ListAddresNew.data });
        }
        return { success: true };
    },
    setAddress: (Address) => set({ address: Address }),
}));
