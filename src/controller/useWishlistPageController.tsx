import { useEffect, useState } from 'react';
import { useStore } from '../context/store';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../utils/NotificationCard';
import { useAuthStore } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { UserService } from '../service/UserService';
import { AuthService } from '../service/AuthService';
import { UseUserStore } from '../store/UseUserStore';
import { UseProductStore } from '../store/UseProductStore';

export const useWishlistPageController = () => {
    const { GetfavoriteAll, favorites } = UseProductStore();
    const notify = useNotification();
    const [Loading, setLoading] = useState(false);

    useEffect(() => {
        const Response = async () => {
            await GetListFavorites();
        };
        Response();

    }, [favorites]);
    console.log('favorites', favorites);
    const GetListFavorites = async () => {
        const result = await GetfavoriteAll();
        console.log("result.data", result.data);
        if (!result?.success) {
            notify.error(result.error?.error.code || "error", result?.error?.error.message || "Erro ao carregar Favoritos");
        }
    };

    return {
        action: {
            setLoading
        },
        result: {
            Loading
        }

    }
}