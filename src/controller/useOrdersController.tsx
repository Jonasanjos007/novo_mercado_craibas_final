import { useEffect, useState } from "react";
import { useNotification } from "../utils/NotificationCard";
import { UseOrderStore } from "../store/UseOrderStore";
import { RatingResponse } from "../models/OrderSave";
import { UseProductStore } from "../store/UseProductStore";
import { Product } from "../models/Product";
import { useNavigate } from "react-router-dom";

type OrdersControllerReturn = {
    result: {
        Loading: boolean;
        assessmentResponse: RatingResponse;
        reviewDetailsTarget: boolean;
    };
    action: {
        handleGetAssents: (IdOrder: number, IdProduct: number) => Promise<boolean>;
        setAssessmentResponse: React.Dispatch<React.SetStateAction<RatingResponse>>;
        setReviewDetailsTarget: React.Dispatch<React.SetStateAction<boolean>>;


    }
} | null;

export const useOrdersController = (): OrdersControllerReturn => {
    const { LoadOrders, LoadCupons, GetRating, orders } = UseOrderStore();
    const notify = useNotification();
      const navigate = useNavigate();
    
    const { loadProducts } = UseProductStore();
    const [Loading, SetLoading] = useState(false);
    const [reviewDetailsTarget, setReviewDetailsTarget] = useState<boolean>(false);

    const { products } = UseProductStore();

    const [assessmentResponse, setAssessmentResponse] = useState<RatingResponse>({
        id: 0,
        id_Product: 0,
        id_Order: 0,
        id_user_Customer: 0,
        ranting: 0,
        comment: '',
        media: '',
        recommend: false,
        isDelete: false,
        product: {} as Product,
        numberOrder: ''
    });
    useEffect(() => {

        const load = async () => {
            SetLoading(true);
            await GetListOrders();
            await GetListCupom();
            await GetListProduct();
            SetLoading(false);
        };
        load();
    }, [navigate]);
    const GetListOrders = async () => {
        const result = await LoadOrders();
        // SetLoading(false);
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar pedidos");
        }
    };
    const GetListCupom = async () => {
        const result = await LoadCupons();
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar produtos");
        }
    };
    const GetListProduct = async () => {
        const result = await loadProducts();
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar produtos");
        }
    };
    const handleGetAssents = async (IdOrder: number, IdProduct: number) => {
        if (!IdOrder) {
            notify.error("Error", "Pedido Inválido!");
            SetLoading(false);
            return false;
        }
        if (!IdProduct) {
            notify.error("Error", "Produto Inválido!");
            SetLoading(false);
            return false;
        }
        const result = await GetRating(IdProduct, IdOrder)
        if (!result.success) {
            notify.error(result.error?.error.code || 'Buscar Avaliação', result.error?.error.message || 'erro ao buscar avaliação');
            SetLoading(false);
            return false;
        }
        const objeto = result.data;
        setAssessmentResponse(
            {
                id: objeto?.id || 0,
                id_Product: objeto?.id_Product ?? 0,
                id_Order: objeto?.id_Order ?? 0,
                id_user_Customer: objeto?.id_user_Customer ?? 0,
                ranting: objeto?.ranting ?? 0,
                comment: objeto?.comment ?? '',
                media: objeto?.media ?? '',
                recommend: objeto?.recommend ?? false,
                isDelete: objeto?.isDelete ?? false,
                updateDate: objeto?.updateDate,
                insertDate: objeto?.insertDate,
                product: products.filter(item => item.id == objeto?.id_Product)[0] ?? {} as Product,
                numberOrder: orders.filter(item => item.id_Order == objeto?.id_Order)[0].number_Order ?? ''
            }
        );
        setReviewDetailsTarget(true);
        SetLoading(false);
        return true;
    };
    return {
        result: {
            Loading,
            assessmentResponse,
            reviewDetailsTarget
        },
        action: {
            handleGetAssents,
            setAssessmentResponse,
            setReviewDetailsTarget,
            
        }
    }
}


