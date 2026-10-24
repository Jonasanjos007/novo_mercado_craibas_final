import { useEffect, useId, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { CardPaymentRequest } from '../../models/Payment';

/** SDK oficial do Mercado Pago (formulário de cartão seguro: o número do cartão nunca passa pelo nosso servidor). */
const MP_SDK_URL = 'https://sdk.mercadopago.com/js/v2';

declare global {
    interface Window {
        MercadoPago?: new (publicKey: string, options?: { locale?: string }) => {
            bricks: () => {
                create: (brick: 'cardPayment', containerId: string, settings: unknown) => Promise<{ unmount: () => void }>;
            };
        };
    }
}

let sdkPromise: Promise<void> | null = null;

/** Carrega o SDK uma vez só (várias telas podem pedir ao mesmo tempo). */
function loadMercadoPagoSdk(): Promise<void> {
    if (window.MercadoPago) return Promise.resolve();
    if (sdkPromise) return sdkPromise;

    sdkPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = MP_SDK_URL;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            sdkPromise = null;
            script.remove();
            reject(new Error('Falha ao carregar o SDK do Mercado Pago.'));
        };
        document.head.appendChild(script);
    });
    return sdkPromise;
}

type Props = {
    publicKey: string;
    amount: number;
    maxInstallments: number;
    payerEmail?: string;
    accentHex: string;
    /** Deve lançar erro quando o pagamento não foi processado (o Brick libera o botão de novo). */
    onSubmit: (request: Omit<CardPaymentRequest, 'id_Order'>) => Promise<void>;
};

type BrickFormData = {
    token: string;
    payment_method_id: string;
    installments: number;
    payer?: { email?: string; identification?: { type?: string; number?: string } };
};

type BrickAdditionalData = { paymentTypeId?: string; lastFourDigits?: string } | undefined;

/** Card Payment Brick do Mercado Pago, com as cores do site. */
export default function CardPaymentBrick({ publicKey, amount, maxInstallments, payerEmail, accentHex, onSubmit }: Props) {
    const containerId = `card-brick-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [retryKey, setRetryKey] = useState(0);
    const onSubmitRef = useRef(onSubmit);
    onSubmitRef.current = onSubmit;

    useEffect(() => {
        let cancelled = false;
        let controller: { unmount: () => void } | null = null;
        setStatus('loading');

        loadMercadoPagoSdk()
            .then(async () => {
                if (cancelled || !window.MercadoPago) return;
                const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
                const created = await mp.bricks().create('cardPayment', containerId, {
                    initialization: {
                        amount: Number(amount.toFixed(2)),
                        payer: payerEmail ? { email: payerEmail } : undefined,
                    },
                    customization: {
                        paymentMethods: { maxInstallments },
                        visual: {
                            hideFormTitle: true,
                            style: {
                                theme: 'default',
                                customVariables: {
                                    baseColor: accentHex,
                                    borderRadiusSmall: '8px',
                                    borderRadiusMedium: '12px',
                                    borderRadiusLarge: '16px',
                                    fontSizeMedium: '14px',
                                },
                            },
                        },
                    },
                    callbacks: {
                        onReady: () => { if (!cancelled) setStatus('ready'); },
                        onError: (error: unknown) => {
                            console.error('Card Payment Brick:', error);
                        },
                        onSubmit: (formData: BrickFormData, additionalData: BrickAdditionalData) =>
                            onSubmitRef.current({
                                token: formData.token,
                                payment_Method_Id: formData.payment_method_id,
                                payment_Type_Id: additionalData?.paymentTypeId,
                                installments: formData.installments || 1,
                                payer_Email: formData.payer?.email,
                                identification_Type: formData.payer?.identification?.type,
                                identification_Number: formData.payer?.identification?.number,
                                last_Four_Digits: additionalData?.lastFourDigits,
                            }),
                    },
                });

                if (cancelled) created.unmount();
                else controller = created;
            })
            .catch(error => {
                console.error(error);
                if (!cancelled) setStatus('error');
            });

        return () => {
            cancelled = true;
            try { controller?.unmount(); } catch { /* já desmontado */ }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicKey, amount, maxInstallments, retryKey]);

    return (
        <div className="relative">
            {status === 'loading' && (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-surface-400">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: accentHex }} />
                    <p className="text-sm font-body">Carregando formulário seguro do cartão…</p>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center text-center px-6 py-10">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="font-display font-semibold text-surface-800 text-sm">Não foi possível carregar o formulário do cartão</p>
                    <p className="font-body text-xs text-surface-400 mt-1">Verifique sua conexão e tente de novo, ou pague com PIX.</p>
                    <button
                        type="button"
                        onClick={() => setRetryKey(k => k + 1)}
                        className="mt-4 px-4 py-2 rounded-xl border border-surface-200 text-xs font-display font-semibold text-surface-700 hover:bg-surface-50 transition-colors"
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {/* Fica visível desde o início: o SDK precisa do container na tela para montar o formulário. */}
            <div id={containerId} className={status === 'error' ? 'hidden' : ''} />
        </div>
    );
}
