import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../context/store';
import { useState } from 'react';

type Role = 'admin' | 'delivery' | 'customer';

export function ProtectedRoute({ allowedRoles }: { allowedRoles: Role[] }) {
    const { user } = useStore();


    // ⏳ evita redirect antes de carregar

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
}