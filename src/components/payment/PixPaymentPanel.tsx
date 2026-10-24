import { Check, Clock, Copy, ExternalLink, Loader2, QrCode, RefreshCw, ShieldCheck, Smartphone, TimerOff, Zap } from 'lucide-react';
import { formatPrice } from '../../utils';
import { PaymentTransaction } from '../../models/Payment';

type Props = {
    accentHex: string;
    amount: number;
    expirationHours: number;
    /** Tentativa atual (pode ser um PIX vencido ou de outra forma). */
    current: PaymentTransaction | null;
    pixOpen: boolean;
    secondsLeft: number | null;
    creating: boolean;
    copied: boolean;
    onGenerate: () => void;
    onCopy: () => void;
    onRefresh: () => void;
};

const pad = (value: number) => String(value).padStart(2, '0');

function formatCountdown(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function formatExpiration(value?: string | null) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/** PIX do pedido: gera, mostra o QR Code e o copia e cola, conta o prazo e espera a confirmação. */
export default function PixPaymentPanel({ accentHex, amount, expirationHours, current, pixOpen, secondsLeft, creating, copied, onGenerate, onCopy, onRefresh }: Props) {
    const lastPixExpired = !pixOpen && current?.method === 'PIX' && (current.status === 'EXPIRADO' || current.status === 'CANCELADO');
    const lastPixFailed = !pixOpen && current?.method === 'PIX' && current.status === 'ERRO';
    const validity = expirationHours >= 1 ? `${Math.round(expirationHours)} ${Math.round(expirationHours) === 1 ? 'hora' : 'horas'}` : `${Math.round(expirationHours * 60)} minutos`;

    // ── Ainda sem PIX válido ────────────────────────────────────────────────
    if (!pixOpen) {
        return (
            <div className="animate-fade-in">
                {lastPixExpired && (
                    <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <TimerOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-display font-bold text-amber-800 text-sm">O prazo do PIX anterior terminou</p>
                            <p className="text-xs text-amber-700 mt-0.5">Nenhum valor foi cobrado. Gere um novo PIX abaixo para concluir a compra.</p>
                        </div>
                    </div>
                )}
                {lastPixFailed && current?.message && (
                    <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{current.message}</div>
                )}

                <div className="rounded-2xl border border-surface-100 bg-surface-50/70 p-6 text-center">
                    <div
                        className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
                        style={{ color: accentHex, backgroundColor: `${accentHex}14` }}
                    >
                        <QrCode className="w-7 h-7" />
                    </div>
                    <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-surface-400">Valor no PIX</p>
                    <p className="mt-1 font-display font-bold text-surface-900 text-3xl">{formatPrice(amount)}</p>
                    <p className="mt-2 text-sm text-surface-500 max-w-sm mx-auto">
                        Geramos um QR Code exclusivo para este pedido. Ele vale por <strong className="text-surface-700">{validity}</strong> e a confirmação é automática.
                    </p>

                    <button
                        type="button"
                        onClick={onGenerate}
                        disabled={creating}
                        className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-display font-bold shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60 disabled:hover:translate-y-0"
                        style={{ backgroundColor: accentHex, boxShadow: `0 10px 24px ${accentHex}40` }}
                    >
                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        {creating ? 'Gerando PIX…' : lastPixExpired ? 'Gerar novo PIX' : 'Gerar PIX'}
                    </button>
                </div>
            </div>
        );
    }

    // ── PIX aberto ──────────────────────────────────────────────────────────
    const ending = secondsLeft !== null && secondsLeft <= 300;

    return (
        <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6 items-center">
                {/* QR */}
                <div className="mx-auto">
                    <div className="relative rounded-3xl bg-white p-3 border border-surface-100 shadow-soft">
                        {current?.pix_Qr_Code_Base64 ? (
                            <img
                                src={`data:image/png;base64,${current.pix_Qr_Code_Base64}`}
                                alt="QR Code do PIX"
                                className="w-52 h-52 sm:w-56 sm:h-56 rounded-2xl"
                            />
                        ) : (
                            <div className="w-52 h-52 sm:w-56 sm:h-56 rounded-2xl bg-surface-50 flex flex-col items-center justify-center text-surface-400 text-xs text-center px-6">
                                <QrCode className="w-8 h-8 mb-2" />
                                Use o código copia e cola ao lado
                            </div>
                        )}
                    </div>
                </div>

                {/* Dados */}
                <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-surface-400">Valor</p>
                    <p className="font-display font-bold text-surface-900 text-3xl">{formatPrice(current?.amount ?? amount)}</p>

                    <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold border ${ending ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {secondsLeft !== null ? (
                            <>Expira em <span className="font-mono tabular-nums">{formatCountdown(secondsLeft)}</span></>
                        ) : (
                            <>Válido até {formatExpiration(current?.expires_At)}</>
                        )}
                    </div>
                    {secondsLeft !== null && (
                        <p className="mt-1 text-[11px] text-surface-400">Pague até {formatExpiration(current?.expires_At)}</p>
                    )}

                    {/* Copia e cola */}
                    <p className="mt-5 text-xs font-display font-semibold text-surface-600 mb-1.5">PIX Copia e Cola</p>
                    <div className="flex items-stretch gap-2">
                        <input
                            readOnly
                            value={current?.pix_Qr_Code ?? ''}
                            onFocus={e => e.currentTarget.select()}
                            aria-label="Código PIX copia e cola"
                            className="min-w-0 flex-1 px-3 py-2.5 rounded-xl border border-surface-200 bg-surface-50 font-mono text-xs text-surface-600 truncate focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={onCopy}
                            className="shrink-0 inline-flex items-center gap-1.5 px-4 rounded-xl text-white text-xs font-display font-bold transition-all hover:brightness-110"
                            style={{ backgroundColor: copied ? '#16a34a' : accentHex }}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copiado' : 'Copiar'}
                        </button>
                    </div>

                    {current?.pix_Ticket_Url && (
                        <a
                            href={current.pix_Ticket_Url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-800 transition-colors"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Abrir o PIX no Mercado Pago
                        </a>
                    )}
                </div>
            </div>

            {/* Aguardando */}
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-surface-100 bg-surface-50/70 p-4">
                <span className="relative flex w-3 h-3 shrink-0">
                    <span className="absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping" style={{ backgroundColor: accentHex }} />
                    <span className="relative inline-flex w-3 h-3 rounded-full" style={{ backgroundColor: accentHex }} />
                </span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-bold text-surface-800">Aguardando o pagamento</p>
                    <p className="text-xs text-surface-500">Assim que o banco confirmar, esta tela muda sozinha. Você também recebe e-mail e notificação.</p>
                </div>
                <button
                    type="button"
                    onClick={onRefresh}
                    title="Verificar agora"
                    className="shrink-0 w-9 h-9 rounded-xl border border-surface-200 bg-white flex items-center justify-center text-surface-500 hover:text-surface-800 hover:bg-surface-50 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Como pagar */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                    { icon: Smartphone, text: 'Abra o app do seu banco e escolha PIX' },
                    { icon: QrCode, text: 'Leia o QR Code ou cole o código copiado' },
                    { icon: ShieldCheck, text: 'Confirme: a aprovação é automática' },
                ].map(({ icon: Icon, text }, index) => (
                    <div key={text} className="flex items-center gap-2.5 rounded-xl bg-white border border-surface-100 px-3 py-2.5">
                        <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold"
                            style={{ color: accentHex, backgroundColor: `${accentHex}14` }}
                        >
                            {index + 1}
                        </span>
                        <Icon className="w-4 h-4 text-surface-400 shrink-0" />
                        <span className="text-xs text-surface-600 leading-snug">{text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
