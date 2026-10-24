import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardPaymentRequest, OrderPayment, PAYMENT_POLL_MS, PaymentMethodChoice } from "../models/Payment";
import { UsePaymentStore } from "../store/UsePaymentStore";
import { UseNotificationAdmin } from "../storeAdmin/UseNotificationAdmin";
import { useNotification } from "../utils/NotificationCard";

/**
 * Tela que o cliente vê:
 *  - loading     carregando o pedido
 *  - unavailable pagamento online desligado (sem credenciais) ou pedido não encontrado
 *  - choose      escolhe PIX ou cartão (e vê o PIX/formulário)
 *  - approved    pagamento aprovado
 *  - rejected    cartão recusado / erro (pode tentar de novo)
 *  - analysis    cartão em análise (aguardando a operadora)
 *  - closed      pedido cancelado ou que não aceita mais pagamento
 */
export type PaymentScreen = 'loading' | 'unavailable' | 'choose' | 'approved' | 'rejected' | 'analysis' | 'closed';

type Params = {
    orderId: number;
    /** Forma vinda do checkout (?method=pix|credit). */
    initialMethod?: PaymentMethodChoice | null;
    /** Gera o PIX sozinho ao abrir (quando o cliente já escolheu PIX no checkout). */
    autoStartPix?: boolean;
};

