import { api } from "../config/api";
import { makeResult, Result } from "../utils/Result";

export const CupomService = {
    ApplyCupom: async (CodCupom: string): Promise<Result<boolean>> => {
        try {
            const response = await api.post("/v1/cupom/ApplyCupom", CodCupom);
            const { success, data, error } = response.data;
            if (!data) {
                return makeResult(false, false, error);
            }

            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },
    RemoveApllyCupom: async (): Promise<Result<boolean>> => {
        try {
            const response = await api.post("/v1/cupom/RemoveApllyCupom");
            const { success, data, error } = response.data;
            if (!data) {
                return makeResult(false, false, error);
            }

            return makeResult(success, data, error);
        } catch (err: any) {
            console.log(err)
            console.log(err.response);
            console.log(err.response?.data);
            return makeResult(false, false, err.response?.data);
        }
    },
}