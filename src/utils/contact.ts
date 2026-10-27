/**
 * Contatos da loja (telefone/WhatsApp e e-mail) vindos de "Configurações do site".
 * O telefone é salvo só com dígitos e DDI (ex.: 5582999999999).
 */

const onlyDigits = (value?: string | null) => (value ?? '').replace(/\D/g, '');

/** Tira o DDI 55 para mostrar/editar no formato brasileiro. */
const localDigits = (value?: string | null) => {
    const d = onlyDigits(value);
    return d.length >= 12 && d.startsWith('55') ? d.slice(2) : d;
};

/** (82) 99999-9999 / (82) 3333-3333 enquanto digita. */
export const formatPhoneInput = (value?: string | null) => {
    const d = localDigits(value).slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

/** Telefone pronto para mostrar ao cliente, ou null se não estiver configurado. */
export const formatStorePhone = (value?: string | null) => {
    const d = localDigits(value);
    return d.length >= 10 ? formatPhoneInput(d) : null;
};

/** Valida o telefone digitado no admin (DDD + 8 ou 9 dígitos). */
export const isValidPhone = (value?: string | null) => {
    const d = localDigits(value);
    return d.length === 10 || d.length === 11;
};

export const isValidEmail = (value?: string | null) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((value ?? '').trim());

/** Link do WhatsApp da loja com mensagem pronta, ou null se não houver telefone. */
export const storeWhatsAppUrl = (phone?: string | null, message?: string) => {
    let d = onlyDigits(phone);
    if (d.length < 10) return null;
    if (!d.startsWith('55') || d.length < 12) d = `55${d}`;
    return `https://wa.me/${d}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
};

export const storeTelUrl = (phone?: string | null) => {
    const d = localDigits(phone);
    return d.length >= 10 ? `tel:+55${d}` : null;
};
