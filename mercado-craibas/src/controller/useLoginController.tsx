import { useState } from 'react';
import { useStore } from '../context/store';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../utils/NotificationCard';
import { useAuthStore } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { UserService } from '../service/UserService';
import { AuthService } from '../service/AuthService';
import { UseUserStore } from '../store/UseUserStore';

export const useLoginController = () => {
    const { saveUser, logout } = UseUserStore();
    const userContext = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { loginUser } = AuthService;
    const { getUser } = UserService;


    const notify = useNotification();

    const handleSubmit = async (e: React.FormEvent, form: { email: string, password: string }, mode: 'login' | 'register') => {
        e.preventDefault();
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
            // const ok = login(form.email, form.password);

            // if (!ok.success) {
            //     setError('Email ou senha incorretos');
            //     notify.error('Email ou senha incorretos', 'error');
            // }
            // else {
            //     notify.success('Login realizado com sucesso', 'success');
            //     if (ok.role === 'admin') {
            //         navigate('/admin');
            //     } else if (ok.role === 'delivery') {
            //         navigate('/delivery');
            //     } else {
            //         navigate('/');
            //     }
            // }
        }
        // else {
        //     if (!form.email.includes('@')) { setError('Email inválido'); setLoading(false); return; }
        //     if (form.password.length < 6) { setError('Senha deve ter no mínimo 6 caracteres'); setLoading(false); return; }
        //     saveUser({
        //         id: `u${Date.now()}`,
        //         name: '',
        //         email: form.email,
        //         role: 'customer',
        //         phone: '',
        //         //bio: '',
        //         Insert_date: new Date().toLocaleDateString('pt-BR'),
        //         preferences: { notifications: true, newsletter: false, darkMode: false, language: 'pt-BR' },
        //         address: { street: '', number: '', neighborhood: '', city: 'Craibas', state: 'AL', zipCode: '' }
        //     });
        //     navigate('/');
        //     notify.success('Cadastro realizado com sucesso', 'success');
        // }

        setError('');
        setLoading(true);


        const finalResult = await (await loginUser(email, password))
            .chain(async (tokens) => {
                useAuthStore.getState().setTokens(tokens);
                return await getUser(tokens.role || ' ');
            });
        finalResult.fold(
            (user) => {
                saveUser(user);
                notify.success("Sucesso", "Bem-vindo!" + " " + user.name);
                navigate("/");
            },
            (err) => {
                notify.error("Erro", err);
                cleanUserData();
            }
        );

        setLoading(false);

        await new Promise(r => setTimeout(r, 800));

        setLoading(false);
    };
    const cleanUserData = () => {
        logout();
    };
    return {
        action: {
            handleSubmit,
            setPassword,
            setEmail
        },
        result: {
            error,
            loading,
            email,
            password
        }

    }
}