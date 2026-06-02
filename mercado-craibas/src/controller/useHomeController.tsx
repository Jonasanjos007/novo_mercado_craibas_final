import { useEffect } from "react";
import { ApiService } from "../config/api";
import { useStore } from "../context/store";

export const useHomeController = () => {
    const { getListProducts } = ApiService;
    const { loadProducts } = useStore();

    useEffect(() => {
        loadProducts();
    }, []);
    return {
        action: {

        },
        result: {

        }

    }
}