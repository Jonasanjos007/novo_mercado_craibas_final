import { useUser } from '../context/UserContext';
import { UseUserStore } from '../store/UseUserStore';

export enum UserRole {
    ADMIN = 'ADMIN',
    CLIENTE = 'CLIENTE',
    ENTREGADOR = 'ENTREGADOR',
    DELIVERY = 'DELIVERY'
}

export const RoleRoutes = {
    [UserRole.ADMIN]: { base: '/', home: '/' },
    [UserRole.CLIENTE]: { base: '/', home: '/' },
    [UserRole.ENTREGADOR]: { base: '/entregador', home: '/coletas' },
    // Entregador vai direto para o portal de entregas
    [UserRole.DELIVERY]: { base: '/', home: '/delivery' },
};

export const useRolePath = () => {
    const { user } = UseUserStore();


    if (!user?.role) {
        return { basePath: '', homePath: '', role: null };
    }

    const role = user.role.toUpperCase() as UserRole;
    const config = RoleRoutes[role];

    if (!config) {
        return { basePath: '', homePath: '/login', role: role };
    }

    const rawPath = `${config.base}${config.home}`;
    const homePath = rawPath.replace(/\/\//g, '/');

    return {
        basePath: config.base,
        homePath: homePath,
        role: role
    };
};