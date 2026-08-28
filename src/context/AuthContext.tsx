import { create } from 'zustand';
import { api, refreshAccessToken } from '../config/api';
import {
  clearBrowserUserData,
  clearStoredTokens,
  getStoredAccessToken,
  setStoredAccessToken,
} from '../config/authStorage';
import { UseUserStore } from '../store/UseUserStore';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  isReady: boolean;

  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
  init: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  isReady: false,

  setAccessToken: (token: string) => {
    setStoredAccessToken(token);

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

  init: async () => {
    const storedAccessToken = getStoredAccessToken();

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

    try {
      /**
       * Se o accessToken local foi removido mas o cookie HttpOnly ainda existe,
       * recupera um novo accessToken sem expor o refreshToken ao JavaScript.
       */
      const accessToken = await refreshAccessToken();

      set({
        accessToken,
        isAuthenticated: true,
        isReady: true,
      });

    } catch {
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

  logout: async () => {
    delete api.defaults.headers.common.Authorization;
    UseUserStore.getState().logout();
    clearBrowserUserData();

    set({
      accessToken: null,
      isAuthenticated: false,
      isReady: true,
    });

    try {
      /**
       * Backend deve apagar/revogar
       * o refreshToken HttpOnly.
       */
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
