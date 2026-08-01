import { useEffect, } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

import { useRolePath } from '../utils/RoleRedirect';
import { useAuthStore } from '../context/AuthContext';

export const AuthRedirect = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isReady = useAuthStore((state) => state.isReady);
    const { homePath } = useRolePath();
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        if (!isReady) return;

        if (!isAuthenticated || !homePath) return;

        const cleanHomePath = homePath.replace(/\/\//g, '/');

        const isPublicRoute = location.pathname === '/' || location.pathname === '/login';
        const isAlreadyAtDestination = location.pathname.startsWith(cleanHomePath);

        if (isPublicRoute && !isAlreadyAtDestination) {
            navigate(cleanHomePath, { replace: true });
        }

    }, [isAuthenticated, isReady, homePath, location.pathname, navigate]);

    return null;
};