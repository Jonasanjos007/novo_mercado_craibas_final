import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tokens } from '../models/Tokens';
import { api } from '../config/api';

interface AuthState {
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isReady: boolean;

  setTokens: (tokens: Tokens) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      tokens: null,
      isAuthenticated: false,
      isReady: false,

      init: () => {
        const tokens = get().tokens;

        if (tokens?.accessToken) {
          api.defaults.headers.common.Authorization =
            `Bearer ${tokens.accessToken}`;
        }

        set({ isReady: true, isAuthenticated: !!tokens });
      },

      setTokens: (tokens) => {
        localStorage.setItem('@app:tokens', JSON.stringify(tokens));

        api.defaults.headers.common.Authorization =
          `Bearer ${tokens.accessToken}`;

        set({
          tokens,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('@app:tokens');
        localStorage.removeItem('@app:user');

        delete api.defaults.headers.common.Authorization;

        set({
          tokens: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: '@auth-storage',
      partialize: (state) => ({
        tokens: state.tokens,
      }),
    }
  )
);