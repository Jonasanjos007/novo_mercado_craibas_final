import { DeliveryAddress, DeliveryEarningEntry, DeliveryOrder } from "../models/Delivery";

/* Utilitários do portal de entregas (entregador e admin). */

export const deliveryStatusMeta: Record<string, { label: string; dot: string; chip: string }> = {
    PREPARANDO: {
        label: 'Preparando',
        dot: 'bg-sky-400',
        chip: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    },
    SAIU_PARA_ENTREGA: {
        label: 'Em rota',
        dot: 'bg-brand-400',
        chip: 'bg-brand-500/10 text-brand-500 border-brand-500/20',
    },
    ENTREGUE: {
        label: 'Entregue',
        dot: 'bg-emerald-400',
        chip: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    },
};

export const statusMeta = (status: string) =>
    deliveryStatusMeta[status] ?? {
        label: status,
        dot: 'bg-surface-400',
        chip: 'bg-surface-500/10 text-surface-500 border-surface-500/20',
    };

export const toDate = (value?: string | null): Date | null => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

export const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "agora", "há 12 min", "há 3 h", "ontem 14:20", "12/03 09:10". */
export const formatRelative = (value?: string | null): string => {
    const date = toDate(value);
    if (!date) return '-';

    const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (diffMin < 1) return 'agora';
    if (diffMin < 60) return `há ${diffMin} min`;

    const today = new Date();
    if (sameDay(date, today)) return `hoje ${time}`;

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (sameDay(date, yesterday)) return `ontem ${time}`;

    return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} ${time}`;
};

/** "Hoje", "Ontem" ou "seg, 12 de mar". */
export const formatDayLabel = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (sameDay(date, today)) return 'Hoje';
    if (sameDay(date, yesterday)) return 'Ontem';

    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
};

/** Segunda-feira da semana (mesma regra do servidor). */
export const startOfWeek = (date: Date): Date => {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diff = (result.getDay() + 6) % 7;
    result.setDate(result.getDate() - diff);
    return result;
};

export const formatWeekLabel = (weekStart: Date): string => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);

    const current = startOfWeek(new Date());
    if (sameDay(weekStart, current)) return 'Esta semana';

    const last = new Date(current);
    last.setDate(current.getDate() - 7);
    if (sameDay(weekStart, last)) return 'Semana passada';

    const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    return `${fmt(weekStart)} – ${fmt(end)}`;
};

export interface DayGroup<T> {
    key: string;
    date: Date;
    label: string;
    items: T[];
}

export function groupByDay<T>(items: T[], getDate: (item: T) => string | null | undefined): DayGroup<T>[] {
    const map = new Map<string, DayGroup<T>>();

    for (const item of items) {
        const date = toDate(getDate(item));
        if (!date) continue;

        const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const key = day.toISOString();

        if (!map.has(key)) map.set(key, { key, date: day, label: formatDayLabel(day), items: [] });
        map.get(key)!.items.push(item);
    }

    return Array.from(map.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
}

export interface WeekGroup {
    key: string;
    start: Date;
    label: string;
    total: number;
    pending: number;
    paid: number;
    deliveries: number;
    entries: DeliveryEarningEntry[];
}

export function groupEarningsByWeek(entries: DeliveryEarningEntry[]): WeekGroup[] {
    const map = new Map<string, WeekGroup>();

    for (const entry of entries) {
        const date = toDate(entry.date);
        if (!date) continue;

        const start = startOfWeek(date);
        const key = start.toISOString();

        if (!map.has(key)) {
            map.set(key, { key, start, label: formatWeekLabel(start), total: 0, pending: 0, paid: 0, deliveries: 0, entries: [] });
        }

        const group = map.get(key)!;
        group.entries.push(entry);
        group.total += entry.amount;
        group.deliveries += entry.deliveries;
        if (entry.paid) group.paid += entry.amount;
        else group.pending += entry.amount;
    }

    return Array.from(map.values()).sort((a, b) => b.start.getTime() - a.start.getTime());
}

export const addressLine = (address?: DeliveryAddress | null): string => {
    if (!address) return 'Endereço não informado';
    const street = [address.road, address.number].filter(Boolean).join(', ');
    return street;
};

export const cityLine = (address?: DeliveryAddress | null): string => {
    if (!address) return '';
    return [address.city, address.state].filter(Boolean).join(' / ');
};

/** Abre a rota no Google Maps (funciona no celular e no computador). */
export const mapsUrl = (address?: DeliveryAddress | null): string => {
    const query = [addressLine(address), cityLine(address)].filter(Boolean).join(', ');
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
};

const digits = (phone?: string | null) => (phone ?? '').replace(/\D/g, '');

export const telUrl = (phone?: string | null): string | null => {
    const d = digits(phone);
    return d.length >= 8 ? `tel:${d}` : null;
};

export const whatsappUrl = (phone?: string | null, message?: string): string | null => {
    let d = digits(phone);
    if (d.length < 10) return null;
    if (!d.startsWith('55')) d = `55${d}`;
    return `https://wa.me/${d}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
};

export const isPaymentPending = (order: DeliveryOrder) => (order.status_Pay ?? '').toUpperCase() === 'PENDENTE';

export const initials = (name?: string | null) =>
    (name ?? '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || '?';

export const avatarUrl = (avatar?: string | null) => (avatar ? `/Imagens/Usuarios/${avatar}` : '');

/** Cores do portal de entregas (mesmo padrão escuro/claro do painel admin). */
export const deliveryTheme = (dark: boolean) => ({
    dark,
    page: dark ? 'bg-[#07070b]' : 'bg-[#f4f4f7]',
    card: dark ? 'bg-[#0f0f16] border-white/[0.06]' : 'bg-white border-surface-200/70',
    cardSolid: dark ? 'bg-[#0f0f16]' : 'bg-white',
    soft: dark ? 'bg-white/[0.04]' : 'bg-surface-50',
    softer: dark ? 'bg-white/[0.02]' : 'bg-surface-50/60',
    txt: dark ? 'text-white' : 'text-surface-900',
    txt2: dark ? 'text-white/60' : 'text-surface-500',
    sub: dark ? 'text-white/35' : 'text-surface-400',
    bord: dark ? 'border-white/[0.06]' : 'border-surface-100',
    divide: dark ? 'divide-white/[0.06]' : 'divide-surface-100',
input: dark
    ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/10'
    : 'bg-surface-50 border-surface-200 text-surface-800 placeholder:text-surface-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/10',
    hover: dark ? 'hover:bg-white/[0.06]' : 'hover:bg-surface-100',
    ghostBtn: dark
        ? 'border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.06]'
        : 'border-surface-200 text-surface-600 hover:text-surface-900 hover:bg-surface-50',
});

export type DeliveryTheme = ReturnType<typeof deliveryTheme>;
