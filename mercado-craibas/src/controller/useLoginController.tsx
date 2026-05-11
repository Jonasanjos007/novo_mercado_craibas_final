import { useState } from 'react';
import { useStore } from '../context/store';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../utils/NotificationCard';

type loginControllerReturn = {
    action: {
        handleSubmit: (e: React.FormEvent, form: { name: string, email: string, password: string }, mode: 'login' | 'register') => Promise<void>;

    }
    login: (email: string, password: string) => Promise<void>;
};

export const useLoginController = () => {
    const { login, register, navigateTo } = useStore();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const notify = useNotification();

    const handleSubmit = async (e: React.FormEvent, form: { name: string, email: string, password: string }, mode: 'login' | 'register') => {
        e.preventDefault();
        setError('');
        setLoading(true);
        await new Promise(r => setTimeout(r, 800));
        if (mode === 'login') {
            if (!form.email) {
                setError('Preencha campo email');
                notify.error('Preencha campo email', 'error');
                setLoading(false);
                return;
            }
            if (!form.password) {
                setError('Preencha campo senha');
                notify.error('Preencha campo senha', 'error');
                setLoading(false);
                return;
            }
            const ok = login(form.email, form.password);

            if (!ok.success) {
                setError('Email ou senha incorretos');
                notify.error('Email ou senha incorretos', 'error');
            } else {
                notify.success('Login realizado com sucesso', 'success');
                if (ok.role === 'admin') {
                    navigate('/admin');
                } else if (ok.role === 'delivery') {
                    navigate('/delivery');
                } else {
                    navigate('/');
                }
            }
        } else {
            if (!form.name.trim()) { setError('Digite seu nome'); setLoading(false); return; }
            if (!form.email.includes('@')) { setError('Email inválido'); setLoading(false); return; }
            if (form.password.length < 6) { setError('Senha deve ter no mínimo 6 caracteres'); setLoading(false); return; }
            register(form.name, form.email, form.password);
            navigate('/');
            notify.success('Cadastro realizado com sucesso', 'success');
        }
        setLoading(false);
    };

    return {
        action: {
            handleSubmit
        },
        result: {
            error,
            loading
        }

    }
}