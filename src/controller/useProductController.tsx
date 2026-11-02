
import { useCallback, useEffect, useRef, useState } from 'react';
import { ProductVariation } from '../models/Product';
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
        /** Eixos de variação (ex.: Cor, Memória) com suas opções. */
        variationAxes: { name: string; options: string[] }[];
        /** Produto de 2+ eixos do modelo antigo: comprar fica bloqueado até recadastrar. */
        needsVariantReview: boolean;
        related: any[];
        variationError?: number;
        tab: string;
        RantingAllProduct: RantingAllProduct[];
    };
    action: {
        handleAddToCart: (quantity: number, selectedVariations: Record<string, string>) => Promise<boolean>;
        handleFinishbuy: (quantity: number, selectedVariations: Record<string, string>) => Promise<boolean>;
        /** Acha o SKU que bate com a combinação escolhida (undefined se faltar eixo ou não existir). */
        resolveVariation: (selected: Record<string, string>) => ProductVariation | undefined;
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
    // Contador de tentativas sem escolher a variação: cada incremento re-dispara a animação do seletor.
    const [variationError, setVariationError] = useState(0);
    const [RantingAllProduct, setRantingAllProducte] = useState<RantingAllProduct[]>([]);
    const [tab, setTab] = useState<'desc' | 'reviews'>('desc');
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

    // Modelo novo: cada variação é um SKU com atributos (Cor=Preto, Memória=128GB).
    // Modelo antigo (sem atributos): agrupa por name/value, como antes.
    const usaCombinacao = product.variations.some(v => (v.atributos?.length ?? 0) > 0);

    const variationAxes: { name: string; options: string[] }[] = (() => {
        if (usaCombinacao) {
            const axes: string[] = [];
            const opts: Record<string, string[]> = {};
            product.variations.forEach(sku => (sku.atributos ?? []).forEach(a => {
                if (!axes.includes(a.eixo)) { axes.push(a.eixo); opts[a.eixo] = []; }
                if (!opts[a.eixo].includes(a.valor)) opts[a.eixo].push(a.valor);
            }));
            return axes.map(name => ({ name, options: opts[name] }));
        }
        const names = [...new Set(product.variations.map(v => v.name))];
        return names.map(name => ({
            name,
            options: [...new Set(product.variations.filter(v => v.name === name).map(v => v.value))],
        }));
    })();

    // Produto antigo com 2+ eixos (que não viraram combinação): comprar fica bloqueado até recadastrar.
    const needsVariantReview = !!product.needs_Variant_Review || (!usaCombinacao && variationAxes.length > 1);

    // Acha o SKU exato da combinação escolhida.
    const resolveVariation = (selected: Record<string, string>): ProductVariation | undefined => {
        if (variationAxes.length === 0) return product.variations[0];
        if (variationAxes.some(ax => !selected?.[ax.name])) return undefined;
        if (usaCombinacao) {
            return product.variations.find(sku => {
                const attrs = sku.atributos ?? [];
                return attrs.length === variationAxes.length
                    && attrs.every(a => selected[a.eixo] === a.valor);
            });
        }
        const ax = variationAxes[0];
        return product.variations.find(v => v.name === ax.name && v.value === selected[ax.name]);
    };

    const related = products.filter(p => p.id_category === product.id_category && p.id !== product.id).slice(0, 5);

    const handleFinishbuy = async (quantity: number, selectedVariations: Record<string, string>) => {

        if (!user) {
            navigate("/CheckoutAutUser");
            notify.warning("Atenção", "Faça login ou crie sua conta para adicionar produtos ao carrinho");
            return false;
        }

        if (needsVariantReview) return false; // produto em atualização

        // Falta escolher algum eixo, ou a combinação não existe
        if (variationAxes.some(ax => !selectedVariations?.[ax.name])) {
            setVariationError(n => n + 1); // só destaca o seletor; sem alerta
            return false;
        }
        const sku = resolveVariation(selectedVariations);
        if (!sku) {
            setVariationError(n => n + 1); // combinação indisponível
            return false;
        }

        const result = await addToCart({ product, quantity, selectedVariation: sku });
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

        if (needsVariantReview) return false; // produto em atualização

        if (variationAxes.some(ax => !selectedVariations?.[ax.name])) {
            setVariationError(n => n + 1); // só destaca o seletor; sem alerta
            return false;
        }
        const sku = resolveVariation(selectedVariations);
        if (!sku) {
            setVariationError(n => n + 1); // combinação indisponível
            return false;
        }

        const result = await addToCart({ product: product, quantity: quantity, selectedVariation: sku, user: user });

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
            variationAxes: variationAxes,
            needsVariantReview: needsVariantReview,
            related: related,
            variationError: variationError,
            tab,
            RantingAllProduct


        },
        action: {
            handleAddToCart,
            handleFinishbuy,
            resolveVariation,
            setTab,
            SearchProductReviews
        }
    }
};


