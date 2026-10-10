import { useEffect, useRef } from "react";
import type { ElementType } from "react";
import {
    Check,
    Clock,
    KeyRound,
    LockKeyhole,
    LogIn,
    MessageCircle,
    ShieldCheck,
    UserRoundX,
    UserX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useSessionStore, SessionModalType } from "../store/SessionStore";
import { UseUserStore } from "../store/UseUserStore";
import { getColorConfig } from "../types/Colors";
import { useAuthStore } from "../context/AuthContext";

interface Props {
    open: boolean;
    type: SessionModalType;
}

type ModalKey = Exclude<SessionModalType, null>;

interface ModalConfig {
    eyebrow: string;
    title: string;
    description: string;
    hintTitle: string;
    hint: string;
    icon: ElementType;
    accent: string;
    supportMessage?: string;
    /** Mostra somente o botão "OK" (sem suporte / visitante). */
    confirmOnly?: boolean;
}

const DEFAULT_TYPE: ModalKey = "TOKEN_EXPIRED";

const SUPPORT_WHATSAPP = "5519993466756"; // DDI + DDD + número, só dígitos

const MODAL_CONFIG: Record<ModalKey, ModalConfig> = {
    TOKEN_EXPIRED: {
        eyebrow: "Sessão",
        title: "Sessão expirada",
        description:
            "Sua sessão expirou por motivos de segurança. Faça login novamente para continuar.",
        hintTitle: "Seus dados estão protegidos",
        hint: "Seus pedidos, endereços e favoritos continuam salvos na sua conta.",
        icon: Clock,
        accent: "#b45309",
    },
    SESSION_INVALIDATED: {
        eyebrow: "Segurança",
        title: "Sessão encerrada",
        description:
            "Sua sessão foi encerrada por motivos de segurança. Faça login novamente para continuar.",
        hintTitle: "Proteção da conta",
        hint: "Isso pode acontecer quando você entra em outro dispositivo ou altera suas credenciais.",
        icon: LockKeyhole,
        accent: "#4f46e5",
    },
    USER_INACTIVE: {
        eyebrow: "Conta",
        title: "Conta inativa",
        description:
            "Sua conta está inativa no momento. Entre em contato com o suporte para verificar o status da sua conta.",
        hintTitle: "Precisa de ajuda?",
        hint: "Nossa equipe de suporte pode informar o motivo e como reativar o acesso.",
        icon: UserRoundX,
        accent: "#c2410c",
        supportMessage:
            "Olá! Minha conta no Mercado Craibas está inativa e gostaria de verificar o status.",
    },
    PASSWORD_CHANGED: {
        eyebrow: "Segurança",
        title: "Senha alterada",
        description:
            "A senha da sua conta foi alterada. Por segurança, este dispositivo foi desconectado. Faça login com a nova senha para continuar.",
        hintTitle: "Não foi você?",
        hint: "Fale com o suporte imediatamente para proteger sua conta.",
        icon: KeyRound,
        accent: "#4f46e5",
        supportMessage:
            "Olá! A senha da minha conta no Mercado Craibas foi alterada e não fui eu. Preciso de ajuda.",
    },
    PASSWORD_CHANGED_SELF: {
        eyebrow: "Segurança",
        title: "Senha alterada com sucesso",
        description:
            "Por motivo de segurança, todos os dispositivos vinculados a esta conta foram desconectados, inclusive este. Faça login novamente com a sua nova senha.",
        hintTitle: "Sua conta está protegida",
        hint: "Quem estava conectado com a senha antiga perdeu o acesso imediatamente.",
        icon: KeyRound,
        accent: "#047857",
        confirmOnly: true,
    },
    USER_DELETED: {
        eyebrow: "Conta",
        title: "Conta excluída",
        description: "Esta conta foi excluída e sua sessão foi encerrada.",
        hintTitle: "Conta indisponível",
        hint: "Se isso foi um engano, fale com o suporte. Você ainda pode navegar como visitante.",
        icon: UserX,
        accent: "#be123c",
        supportMessage:
            "Olá! Minha conta no Mercado Craibas foi excluída e gostaria de entender o que aconteceu.",
    },
};

