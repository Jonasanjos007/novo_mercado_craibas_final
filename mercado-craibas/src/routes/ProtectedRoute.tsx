import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../context/store';
import { useState } from 'react';
import { UseUserStore } from '../store/UseUserStore';

type Role = 'ADMIN' | 'DELIVERY' | 'CLIENTE';

export function ProtectedRoute({ allowedRoles }: { allowedRoles: Role[] }) {
    const { user } = UseUserStore();



    // ⏳ evita redirect antes de carregar

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role as Role)) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
}