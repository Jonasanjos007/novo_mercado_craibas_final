import { useEffect, useState } from "react";
import { useStore } from "../context/store";
import { Address } from "../models/Address";
import { useNotification } from "../utils/NotificationCard";
import { AddressService } from "../service/AddressService";
import { UseAddressStore } from "../store/UseAddressStore";
import { UseUserStore } from "../store/UseUserStore";
import { UseCartStore } from "../store/UseCartStore";
import { UseProductStore } from "../store/UseProductStore";
import { UseOrderStore } from "../store/UseOrderStore";
import { Cupom } from "../models/Cupom";
import { Status_Pay } from "../models/OrderSave";
import { OrderSave } from "../models/OrderSave";
import { UseCupomStore } from "../store/UseCupomStore";
import { UseNotificationAdmin } from "../storeAdmin/UseNotificationAdmin";

type CheckoutControllerReturn = {
    result: {
        Loading: boolean;
        AddressStandard: Address | undefined;
        discount: number | 0;
        finalTotal: number;
        payment: 'pix' | 'credit' | 'boleto';
        total: number;
        shipping: number;
        paymentDiscount: number;
        selectedCoupon: Cupom | null;
        loading: boolean;
        step: 'Endereço' | 'Pagamento' | 'Checkout' | 'success';
        order: OrderSave | undefined;
    };
    action: {
        setDiscount: React.Dispatch<React.SetStateAction<0 | number>>;
        setPayment: React.Dispatch<React.SetStateAction<'pix' | 'credit' | 'boleto'>>;
        setSelectedCoupon: React.Dispatch<React.SetStateAction<Cupom | null>>;
        setLoading: React.Dispatch<React.SetStateAction<boolean>>;
        handlePlaceOrder: () => Promise<void>;
        handleApllyCupom: (CodCupom: string) => Promise<void>;
        RemoveApllyqueCupomController: () => Promise<void>;
        setStep: React.Dispatch<React.SetStateAction<Step>>;
    }
};
type PaymentMethod = 'pix' | 'credit' | 'boleto';
type Step = 'Endereço' | 'Pagamento' | 'Checkout' | 'success';

export const useCheckoutController = (): CheckoutControllerReturn => {
    const { LoadCartUser, clearCart } = UseCartStore();
    const { LoadNotificationAll } = UseNotificationAdmin();
    const { loadProducts } = UseProductStore();
    const { LoadCupons, Cupons, SaveOrderUser } = UseOrderStore();
    const { cart } = UseCartStore();
    console.log(cart, 'cart');
    const [loading, setLoading] = useState(false);
    console.log("loading", loading)
    const [step, setStep] = useState<Step>('Endereço');
    const { ApllyqueCupom, RemoveApllyqueCupom } = UseCupomStore();

    const { cartTotal } = UseCartStore();
    const [payment, setPayment] = useState<PaymentMethod>('pix');
    const [selectedCoupon, setSelectedCoupon] = useState<Cupom | null>(null);

    const [discount, setDiscount] = useState(0);
    console.log(discount, 'discount');
    const [order, setOrder] = useState<OrderSave>();

    const total = cartTotal();
    const shipping = total >= 299 ? 0 : 19.99;
    const paymentDiscount = payment === 'pix' ? total * 0.05 : 0;

    const { LoadAddressUser, address } = UseAddressStore();
    const AddressStandard = address.find(p => p.standard === Boolean(true));

    const notify = useNotification();
    const { user } = UseUserStore();
    const [Loading, SetLoading] = useState(false);
    const finalTotal = total + shipping - paymentDiscount - discount;

    useEffect(() => {

        const load = async () => {
            SetLoading(true);
            await GetListProducts();
            await GetCartUser();
            await GetAddressUser();
            await GetListCupom();
            SetLoading(false);

        };
        load();
    }, []);


    const GetListCupom = async () => {
        const result = await LoadCupons();
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar produtos");
        }
    };
    const GetListProducts = async () => {
        const result = await loadProducts();
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar produtos");
        }
    };
    const GetCartUser = async () => {
        const result = await LoadCartUser(user);
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar Carrinho");
        }
    };
    const GetAddressUser = async () => {
        const result = await LoadAddressUser();
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar Endereços");
        }
    };



    const handlePlaceOrder = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1500));

        const OrderSave: OrderSave =
        {
            total_Value_Order: cart.subTotal || 0,
            discont: (total) - ((cart.subTotal || 0) - (cart.shippingCost || 0)),
            discont_Percentage: cart?.discount || 0,
            payment_terms: payment,
            status_Pay: Status_Pay.PENDENTE,
            address: AddressStandard!,
            products: cart.cartItensProduct.map(p => ({
                id: p.product?.id || 0,
                name: p.product?.name || '',
                price_Unic: p.product?.price_Unic || 0,
                quantity: p.quantity || 0,
                origin_Price: p.product?.origin_Price || 0,
                variations: p.selectedVariation || null,
            })),
            id_Cupom: cart.id_Cupom || undefined,
            total_Value_OrderCupom: cart.total,
            shippingCost: cart.shippingCost ?? 0,
            discount_Type: cart.discount_Type ?? ""
        };
        setOrder(OrderSave);
        console.log(OrderSave, 'OrderSave');
        const result = await SaveOrderUser(OrderSave);
        console.log(result, 'result');
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao salvar pedido");
            setLoading(false);
            return;
        }
        await LoadNotificationAll();
        notify.success("Pedido realizado com sucesso!", "success");
        clearCart();
        // const payLabel = payment === 'pix' ? 'PIX' : payment === 'credit' ? `Cartão •••• ${cardData.number.slice(-4) || '4242'}` : 'Boleto Bancário';
        // const placed = placeOrder(payLabel);
        // setOrder(placed);
        setStep('success');
        setLoading(false);
    };

    const handleApllyCupom = async (CodCupom: string) => {
        setLoading(true);

        if (CodCupom.length < 4) {
            notify.error("error", "Codigo Incompleto");
            return;
        }
        const result = await ApllyqueCupom(CodCupom);
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao Aplicar Cupom");
            setLoading(false);
            return;
        }
        notify.success("Cupom Aplicado com sucesso!", "success");
        setLoading(false);
    };

    const RemoveApllyqueCupomController = async () => {
        setLoading(true);
        const result = await RemoveApllyqueCupom();
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao Remover Cupom");
            setLoading(false);
            return;
        }
        notify.success("Cupom Removido com sucesso!", "success");
        setLoading(false);
    };

    return {
        result: {
            Loading,
            AddressStandard,
            discount,
            finalTotal,
            payment,
            total: cartTotal() || 0,
            shipping,
            paymentDiscount,
            selectedCoupon,
            loading,
            step,
            order: order
        },
        action: {
            setDiscount,
            setPayment,
            setSelectedCoupon,
            setLoading,
            handlePlaceOrder,
            setStep,
            handleApllyCupom,
            RemoveApllyqueCupomController
        }
    }
}


