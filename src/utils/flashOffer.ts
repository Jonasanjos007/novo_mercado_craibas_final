import { Cupom } from '../models/Cupom';

export function getActiveFlashOffer(cupons: Cupom[] | undefined | null): Cupom | null {
    const now = Date.now();
    return (cupons ?? []).find((c) => {
        const start = c.date_Start ? new Date(c.date_Start).getTime() : Number.NaN;
        const end = new Date((c.date_end ?? c.date_End) ?? '').getTime();
        return c.show_Flash_Offer && c.active !== false && Number.isFinite(start) && Number.isFinite(end) && now >= start && now <= end;
    }) ?? null;
}
