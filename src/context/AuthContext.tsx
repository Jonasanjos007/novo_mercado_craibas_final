import { create } from 'zustand';
import { api, getSessionModalType, isSessionRejected, refreshAccessToken } from '../config/api';
import {
  clearBrowserUserData,
  clearStoredTokens,
  getStoredAccessToken,
  hasStoredSession,
  setStoredAccessToken,
  setStoredSession,
} from '../config/authStorage';
import { UseUserStore } from '../store/UseUserStore';
import { useSessionStore } from '../store/SessionStore';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  isReady: boolean;

  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
  init: () => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Garante que o init rode uma única vez por carregamento da página,
 * mesmo que o React (StrictMode) execute o useEffect duas vezes.
 */
let initPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  isReady: false,

  setAccessToken: (token: string) => {

    setStoredAccessToken(token);

    setStoredSession(true);

    api.defaults.headers.common.Authorization =
      `Bearer ${token}`;

    set({
      accessToken: token,
      isAuthenticated: true,
    });
  },

  clearAccessToken: () => {
    clearStoredTokens();
    delete api.defaults.headers.common.Authorization;

    set({
      accessToken: null,
      isAuthenticated: false,
    });
  },

  init: () => {
    if (!initPromise) {
      initPromise = runInit(set);
    }
    return initPromise;
  },

  logout: async () => {
    delete api.defaults.headers.common.Authorization;
    UseUserStore.getState().logout();
    clearBrowserUserData();
    setStoredSession(false);
    localStorage.removeItem('pending_registration');
    set({
      accessToken: null,
      isAuthenticated: false,
      isReady: true,
    });

    try {
      await api.post(
        '/v1/auth/logout',
        {}
      );
    } catch (error) {
      console.error(
        'Erro ao realizar logout:',
        error
      );
    } finally {

      delete api.defaults.headers.common.Authorization;
      UseUserStore.getState().logout();
      clearBrowserUserData();

      set({
        accessToken: null,
        isAuthenticated: false,
        isReady: true,
      });
    }
  },
}));

type SetAuthState = (partial: Partial<AuthState>) => void;

/**
 * Inicialização da sessão ao abrir/recarregar a página.
 */
const runInit = async (set: SetAuthState): Promise<void> => {

    const storedAccessToken =
      getStoredAccessToken();

    /**
     * Ainda existe Access Token em memória.
     */
    if (storedAccessToken) {

      api.defaults.headers.common.Authorization =
        `Bearer ${storedAccessToken}`;

      set({
        accessToken: storedAccessToken,
        isAuthenticated: true,
        isReady: true,
      });

      return;
    }

    /**
     * Não existe Access Token.
     *
     * Verifica se anteriormente existia uma sessão.
     */
    const hasSession =
      hasStoredSession();

    /**
     * Nunca houve login.
     *
     * Não tenta refresh.
     */
    if (!hasSession) {

      set({
        accessToken: null,
        isAuthenticated: false,
        isReady: true,
      });

      return;
    }

    /**
     * Existia uma sessão.
     *
     * Tenta recuperar através
     * do Refresh Token HttpOnly.
     */
    try {

      const accessToken =
        await refreshAccessToken();

      set({
        accessToken,
        isAuthenticated: true,
        isReady: true,
      });

    } catch (error) {

      /**
       * Servidor fora do ar / erro de rede:
       * NÃO encerra a sessão. O cookie de refresh continua válido
       * e a próxima requisição (ou recarregamento) tenta de novo.
       */
      if (!isSessionRejected(error)) {
        console.warn('Não foi possível renovar a sessão agora:', error);

        set({
          accessToken: null,
          isAuthenticated: false,
          isReady: true,
        });

        return;
      }

    const modalType = getSessionModalType(error);

    delete api.defaults.headers.common.Authorization;

    UseUserStore.getState().logout();

    clearBrowserUserData();

    // Impede que a aplicação tente recuperar a mesma sessão
    // novamente na próxima inicialização.
    setStoredSession(false);

    set({
        accessToken: null,
        isAuthenticated: false,
        isReady: true,
    });

    // Abre o modal depois de limpar a sessão.
    useSessionStore.getState().open(modalType);
    }
};
