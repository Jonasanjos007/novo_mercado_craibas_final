import { api } from "../config/api";
import { makeResult, Result } from "../utils/Result";
import { Address } from "../models/Address";

export const AddressService = {
    PostSaveAddres: async (Address: Address): Promise<Result<Address>> => {
        try {
            console.log('request addres', Address);

            const response = await api.post("/users/postSaveAddressUser", Address);
            const { success, data, error } = response.data;
            console.log('request addres', response.data);
            if (!data) {
                return makeResult(false, {} as Address, error);
            }
            return makeResult(success, data, error);
        } catch {
            return makeResult(false, {} as Address, "Falha na comunicação");
        }


    },
    GetAddresByIdUser: async (): Promise<Result<Address[]>> => {
        try {

            const response = await api.get("/users/GetAddresByIdUser");
            const { success, data, error } = response.data;
            if (!data) {
                return makeResult(false, {} as Address[], error);
            }
            return makeResult(success, data, error);
        } catch {
            return makeResult(false, {} as Address[], "Falha na comunicação");
        }


    },
    PostUpdateAddress: async (Address: Address): Promise<Result<Address>> => {

        try {
            const result = await api.post("/users/PostUpdateAddres", Address);
            const { success, data, error } = result.data;
            if (!data) {
                return makeResult(false, error);
            }
            return makeResult(success, data);

        } catch {
            return makeResult(false, {} as Address, "Falha na comunicação");
        }
    },
    DeleteAddress: async (address: Address): Promise<Result<boolean>> => {
        try {
            const result = await api.post('/users/DeleteAddress', address,
                {
                    validateStatus: () => true
                });
            const { success, data, error } = result.data;

            if (!data) {
                return makeResult(false, error);
            }

            return makeResult(success, data);
        } finally {

        }

    }
}