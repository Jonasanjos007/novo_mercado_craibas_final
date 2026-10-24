/** Formas de pagamento aceitas no checkout (valor gravado em Orders.Payment_terms). */
export type PaymentMethodChoice = 'pix' | 'credit';

/** Status de uma tentativa de pagamento (Payment_Transactions.Status no servidor). */
export type PaymentTransactionStatus =
    | 'PENDENTE'
    | 'EM_ANALISE'
    | 'APROVADO'
    | 'RECUSADO'
    | 'EXPIRADO'
    | 'CANCELADO'
    | 'ESTORNADO'
    | 'ERRO';

export interface PaymentConfig {
    enabled: boolean;
    publicKey: string;
    pixExpirationHours: number;
    pixDiscountPercent: number;
    maxInstallments: number;
}

export interface PaymentTransaction {
    id: number;
    method: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD';
    status: PaymentTransactionStatus;
    status_Detail?: string | null;
    message?: string | null;
    amount: number;
    installments?: number | null;
    card_Brand?: string | null;
    card_Last_Four?: string | null;
    pix_Qr_Code?: string | null;
    pix_Qr_Code_Base64?: string | null;
    pix_Ticket_Url?: string | null;
    expires_At?: string | null;
    paid_At?: string | null;
    insertDate: string;
}

export interface OrderPayment {
    id_Order: number;
    number_Order: string;
    status_Pay: string;
    order_Status: string;
    payment_Terms: string;
    total_Value_Order: number;
    pix_Amount: number;
    card_Amount: number;
    can_Pay: boolean;
    current?: PaymentTransaction | null;
    server_Time: string;
}

/** Retorno do PostSaveOrder: o checkout segue direto para o pagamento. */
export interface OrderCreated {
    id_Order: number;
    number_Order: string;
    total_Value_Order: number;
    payment_Terms: string;
}

/** O que o Card Payment Brick entrega no onSubmit, no formato da API. */
export interface CardPaymentRequest {
    id_Order: number;
    token: string;
    payment_Method_Id: string;
    payment_Type_Id?: string;
    installments: number;
    payer_Email?: string;
    identification_Type?: string;
    identification_Number?: string;
    last_Four_Digits?: string;
}

/** Intervalo da consulta automática enquanto o pagamento está em aberto. */
export const PAYMENT_POLL_MS = 5000;
