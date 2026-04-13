
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../utils/NotificationCard';
import { useStore } from '../context/store';

export const useProductController = () => {
    const { selectedProductId, ShowProduct } = useStore();
    const { id } = useParams();

    const navigate = useNavigate();
    const notify = useNotification();
    const { products } = useStore();
    useEffect(() => {
        if (id && id !== selectedProductId) {
            ShowProduct(id);
        }
    }, [id]);


    return {
        result: products
    }
};
