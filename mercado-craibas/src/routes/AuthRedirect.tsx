import { useEffect, } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRolePath } from '../utils/RoleRedirect';

export const AuthRedirect = () => {
    const { isAuthenticated, isReady } = useAuth();
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