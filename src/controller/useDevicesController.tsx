import { useCallback, useEffect, useState } from "react";
import { DeviceSession } from "../models/DeviceSession";
import { UseDeviceSessionStore } from "../store/UseDeviceSessionStore";
import { useNotification } from "../utils/NotificationCard";

/** Depois de confirmar a senha, não pede de novo por 10 minutos (o servidor também controla). */
const REAUTH_WINDOW_MS = 10 * 60 * 1000;

type DevicesControllerReturn = {
    result: {
        sessions: DeviceSession[];
        currentSession: DeviceSession | null;
        otherSessions: DeviceSession[];
        LoadingDevices: boolean;
        LoadError: boolean;
        revokingId: number | null;
        revokingOthers: boolean;
        confirmTarget: DeviceSession | null;
        confirmOthers: boolean;
        /** Precisa pedir a senha antes de remover. */
        needsPassword: boolean;
        passwordError: string;
        confirming: boolean;
    };
    action: {
        LoadDevices: () => Promise<void>;
        openRevoke: (session: DeviceSession) => void;
        openRevokeOthers: () => void;
        cancelConfirm: () => void;
        handleRevokeSession: (password?: string) => Promise<void>;
        handleRevokeOthers: (password?: string) => Promise<void>;
    };
};

export const useDevicesController = (): DevicesControllerReturn => {
    const { sessions, LoadSessions, RevokeSession, RevokeOtherSessions } = UseDeviceSessionStore();
    const notify = useNotification();

    const [LoadingDevices, setLoadingDevices] = useState(false);
    const [LoadError, setLoadError] = useState(false);
    const [revokingId, setRevokingId] = useState<number | null>(null);
    const [revokingOthers, setRevokingOthers] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState<DeviceSession | null>(null);
    const [confirmOthers, setConfirmOthers] = useState(false);

    const [reauthUntil, setReauthUntil] = useState(0);
    const [passwordError, setPasswordError] = useState('');
    const [confirming, setConfirming] = useState(false);

    const currentSession = sessions.find((s) => s.isCurrent) ?? null;
    const otherSessions = sessions.filter((s) => !s.isCurrent);
    const needsPassword = Date.now() >= reauthUntil;

    const LoadDevices = useCallback(async () => {
        setLoadingDevices(true);
        setLoadError(false);

        try {
            const result = await LoadSessions();

            if (!result.success) {
                setLoadError(true);
            }
        } finally {
            setLoadingDevices(false);
        }
    }, [LoadSessions]);

    useEffect(() => {
        LoadDevices();
    }, [LoadDevices]);

    const openRevoke = (session: DeviceSession) => {
        setPasswordError('');
        setConfirmTarget(session);
    };

    const openRevokeOthers = () => {
        setPasswordError('');
        setConfirmOthers(true);
    };

    const cancelConfirm = () => {
        if (confirming) return;
        setPasswordError('');
        setConfirmTarget(null);
        setConfirmOthers(false);
    };

    /**
     * Trata os erros da confirmação de senha.
     * Retorna true quando o popup deve continuar aberto.
     */
    const handleReauthError = (code?: string, message?: string): boolean => {
        if (code === 'Auth.InvalidPassword') {
            setPasswordError(message ?? 'Senha incorreta.');
            return true;
        }

        if (code === 'Auth.ReauthRequired') {
            // O servidor pediu a senha (ex: a confirmação expirou)
            setReauthUntil(0);
            setPasswordError('Confirme sua senha para continuar.');
            return true;
        }

        if (code === 'Auth.ReauthLocked') {
            setReauthUntil(0);
            notify.error('Muitas tentativas', message ?? 'Aguarde alguns minutos e tente novamente.');
            return false;
        }

        return false;
    };

    const handleRevokeSession = async (password?: string) => {
        const target = confirmTarget;
        if (!target) return;

        setConfirming(true);
        setPasswordError('');
        setRevokingId(target.id);

        try {
            const result = await RevokeSession(target.id, password);

            if (!result.success) {
                const code = result.error?.error?.code;
                const message = result.error?.error?.message;

                if (handleReauthError(code, message)) return;

                setConfirmTarget(null);

                if (code !== 'Auth.ReauthLocked') {
                    notify.error(code ?? 'Dispositivo', message ?? 'Não foi possível desconectar o dispositivo.');
                }
                return;
            }

            if (password) setReauthUntil(Date.now() + REAUTH_WINDOW_MS);

            setConfirmTarget(null);
            notify.success('Dispositivo desconectado', `${target.deviceName} foi desconectado da sua conta.`);
        } finally {
            setConfirming(false);
            setRevokingId(null);
        }
    };

    const handleRevokeOthers = async (password?: string) => {
        setConfirming(true);
        setPasswordError('');
        setRevokingOthers(true);

        try {
            const result = await RevokeOtherSessions(password);

            if (!result.success) {
                const code = result.error?.error?.code;
                const message = result.error?.error?.message;

                if (handleReauthError(code, message)) return;

                setConfirmOthers(false);

                if (code !== 'Auth.ReauthLocked') {
                    notify.error(code ?? 'Dispositivos', message ?? 'Não foi possível desconectar os dispositivos.');
                }
                return;
            }

            if (password) setReauthUntil(Date.now() + REAUTH_WINDOW_MS);

            setConfirmOthers(false);

            const total = result.data ?? 0;

            notify.success(
                'Dispositivos desconectados',
                total === 1
                    ? '1 dispositivo foi desconectado da sua conta.'
                    : `${total} dispositivos foram desconectados da sua conta.`
            );
        } finally {
            setConfirming(false);
            setRevokingOthers(false);
        }
    };

    return {
        result: {
            sessions,
            currentSession,
            otherSessions,
            LoadingDevices,
            LoadError,
            revokingId,
            revokingOthers,
            confirmTarget,
            confirmOthers,
            needsPassword,
            passwordError,
            confirming,
        },
        action: {
            LoadDevices,
            openRevoke,
            openRevokeOthers,
            cancelConfirm,
            handleRevokeSession,
            handleRevokeOthers,
        },
    };
};
