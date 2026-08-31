
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../utils/NotificationCard';
import { useStore } from '../context/store';
import { formatDiscount } from '../utils';
import { UseUserStore } from '../store/UseUserStore';
import { UseCartStore } from '../store/UseCartStore';
import { UseProductStore } from '../store/UseProductStore';
import { UseRouteStore } from '../store/UseRouteStore';
import { UseOrderStore } from '../store/UseOrderStore';
import { RantingAllProduct } from '../models/Product';

type ProductControllerReturn = {
    result: {
        products?: any[];
        fakeReviews: any[];
        discount: number;
        variationTypes: any[];
        related: any[];
        variationError?: boolean;
        tab: string;
        RantingAllProduct: RantingAllProduct[];
    };
    action: {
        handleAddToCart: (quantity: number, selectedVariations: Record<string, string>) => void;
        handleFinishbuy: (quantity: number, selectedVariations: Record<string, string>) => void;
        SearchProductReviews: (Id_Product: number) => void;
        setTab: React.Dispatch<React.SetStateAction<'desc' | 'reviews'>>;

    }
} | null;
export const useProductController = (): ProductControllerReturn => {
    const { setCartOpen } = UseCartStore();
    const { selectedProductId, ShowProduct } = UseRouteStore();
    const { loadProducts, GetRantingAllProduct } = UseProductStore();
    const { addToCart, LoadCartUser } = UseCartStore();
    const { LoadCategory } = UseOrderStore();
    const { user } = UseUserStore();
    const { id } = useParams();
    const navigate = useNavigate();
    const notify = useNotification();
    const { products } = UseProductStore();
    const [variationError, setVariationError] = useState(false);
    const [RantingAllProduct, setRantingAllProducte] = useState<RantingAllProduct[]>([]);
    const [tab, setTab] = useState<'desc' | 'reviews'>('desc');
    console.log('RantingAllProduct', RantingAllProduct)
    useEffect(() => {
        const Response = async () => {
            const result = await loadProducts();
            if (!result?.success) {
                notify.error((result.error?.error.code ?? "error"), (result?.error?.error.message || "Erro ao carregar produtos Entre em contato com Suporte!"));
            }
            await GetListCategory();
            await GetCartUser();
        };
        Response();
        if (id && Number(id) !== Number(selectedProductId)) {
            ShowProduct(Number(id));
        }
    }, [id]);
    const GetListCategory = async () => {
        const result = await LoadCategory();
        console.log("result.data", result.data);
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar Categoria");
        }
    };

    const GetCartUser = async () => {
        const result = await LoadCartUser(user);
        // if (!result?.success) {
        //     notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar Carrinho");
        // }
    };

    const product = products.find(p => p.id === Number(selectedProductId));
    if (!product) return null;

    const discount = product.origin_Price ? formatDiscount(product.origin_Price, product.price_Unic) : 0;
    const variationTypes = [...new Set(product.variations.map(v => v.name))];
    const related = products.filter(p => p.id_category === product.id_category && p.id !== product.id).slice(0, 5);

    const handleFinishbuy = async (quantity: number, selectedVariations: Record<string, string>) => {

        if (!user) {
            navigate("/CheckoutAutUser");
            notify.warning("Atenção", "Faça login ou crie sua conta para adicionar produtos ao carrinho");
            return false;
        }

        if (selectedVariations === undefined || Object.keys(selectedVariations).length === 0) {
            setVariationError(true);
            notify.error("Erro", "Selecione uma opção do produto.");
            return false;
        }

        const firstVariation =
            product.variations.length > 0
                ? product.variations.find(
                    v =>
                        v.name === variationTypes[0] &&
                        v.value === Object.values(selectedVariations)[0]
                )
                : undefined;

        const result = await addToCart({ product, quantity, selectedVariation: firstVariation, user: user });
        if (!result) {
            notify.error("Erro", "Não foi possível adicionar o produto ao carrinho.");
            return false;
        }
        navigate("/checkout");
        return true;
    };
    const handleAddToCart = async (quantity: number, selectedVariations: Record<string, string>) => {
        if (!user) {
            navigate("/CheckoutAutUser");
            notify.warning("Atenção", "Faça login ou crie sua conta para adicionar produtos ao carrinho");
            return false;
        }

        if (selectedVariations === undefined || Object.keys(selectedVariations).length === 0) {
            setVariationError(true);
            notify.error("Erro", "Selecione uma opção do produto.");
            return false;
        }

        const firstVariation = product.variations.length > 0 ? product.variations.find(v => v.name === variationTypes[0] &&
            v.value === Object.values(selectedVariations)[0]
        )
            : undefined;

        const result = await addToCart({ product: product, quantity: quantity, selectedVariation: firstVariation, user: user });

        if (!result) {
            notify.error("Erro", "Não foi possível adicionar o produto ao carrinho.");
            return false;
        }
        notify.success("Sucesso", "Produto adicionado ao carrinho!");
        setCartOpen(true);
        return true;
    };
    const SearchProductReviews = async (Id_Product: number) => {

        const result = await GetRantingAllProduct(Id_Product);

        if (!result.success) {
            notify.error(result.error?.error.code || "Erro", result.error?.error.message || "Não foi possível buscar as Avaliações do produto.");
            return false;
        }
        setRantingAllProducte(result.data ?? []);
        return true;
    };

    const fakeReviews = [
        { name: 'Ana Lima', rating: 5, date: '12/03/2026', text: 'Produto incrível! Chegou rápido e é exatamente como descrito. Super recomendo!' },
        { name: 'Pedro Santos', rating: 5, date: '08/03/2026', text: 'Qualidade excelente, valeu cada centavo. Embalagem perfeita.' },
        { name: 'Maria Oliveira', rating: 4, date: '01/03/2026', text: 'Muito bom! Só achei a entrega um pouco lenta, mas o produto é ótimo.' },
    ];
    return {
        result: {
            fakeReviews: fakeReviews,
            discount: discount,
            variationTypes: variationTypes,
            related: related,
            variationError: variationError,
            tab,
            RantingAllProduct


        },
        action: {
            handleAddToCart,
            handleFinishbuy,
            setTab,
            SearchProductReviews
        }
    }
};


