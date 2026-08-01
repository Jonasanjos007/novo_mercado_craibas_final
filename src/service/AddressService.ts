import { api } from "../config/api";
import { makeResult, Result } from "../utils/Result";
import { Address } from "../models/Address";

export const AddressService = {
    PostSaveAddres: async (Address: Address): Promise<Result<Address>> => {
        try {
            console.log('request addres', Address);

            const response = await api.post("/v1/users/postSaveAddressUser", Address);
            const { success, data, error } = response.data;
            console.log('request addres', response.data);
            if (!data) {
                return makeResult(false, {} as Address, error);
            }
            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, {} as Address, err.response?.data);
        }


    },
    GetAddresByIdUser: async (): Promise<Result<Address[]>> => {
        try {

            const response = await api.get("/v1/users/GetAddresByIdUser");
            const { success, data, error } = response.data;
            if (!data) {
                return makeResult(false, {} as Address[], error);
            }
            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, {} as Address[], err.response?.data);
        }


    },
    PostUpdateAddress: async (Address: Address): Promise<Result<Address>> => {

        try {
            const result = await api.post("/v1/users/PostUpdateAddres", Address);
            const { success, data, error } = result.data;
            if (!data) {
                return makeResult(false, error);
            }
            return makeResult(success, data);

        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, {} as Address, err.response?.data);
        }
    },
    DeleteAddress: async (address: Address): Promise<Result<boolean>> => {
        try {
            const result = await api.post('/v1/users/DeleteAddress', address,
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