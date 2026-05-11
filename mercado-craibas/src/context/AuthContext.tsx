
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Tokens } from '../models/Tokens';
import { api } from '../config/api';

interface AuthContextData {
    tokens: Tokens | null;
    isAuthenticated: boolean;
    isReady: boolean;
    saveTokens: (tokens: Tokens) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextData>(
    {} as AuthContextData
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isReady, setIsReady] = useState(false);

    const [tokens, setTokens] = useState<Tokens | null>(() => {
        const stored = localStorage.getItem('@app:tokens');
        if (stored) {
            const parsedTokens = JSON.parse(stored);
            api.defaults.headers.common.Authorization = `Bearer ${parsedTokens.accessToken}`;
            return parsedTokens;
        }
        return null;
    });

    useEffect(() => {
        setIsReady(true);
    }, []);

    const saveTokens = (newTokens: Tokens) => {
        localStorage.setItem('@app:tokens', JSON.stringify(newTokens));
        api.defaults.headers.common.Authorization = `Bearer ${newTokens.accessToken}`;
        setTokens(newTokens);
    };

    const logout = () => {
        localStorage.removeItem('@app:tokens');
        localStorage.removeItem('@app:user');
        delete api.defaults.headers.common.Authorization;
        setTokens(null);
    };

    return (
        <AuthContext.Provider value={{
            tokens,
            isAuthenticated: !!tokens,
            isReady,
            saveTokens,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);