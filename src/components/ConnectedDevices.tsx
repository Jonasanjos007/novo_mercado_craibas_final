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

export default function ConnectedDevices() {
    const Controller = useDevicesController();
    const { NameColorGlobal, ColorGlobalTema, ColorGlobalText } = UseUserStore();
    const theme = getColorConfig(NameColorGlobal);

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
            <div className="relative overflow-hidden rounded-2xl border border-surface-100 bg-gradient-to-br from-white via-surface-50 to-surface-100 shadow-soft">
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
                        <h2 className="font-display font-bold text-surface-900 text-lg">
                            Dispositivos conectados
                        </h2>
                        <p className="text-sm text-surface-400 mt-1">
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
                            className="w-9 h-9 rounded-xl bg-white border border-surface-100 flex items-center justify-center text-surface-400 hover:text-surface-800 hover:border-surface-200 transition disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${LoadingDevices ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Carregando (skeleton) ── */}
            {firstLoad && (
                <div className="bg-white rounded-2xl border border-surface-100 shadow-soft p-5 space-y-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-50 animate-pulse">
                            <div className="w-12 h-12 rounded-2xl bg-surface-200" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3.5 w-40 rounded-full bg-surface-200" />
                                <div className="h-3 w-24 rounded-full bg-surface-200" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Erro ao carregar ── */}
            {!LoadingDevices && LoadError && sessions.length === 0 && (
                <div className="bg-white rounded-2xl border border-surface-100 shadow-soft p-8 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                        <ShieldAlert className="w-7 h-7 text-red-500" />
                    </div>
                    <p className="font-semibold text-surface-900">Não foi possível carregar seus dispositivos</p>
                    <p className="text-sm text-surface-400 mt-1">Verifique sua conexão e tente novamente.</p>
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
                <div className="bg-white rounded-2xl border border-surface-100 shadow-soft overflow-hidden">
                    <div className="px-5 pt-4 pb-1">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-surface-400">
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
                                    <p className="font-semibold text-surface-900 truncate">
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

                                <div className="flex items-center gap-4 mt-1.5 text-xs text-surface-400 flex-wrap">
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
                <div className="bg-white rounded-2xl border border-surface-100 shadow-soft overflow-hidden">
                    <div className="flex items-center justify-between px-5 pt-4 pb-1">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-surface-400">
                            Outros dispositivos
                        </p>
                        {otherSessions.length > 0 && (
                            <span className="text-xs font-semibold text-surface-400">
                                {otherSessions.length}
                            </span>
                        )}
                    </div>

                    <div className="p-5 pt-3 space-y-2.5">
                        {otherSessions.length === 0 ? (
                            <div className="flex flex-col items-center text-center py-8">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                                    <ShieldCheck className="w-7 h-7 text-emerald-500" />
                                </div>
                                <p className="font-semibold text-surface-900">Tudo certo por aqui</p>
                                <p className="text-sm text-surface-400 mt-1 max-w-xs">
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
                                        className={`group flex items-center gap-4 p-4 rounded-2xl border border-surface-100 bg-surface-50/60 hover:bg-white hover:border-surface-200 hover:shadow-soft transition-all ${removing ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-surface-100 flex items-center justify-center shrink-0 shadow-sm">
                                            {deviceIcon(session.deviceType, `w-6 h-6 text-surface-500 transition-colors ${theme.class_group_hover_text}`)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-surface-900 truncate">
                                                {session.deviceName}
                                            </p>

                                            <div className="flex items-center gap-4 mt-1 text-xs text-surface-400 flex-wrap">
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
                                            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
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
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition disabled:opacity-50"
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
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-surface-100 shadow-soft">
                <div className="w-9 h-9 rounded-xl bg-surface-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className={`w-5 h-5 ${ColorGlobalText}`} />
                </div>
                <div>
                    <p className="text-sm font-semibold text-surface-900">Não reconhece algum dispositivo?</p>
                    <p className="text-xs text-surface-400 mt-0.5 leading-relaxed">
                        Remova o dispositivo e altere sua senha em <span className="font-semibold text-surface-600">Configuração</span>.
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
