import {
    Monitor,
    Smartphone,
    Tablet,
    ShieldCheck,
    LogOut,
    Loader2,
    RefreshCw,
    Clock,
    CalendarDays,
    ShieldAlert,
    MonitorSmartphone,
    X,
} from 'lucide-react';
import { useDevicesController } from '../controller/useDevicesController';
import { DeviceSession, DeviceType } from '../models/DeviceSession';
import { UseUserStore } from '../store/UseUserStore';
import { getColorConfig } from '../types/Colors';
import ConfirmPopup from './ConfirmPopup';

/* ───────────── Helpers ───────────── */

const deviceIcon = (type: DeviceType, className: string) => {
    switch (type) {
        case 'mobile':
            return <Smartphone className={className} />;
        case 'tablet':
            return <Tablet className={className} />;
        default:
            return <Monitor className={className} />;
    }
};

const formatLastAccess = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 2) return 'Ativo agora';
    if (minutes < 60) return `Há ${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Há ${hours} h`;

    const days = Math.floor(hours / 24);
    if (days === 1) return 'Ontem';
    if (days < 7) return `Há ${days} dias`;

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isActiveNow = (value: string) => {
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && Date.now() - date.getTime() < 5 * 60000;
};

/* ───────────── Componente ───────────── */

export default function ConnectedDevices({ dark = false }: { dark?: boolean }) {
    const Controller = useDevicesController();
    const { NameColorGlobal, ColorGlobalTema, ColorGlobalText } = UseUserStore();
    const theme = getColorConfig(NameColorGlobal);

    const c = {
        headerCard: dark ? 'border-white/[0.06] bg-gradient-to-br from-[#14141c] via-[#0f0f16] to-[#0b0b11]' : 'border-surface-100 bg-gradient-to-br from-white via-surface-50 to-surface-100',
        card: dark ? 'bg-[#0f0f16] border-white/[0.06]' : 'bg-white border-surface-100',
        txt: dark ? 'text-white' : 'text-surface-900',
        sub: dark ? 'text-white/40' : 'text-surface-400',
        soft: dark ? 'bg-white/[0.04]' : 'bg-surface-50',
        skel: dark ? 'bg-white/[0.07]' : 'bg-surface-200',
        refresh: dark ? 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white hover:border-white/20' : 'bg-white border-surface-100 text-surface-400 hover:text-surface-800 hover:border-surface-200',
        otherItem: dark ? 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15' : 'border-surface-100 bg-surface-50/60 hover:bg-white hover:border-surface-200 hover:shadow-soft',
        otherIcon: dark ? 'bg-white/[0.05] border-white/[0.08]' : 'bg-white border-surface-100',
        iconTxt: dark ? 'text-white/55' : 'text-surface-500',
        strong: dark ? 'text-white/70' : 'text-surface-600',
        errIcon: dark ? 'bg-red-500/10' : 'bg-red-50',
        okIcon: dark ? 'bg-emerald-500/10' : 'bg-emerald-50',
        removeBtn: dark ? 'text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white' : 'text-red-500 bg-red-50 hover:bg-red-500 hover:text-white',
        allBtn: dark ? 'border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50' : 'border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300',
    };

    const {
        sessions,
        currentSession,
        otherSessions,
        LoadingDevices,
        LoadError,
        revokingId,
        revokingOthers,
        confirmTarget,
        confirmOthers,
    } = Controller.result;

    const firstLoad = LoadingDevices && sessions.length === 0;

    return (
        <div className="space-y-4 animate-fade-in">

            {/* ── Cabeçalho ── */}
            <div className={`relative overflow-hidden rounded-2xl border shadow-soft ${c.headerCard}`}>
                <div
                    className="absolute -top-24 -right-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ backgroundColor: theme.hex }}
                />

                <div className="relative p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                        style={{ background: `linear-gradient(135deg, ${theme.hex}, ${theme.hex}B3)` }}
                    >
                        <MonitorSmartphone className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h2 className={`font-display font-bold text-lg ${c.txt}`}>
                            Dispositivos conectados
                        </h2>
                        <p className={`text-sm mt-1 ${c.sub}`}>
                            Veja onde sua conta está conectada e desconecte os dispositivos que você não reconhece.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <span
                            className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg"
                            style={{ backgroundColor: theme.hex }}
                        >
                            {sessions.length} {sessions.length === 1 ? 'ativo' : 'ativos'}
                        </span>

                        <button
                            onClick={() => Controller.action.LoadDevices()}
                            disabled={LoadingDevices}
                            title="Atualizar"
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition disabled:opacity-50 ${c.refresh}`}
                        >
                            <RefreshCw className={`w-4 h-4 ${LoadingDevices ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Carregando (skeleton) ── */}
            {firstLoad && (
                <div className={`rounded-2xl border shadow-soft p-5 space-y-3 ${c.card}`}>
                    {[0, 1, 2].map((i) => (
                        <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl animate-pulse ${c.soft}`}>
                            <div className={`w-12 h-12 rounded-2xl ${c.skel}`} />
                            <div className="flex-1 space-y-2">
                                <div className={`h-3.5 w-40 rounded-full ${c.skel}`} />
                                <div className={`h-3 w-24 rounded-full ${c.skel}`} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Erro ao carregar ── */}
            {!LoadingDevices && LoadError && sessions.length === 0 && (
                <div className={`rounded-2xl border shadow-soft p-8 text-center ${c.card}`}>
                    <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${c.errIcon}`}>
                        <ShieldAlert className="w-7 h-7 text-red-500" />
                    </div>
                    <p className={`font-semibold ${c.txt}`}>Não foi possível carregar seus dispositivos</p>
                    <p className={`text-sm mt-1 ${c.sub}`}>Verifique sua conexão e tente novamente.</p>
                    <button
                        onClick={() => Controller.action.LoadDevices()}
                        className={`mt-5 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition hover:opacity-90 ${ColorGlobalTema}`}
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {/* ── Este dispositivo ── */}
            {currentSession && (
                <div className={`rounded-2xl border shadow-soft overflow-hidden ${c.card}`}>
                    <div className="px-5 pt-4 pb-1">
                        <p className={`text-[11px] font-bold uppercase tracking-widest ${c.sub}`}>
                            Este dispositivo
                        </p>
                    </div>

                    <div className="p-5 pt-3">
                        <div
                            className="relative flex items-center gap-4 p-4 rounded-2xl border-2"
                            style={{ borderColor: `${theme.hex}40`, backgroundColor: `${theme.hex}0D` }}
                        >
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                                style={{ background: `linear-gradient(135deg, ${theme.hex}, ${theme.hex}B3)` }}
                            >
                                {deviceIcon(currentSession.deviceType, 'w-6 h-6 text-white')}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className={`font-semibold truncate ${c.txt}`}>
                                        {currentSession.deviceName}
                                    </p>
                                    <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wide"
                                        style={{ backgroundColor: theme.hex }}
                                    >
                                        <ShieldCheck className="w-3 h-3" />
                                        Você está aqui
                                    </span>
                                </div>

                                <div className={`flex items-center gap-4 mt-1.5 text-xs flex-wrap ${c.sub}`}>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="relative flex w-2 h-2">
                                            <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                                            <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                                        </span>
                                        <span className="text-emerald-600 font-medium">Ativo agora</span>
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <CalendarDays className="w-3.5 h-3.5" />
                                        Conectado em {formatDate(currentSession.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Outros dispositivos ── */}
            {!firstLoad && !(LoadError && sessions.length === 0) && (
                <div className={`rounded-2xl border shadow-soft overflow-hidden ${c.card}`}>
                    <div className="flex items-center justify-between px-5 pt-4 pb-1">
                        <p className={`text-[11px] font-bold uppercase tracking-widest ${c.sub}`}>
                            Outros dispositivos
                        </p>
                        {otherSessions.length > 0 && (
                            <span className={`text-xs font-semibold ${c.sub}`}>
                                {otherSessions.length}
                            </span>
                        )}
                    </div>

                    <div className="p-5 pt-3 space-y-2.5">
                        {otherSessions.length === 0 ? (
                            <div className="flex flex-col items-center text-center py-8">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${c.okIcon}`}>
                                    <ShieldCheck className="w-7 h-7 text-emerald-500" />
                                </div>
                                <p className={`font-semibold ${c.txt}`}>Tudo certo por aqui</p>
                                <p className={`text-sm mt-1 max-w-xs ${c.sub}`}>
                                    Sua conta está conectada somente neste dispositivo.
                                </p>
                            </div>
                        ) : (
                            otherSessions.map((session: DeviceSession) => {
                                const removing = revokingId === session.id;
                                const activeNow = isActiveNow(session.lastUsedAt);

                                return (
                                    <div
                                        key={session.id}
                                        className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${c.otherItem} ${removing ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${c.otherIcon}`}>
                                            {deviceIcon(session.deviceType, `w-6 h-6 transition-colors ${c.iconTxt} ${theme.class_group_hover_text}`)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold truncate ${c.txt}`}>
                                                {session.deviceName}
                                            </p>

                                            <div className={`flex items-center gap-4 mt-1 text-xs flex-wrap ${c.sub}`}>
                                                <span className="inline-flex items-center gap-1">
                                                    {activeNow ? (
                                                        <>
                                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                            <span className="text-emerald-600 font-medium">Ativo agora</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {formatLastAccess(session.lastUsedAt)}
                                                        </>
                                                    )}
                                                </span>
                                                <span className="hidden sm:inline-flex items-center gap-1">
                                                    <CalendarDays className="w-3.5 h-3.5" />
                                                    Conectado em {formatDate(session.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => Controller.action.openRevoke(session)}
                                            disabled={removing || revokingOthers}
                                            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${c.removeBtn}`}
                                        >
                                            {removing ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <X className="w-4 h-4" />
                                            )}
                                            <span className="hidden sm:inline">Remover</span>
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {otherSessions.length > 0 && (
                        <div className="px-5 pb-5">
                            <button
                                onClick={() => Controller.action.openRevokeOthers()}
                                disabled={revokingOthers || revokingId !== null}
                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-sm font-semibold transition disabled:opacity-50 ${c.allBtn}`}
                            >
                                {revokingOthers ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <LogOut className="w-4 h-4" />
                                )}
                                Sair de todos os outros dispositivos
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Dica de segurança ── */}
            <div className={`flex items-start gap-3 p-4 rounded-2xl border shadow-soft ${c.card}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.soft}`}>
                    <ShieldCheck className={`w-5 h-5 ${ColorGlobalText}`} />
                </div>
                <div>
                    <p className={`text-sm font-semibold ${c.txt}`}>Não reconhece algum dispositivo?</p>
                    <p className={`text-xs mt-0.5 leading-relaxed ${c.sub}`}>
                        Remova o dispositivo e altere sua senha em <span className={`font-semibold ${c.strong}`}>Configuração</span>.
                        Ao trocar a senha, todos os dispositivos são desconectados.
                    </p>
                </div>
            </div>

            {/* ── Confirmações ── */}
            <ConfirmPopup
                open={!!confirmTarget}
                title="Remover dispositivo?"
                description={
                    confirmTarget
                        ? `${confirmTarget.deviceName} será desconectado da sua conta imediatamente. Para usar a conta nele de novo, será preciso fazer login.`
                        : ''
                }
                confirmText="Remover"
                cancelText="Cancelar"
                icon={<LogOut className="w-7 h-7 text-[#f97316]" />}
                requirePassword={Controller.result.needsPassword}
                passwordError={Controller.result.passwordError}
                loading={Controller.result.confirming}
                onCancel={Controller.action.cancelConfirm}
                onConfirm={(password) => Controller.action.handleRevokeSession(password)}
            />

            <ConfirmPopup
                open={confirmOthers}
                title="Sair de todos os outros dispositivos?"
                description={`${otherSessions.length} ${otherSessions.length === 1 ? 'dispositivo será desconectado' : 'dispositivos serão desconectados'} imediatamente. Este dispositivo continua conectado.`}
                confirmText="Sair de todos"
                cancelText="Cancelar"
                icon={<ShieldAlert className="w-7 h-7 text-[#f97316]" />}
                requirePassword={Controller.result.needsPassword}
                passwordError={Controller.result.passwordError}
                loading={Controller.result.confirming}
                onCancel={Controller.action.cancelConfirm}
                onConfirm={(password) => Controller.action.handleRevokeOthers(password)}
            />
        </div>
    );
}