export default function SessionExpiredModal({ open, type }: Props) {
    const navigate = useNavigate();
    const { close } = useSessionStore();
    const { NameColorGlobal } = UseUserStore();
    const brand = getColorConfig(NameColorGlobal).hex;
    const loginRef = useRef<HTMLButtonElement>(null);
    const logout = useAuthStore((state) => state.logout);
    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        loginRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    if (!open) return null;

    const config = MODAL_CONFIG[type ?? DEFAULT_TYPE];
    const Icon = config.icon;

    const goTo = (path: string) => {
        close();
        navigate(path, { replace: true });
    };

    const openSupport = () => {
        if (!config.supportMessage) return;

        const url = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(
            config.supportMessage
        )}`;

        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-end justify-center bg-[#09090b]/70 backdrop-blur-sm animate-in fade-in duration-300 sm:items-center sm:p-4"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="session-modal-title"
            aria-describedby="session-modal-description"
        >
            <div className="relative w-full max-h-[100dvh] overflow-y-auto rounded-t-3xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] animate-in fade-in slide-in-from-bottom-3 duration-300 sm:max-w-[420px] sm:rounded-3xl sm:zoom-in-95">
                <div
                    className="h-1 w-full"
                    style={{ background: brand }}
                    aria-hidden
                />

                <div className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 sm:px-8 sm:pb-8">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                            style={{ background: `${config.accent}14` }}
                        >
                            <Icon
                                className="h-6 w-6"
                                strokeWidth={1.8}
                                style={{ color: config.accent }}
                            />
                        </div>

                        <span
                            className="rounded-full border px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-widest"
                            style={{
                                color: config.accent,
                                borderColor: `${config.accent}33`,
                                background: `${config.accent}0D`,
                            }}
                        >
                            {config.eyebrow}
                        </span>
                    </div>

                    <h2
                        id="session-modal-title"
                        className="mt-5 font-display text-2xl font-bold tracking-tight text-[#09090b]"
                    >
                        {config.title}
                    </h2>

                    <p
                        id="session-modal-description"
                        className="mt-2 font-body text-sm leading-relaxed text-surface-500"
                    >
                        {config.description}
                    </p>

                    <div className="mt-5 flex gap-3 rounded-2xl border border-surface-100 bg-[#f5f5f7] p-4">
                        <ShieldCheck
                            className="mt-0.5 h-[18px] w-[18px] shrink-0 text-surface-500"
                            strokeWidth={1.8}
                        />
                        <div>
                            <p className="font-display text-xs font-bold text-surface-800">
                                {config.hintTitle}
                            </p>
                            <p className="mt-0.5 font-body text-xs leading-relaxed text-surface-500">
                                {config.hint}
                            </p>
                        </div>
                    </div>

                    {config.confirmOnly ? (
                    <div className="mt-6">
                        <button
                            ref={loginRef}
                            type="button"
                            onClick={() => {
                                goTo("/login");
                                logout();
                            }}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-display text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.99]"
                            style={{
                                background: brand,
                                boxShadow: `0 4px 12px ${brand}66`,
                            }}
                        >
                            <Check className="h-4 w-4" />
                            OK
                        </button>
                    </div>
                    ) : (
                    <div className="mt-6 space-y-2.5">
                        <button
                            ref={loginRef}
                            type="button"
                            onClick={() => {
                                goTo("/login");
                                logout();
                            }}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-display text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.99]"
                            style={{
                                background: brand,
                                boxShadow: `0 4px 12px ${brand}66`,
                            }}
                        >
                            <LogIn className="h-4 w-4" />
                            Fazer login
                        </button>

                        {config.supportMessage && (
                            <button
                                type="button"
                                onClick={openSupport}
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border bg-white font-display text-sm font-bold transition-all duration-200 hover:bg-surface-50 active:scale-[0.99]"
                                style={{
                                    color: config.accent,
                                    borderColor: `${config.accent}40`,
                                }}
                            >
                                <MessageCircle className="h-4 w-4" />
                                Falar com o suporte
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                goTo("/");
                                logout();
                            }}
                            className="flex h-12 w-full items-center justify-center rounded-2xl border border-surface-200 bg-white font-display text-sm font-semibold text-surface-700 transition-all duration-200 hover:border-surface-300 hover:bg-surface-100 active:scale-[0.99]"
                        >
                            Continuar como visitante
                        </button>
                    </div>
                    )}

                    <p className="mt-5 text-center font-body text-[11px] text-surface-400">
                        Mercado Craibas · Sua segurança é nossa prioridade
                    </p>
                </div>
            </div>
        </div>
    );
}