
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
    };
    action: {
        handleAddToCart: (quantity: number, selectedVariations: Record<string, string>) => void;
    }
} | null;
export const useProductController = (): ProductControllerReturn => {
    const { selectedProductId, ShowProduct, addToCart, setCartOpen, loadProducts } = useStore();
    const { id } = useParams();
    const navigate = useNavigate();
    const notify = useNotification();
    const { products } = useStore();
    useEffect(() => {
        loadProducts();
        if (id && Number(id) !== Number(selectedProductId)) {
            ShowProduct(Number(id));
        }
    }, [id]);

    const product = products.find(p => p.id === Number(selectedProductId));
    if (!product) return null;

    const discount = product.origin_Price ? formatDiscount(product.origin_Price, product.price_Unic) : 0;
    const variationTypes = [...new Set(product.variations.map(v => v.name))];
    const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5);

    const handleAddToCart = (quantity: number, selectedVariations: Record<string, string>) => {
        if (selectedVariations === undefined || Object.keys(selectedVariations).length === 0) {
            notify.error("Erro", "Selecione uma opção do produto.");
            return false;
        }
        const firstVariation = product.variations.length > 0
            ? product.variations.find(v => v.name === variationTypes[0] && v.value === Object.values(selectedVariations)[0])
            : undefined;

        addToCart({ product, quantity, selectedVariation: firstVariation });
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

        },
        action: {
            handleAddToCart
        }
    }
};