export const usePaymentController = ({ orderId, initialMethod, autoStartPix }: Params) => {
    const navigate = useNavigate();
    const notify = useNotification();
    const { config, orderPayment, LoadConfig, LoadOrderPayment, CreatePix, CreateCard, ResetPayment } = UsePaymentStore();
    const { LoadNotificationAll } = UseNotificationAdmin();

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [method, setMethod] = useState<PaymentMethodChoice>(initialMethod ?? 'pix');
    const [creatingPix, setCreatingPix] = useState(false);
    const [submittingCard, setSubmittingCard] = useState(false);
    /** Depois de uma recusa, o cliente pode voltar ao formulário. */
    const [dismissedResultId, setDismissedResultId] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const [now, setNow] = useState(() => Date.now());

    /** Diferença entre o relógio do servidor e o do navegador (a contagem do PIX usa a hora do servidor). */
    const clockOffsetRef = useRef(0);
    const autoStartedRef = useRef(false);
    const previousStatusRef = useRef<string | null>(null);

    const applyServerClock = (data?: OrderPayment | null) => {
        if (!data?.server_Time) return;
        const server = new Date(data.server_Time).getTime();
        if (!Number.isNaN(server)) clockOffsetRef.current = server - Date.now();
    };

    const errorMessage = (result: { error?: { error?: { message?: string } } }, fallback: string) =>
        result.error?.error?.message || fallback;

    // ── Carga inicial ───────────────────────────────────────────────────────
    useEffect(() => {
        let alive = true;
        ResetPayment();

        const load = async () => {
            setLoading(true);
            const [cfg, payment] = await Promise.all([LoadConfig(), LoadOrderPayment(orderId)]);
            if (!alive) return;

            if (!payment.success || !payment.data) {
                setLoadError(errorMessage(payment as any, 'Não encontramos este pedido.'));
            } else {
                applyServerClock(payment.data);
                previousStatusRef.current = payment.data.current?.status ?? null;
                if (!initialMethod) {
                    const current = payment.data.current;
                    const terms = current ? (current.method === 'PIX' ? 'pix' : 'credit') : payment.data.payment_Terms;
                    setMethod(terms === 'credit' ? 'credit' : 'pix');
                }
            }
            if (!cfg.success) setLoadError(prev => prev ?? 'Não foi possível carregar o pagamento.');
            setLoading(false);
        };

        load();
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    const current = orderPayment?.current ?? null;
    const isPaid = orderPayment?.status_Pay === 'CONFIRMADO' || current?.status === 'APROVADO';
    const pixOpen = current?.method === 'PIX' && current.status === 'PENDENTE' && !!current.pix_Qr_Code;
    const inAnalysis = current?.status === 'EM_ANALISE';

    // ── Tela atual ──────────────────────────────────────────────────────────
    const screen: PaymentScreen = useMemo(() => {
        if (loading) return 'loading';
        if (loadError || !orderPayment) return 'unavailable';
        if (isPaid) return 'approved';
        if (inAnalysis) return 'analysis';
        if (current && current.method !== 'PIX' && (current.status === 'RECUSADO' || current.status === 'ERRO') && dismissedResultId !== current.id)
            return 'rejected';
        if (!orderPayment.can_Pay) return 'closed';
        if (!config?.enabled) return 'unavailable';
        return 'choose';
    }, [loading, loadError, orderPayment, isPaid, inAnalysis, current, dismissedResultId, config]);

    // ── Gera o PIX ──────────────────────────────────────────────────────────
    const generatePix = useCallback(async () => {
        if (creatingPix) return;
        setCreatingPix(true);
        const result = await CreatePix(orderId);
        setCreatingPix(false);
        if (!result.success || !result.data) {
            notify.error(result.error?.error?.code || 'Pagamento', errorMessage(result as any, 'Não foi possível gerar o PIX.'));
            return;
        }
        applyServerClock(result.data);
        previousStatusRef.current = result.data.current?.status ?? null;
        LoadNotificationAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, creatingPix]);

    // Vindo do checkout com PIX: gera sozinho (uma vez), se ainda não houver um válido.
    useEffect(() => {
        if (screen !== 'choose' || !autoStartPix || autoStartedRef.current || method !== 'pix') return;
        autoStartedRef.current = true;
        if (!pixOpen) generatePix();
    }, [screen, autoStartPix, method, pixOpen, generatePix]);

    // ── Cartão (onSubmit do Card Payment Brick) ─────────────────────────────
    const submitCard = useCallback(async (request: Omit<CardPaymentRequest, 'id_Order'>) => {
        setSubmittingCard(true);
        const result = await CreateCard({ ...request, id_Order: orderId });
        setSubmittingCard(false);

        if (!result.success || !result.data) {
            notify.error(result.error?.error?.code || 'Pagamento', errorMessage(result as any, 'Não foi possível processar o cartão.'));
            // Rejeita para o Brick liberar o botão de novo.
            throw new Error('card-payment-failed');
        }

        applyServerClock(result.data);
        const status = result.data.current?.status;
        previousStatusRef.current = status ?? null;
        LoadNotificationAll();

        if (status === 'APROVADO') notify.success('Pagamento aprovado', 'Seu pedido foi confirmado.');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    const retryAfterRejection = () => {
        if (current) setDismissedResultId(current.id);
        setMethod('credit');
    };

    const payWithPixInstead = () => {
        if (current) setDismissedResultId(current.id);
        setMethod('pix');
    };

    // ── Consulta automática enquanto o pagamento está em aberto ─────────────
    const shouldPoll = !loading && (pixOpen || inAnalysis);
    useEffect(() => {
        if (!shouldPoll) return;
        const timer = window.setInterval(async () => {
            if (document.hidden) return;
            const result = await LoadOrderPayment(orderId);
            if (!result.success || !result.data) return;
            applyServerClock(result.data);

            const status = result.data.current?.status ?? null;
            if (status !== previousStatusRef.current) {
                previousStatusRef.current = status;
                LoadNotificationAll();
                if (status === 'APROVADO' || result.data.status_Pay === 'CONFIRMADO') notify.success('Pagamento confirmado', 'Recebemos o seu pagamento. Seu pedido foi confirmado.');
                else if (status === 'EXPIRADO') notify.error('PIX', 'O prazo do PIX terminou. Gere um novo para pagar.');
            }
        }, PAYMENT_POLL_MS);
        return () => window.clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldPoll, orderId]);

    // ── Contagem regressiva do PIX ──────────────────────────────────────────
    useEffect(() => {
        if (!pixOpen) return;
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [pixOpen]);

    const pixSecondsLeft = useMemo(() => {
        if (!pixOpen || !current?.expires_At) return null;
        const expires = new Date(current.expires_At).getTime();
        if (Number.isNaN(expires)) return null;
        return Math.max(0, Math.floor((expires - (now + clockOffsetRef.current)) / 1000));
    }, [pixOpen, current, now]);

    // Chegou a zero: pergunta ao servidor (a rotina marca EXPIRADO e avisa).
    useEffect(() => {
        if (pixSecondsLeft === 0) LoadOrderPayment(orderId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pixSecondsLeft === 0]);

    const copyPixCode = async () => {
        const code = current?.pix_Qr_Code;
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
        } catch {
            // Navegadores sem clipboard API (http): usa um campo temporário.
            const field = document.createElement('textarea');
            field.value = code;
            document.body.appendChild(field);
            field.select();
            document.execCommand('copy');
            document.body.removeChild(field);
        }
        setCopied(true);
        notify.success('Código copiado', 'Cole no app do seu banco, na opção PIX Copia e Cola.');
        window.setTimeout(() => setCopied(false), 2500);
    };

    const refreshNow = async () => {
        const result = await LoadOrderPayment(orderId);
        if (result.success && result.data) applyServerClock(result.data);
    };

    return {
        result: {
            screen,
            loadError,
            config,
            orderPayment,
            current,
            method,
            pixOpen,
            pixSecondsLeft,
            creatingPix,
            submittingCard,
            copied,
            amount: method === 'pix' ? orderPayment?.pix_Amount ?? 0 : orderPayment?.card_Amount ?? 0,
        },
        action: {
            setMethod,
            generatePix,
            submitCard,
            copyPixCode,
            refreshNow,
            retryAfterRejection,
            payWithPixInstead,
            goToOrders: () => navigate('/orders'),
            goHome: () => navigate('/'),
        },
    };
};
