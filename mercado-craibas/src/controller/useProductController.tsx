
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../utils/NotificationCard';
import { useStore } from '../context/store';
import { formatDiscount } from '../utils';

type ProductControllerReturn = {
    result: {
        products?: any[];
        fakeReviews: any[];
        discount: number;
        variationTypes: any[];
        related: any[];
        variationError?: boolean;
    };
    action: {
        handleAddToCart: (quantity: number, selectedVariations: Record<string, string>) => void;
        handleFinishbuy: (quantity: number, selectedVariations: Record<string, string>) => void;
    }
} | null;
export const useProductController = (): ProductControllerReturn => {
    const { selectedProductId, ShowProduct, addToCart, setCartOpen, loadProducts, user } = useStore();
    const { id } = useParams();
    const navigate = useNavigate();
    const notify = useNotification();
    const { products } = useStore();
    const [variationError, setVariationError] = useState(false);

    useEffect(() => {
        const Response = async () => {
            const result = await loadProducts(user);
            if (!result?.success) {
                notify.error(result?.error || "Erro ao carregar produtos Entre em contato com Suporte!", "error");
            }
        };
        Response();
        if (id && Number(id) !== Number(selectedProductId)) {
            ShowProduct(Number(id));
        }
    }, [id]);

    const product = products.find(p => p.id === Number(selectedProductId));
    if (!product) return null;

    const discount = product.origin_Price ? formatDiscount(product.origin_Price, product.price_Unic) : 0;
    const variationTypes = [...new Set(product.variations.map(v => v.name))];
    const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5);

    const handleFinishbuy = async (quantity: number, selectedVariations: Record<string, string>) => {

        if (!user) {
            navigate("/CheckoutAutUser");
            notify.warning(
                "Atenção",
                "Faça login ou crie sua conta para adicionar produtos ao carrinho"
            );
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
        notify.success("Sucesso", "Produto adicionado ao carrinho!");
        setCartOpen(true);
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
            variationError: variationError


        },
        action: {
            handleAddToCart,
            handleFinishbuy
        }
    }
};


