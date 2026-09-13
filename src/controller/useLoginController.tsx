import { useState } from 'react';
import { useStore } from '../context/store';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../utils/NotificationCard';
import { useAuthStore } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { UserService } from '../service/UserService';
import { AuthService } from '../service/AuthService';
import { UseUserStore } from '../store/UseUserStore';
import { RegisterEmail, RegisterResponse, RegisterStartResponse, RegistrationStep } from '../models/User';



export const useLoginController = () => {
    const PENDING_REGISTRATION_KEY = 'pending_registration';
    const { saveUser, ResendCodigoExpired, EditEmailEndEtapStore } = UseUserStore();
    const userContext = useUser();
    const notify = useNotification();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState('');
    const [errorUser, setErrorUser] = useState('');
    const [errorEmail, setErrorEmail] = useState('');
    const [errorPassword, setErrorPassword] = useState('');
    const [errorCodeEmail, setErrorCodeEmail] = useState('');
    const [subMessage, setsubMessage] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { SaveRegisterStart, SaveRegisterEmail, SaveRegisterEmailCode, SaveRegisterPassword } = UseUserStore();
    const { loginUser } = AuthService;
    const { getUser } = UserService;
    const [step, setStep] = useState<RegistrationStep>("Started");
    const [formNewUser, setFormNewUser] = useState({ name: '', phone: '' });
    const [modalVoltaCadatro, setModalVoltaCadatro] = useState(false);
    const [modalNotYou, setModalNotYou] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [titlePopapAvis, setTitlePopapAvis] = useState('');
    const [descriptonPopapAvis, setDescriptonPopapAvis] = useState('');
    const [confirmTextPopapAvis, setConfirmTextPopapAvis] = useState('');
    const [cancelTextPopapAvis, setCancelTextPopapAvis] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showEditEmailModal, setShowEditEmailModal] = useState(false);

    const [formEmail, setFormEmail] = useState<RegisterEmail>({
        email: '',
        confirmEmail: '',
        userId: 0
    });


    const [UserRegisterResponse, setuserRegisterResponse] = useState<RegisterResponse>({
        idUser: 0,
        nextStep: '',
        name: '',
        phone: '',
        backRegistration: false,
        email: '',
        expiresAt: new Date()
    });
    console.log('UserRegisterResponse', UserRegisterResponse);

    const passwordRules = {
        minLength: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
        match:
            confirmPassword.length > 0 &&
            password === confirmPassword,
    };
    const validSteps: RegistrationStep[] = [
        "Started",
        "PersonalDataCompleted",
        "EmailCompleted",
        "PasswordCompleted",
        "EmailVerificationPending",
        "Completed"
    ];


    const handleSubmit = async (e: React.FormEvent, form: { email: string, password: string }, mode: 'login' | 'register') => {
        setMessage('Entrando na sua conta');
        setsubMessage('Validando credenciais...');
        e.preventDefault();
        if (mode === 'login') {
            if (!form.email) {
                setError('Preencha campo email');
                notify.info('Obrigatorio', 'Preencha campo email');
                setLoading(false);
                return;
            }
            if (!form.password) {
                setError('Preencha campo senha');
                notify.info('Obrigatorio', 'Preencha campo senha');
                setLoading(false);
                return;
            }
        }
        setError('');
        setLoading(true);

        const finalResult = await (await loginUser(email, password))
            .chain(async (tokens) => {
                useAuthStore.getState().setAccessToken(tokens.accessToken || ' ');
                return await getUser(tokens.role || ' ');
            });
        finalResult.fold(
            (user) => {
                saveUser(user);
                notify.success("Sucesso", "Bem-vindo!" + " " + user.name);
                if (user.role === 'ADMIN') {
                    navigate("/admin");
                } else if (user.role === 'DELIVERY') {
                    navigate("/delivery");
                } else {
                    navigate("/");
                }
            },
            (err) => {
                notify.error("Erro", err.error.message);
                cleanUserData();
            }
        );

        setLoading(false);

        await new Promise(r => setTimeout(r, 800));

        setLoading(false);
    };
    const cleanUserData = () => {
        useAuthStore.getState().logout();
    };
    const handleRegisterStart = async () => {
        setMessage('Salvando seus dados');
        setsubMessage('Aguarde um momento...');
        try {
            setLoading(true);
            if (!formNewUser.name) {
                setErrorUser('Preencha com seu nome');
                notify.info('Obrigatorio', 'Preencha com seu nome');
                setLoading(false);
                return;
            }
            if (!formNewUser.phone) {
                setErrorUser('Preencha com seu telefone');
                notify.info('Obrigatorio', 'Preencha com seu telefone');
                setLoading(false);
                return;
            }
            const result = await SaveRegisterStart(formNewUser);

            if (!result.success) {
                setErrorUser(result.error?.error.message ?? 'Erro ao salvar informações');
                notify.error(result.error?.error.code ?? 'Error', result.error?.error.message ?? 'Erro ao salvar informações');
            }

            const data = result.data;
            console.log('data', data);

            localStorage.setItem(
                PENDING_REGISTRATION_KEY,
                JSON.stringify({
                    name: data?.name ?? formNewUser.name,
                    phone: data?.phone ?? formNewUser.phone,
                    nextStep: data?.nextStep ?? 'PersonalDataCompleted',
                    idUser: data?.idUser ?? 0,
                    backRegistration: data?.backRegistration ?? false,
                    email: data?.email ?? formEmail.email,
                    expiresAt: data?.expiresAt ? data.expiresAt : new Date()
                })
            );
            setuserRegisterResponse({
                idUser: data?.idUser ?? 0,
                nextStep: data?.nextStep ?? '',
                name: data?.name ?? '',
                phone: data?.phone ?? '',
                backRegistration: data?.backRegistration ?? false,
                email: data?.email ?? '',
                expiresAt: data?.expiresAt ? data.expiresAt : new Date()
            });

            setFormEmail(f => ({ ...f, userId: data?.idUser ?? 0 }));

            if (!data?.backRegistration && result?.success) {
                const nextStep = validSteps.includes(data?.nextStep as RegistrationStep) ? (data?.nextStep as RegistrationStep) : "Started";
                setStep(nextStep);

            }
            if (data?.backRegistration && result?.success) {
                setuserRegisterResponse({
                    idUser: data?.idUser ?? 0,
                    nextStep: data?.nextStep ?? '',
                    name: data?.name ?? '',
                    phone: data?.phone ?? '',
                    backRegistration: data?.backRegistration ?? false,
                    expiresAt: data?.expiresAt ? data.expiresAt : new Date()
                });
                setModalVoltaCadatro(true);
                setTitlePopapAvis(`Olá ${UserRegisterResponse?.name} Você já começou seu cadastro a um tempo atraz😊`);
                setDescriptonPopapAvis("Encontramos algumas informações que você já preencheu. Que tal continuar de onde parou? Assim você não precisa começar tudo novamente.");
                setConfirmTextPopapAvis("Continuar");
                setCancelTextPopapAvis("Cancelar");
            }
            setErrorUser('');
        } finally {
            setLoading(false);
        }

    };

    const handleRegisterEmailSave = async () => {
        setMessage('Salvando seu email');
        setsubMessage('Aguarde um momento...');
        try {
            setLoading(true);
            if (!formEmail.email) {
                setErrorEmail('Preencha com seu email');
                notify.info('Obrigatorio', 'Preencha com seu email');
                setLoading(false);
                return;
            }
            if (!formEmail.confirmEmail) {
                setErrorEmail('Preencha com a confirmação do email');
                notify.info('Obrigatorio', 'Preencha com a confirmação do email');
                setLoading(false);
                return;
            }
            if (formEmail.email !== formEmail.confirmEmail) {
                setErrorEmail('Os emails não coincidem');
                notify.info('Erro', 'Os emails não coincidem');
                setLoading(false);
                return;
            }

            const result = await SaveRegisterEmail(formEmail, UserRegisterResponse?.idUser ?? 0);

            const data = result.data;

            localStorage.setItem(
                PENDING_REGISTRATION_KEY,
                JSON.stringify({
                    name: data?.name ?? formNewUser.name,
                    phone: data?.phone ?? formNewUser.phone,
                    nextStep: data?.nextStep ?? 'PersonalDataCompleted',
                    idUser: data?.idUser ?? 0,
                    backRegistration: data?.backRegistration ?? false,
                    email: data?.email ?? formEmail.email,
                    expiresAt: data?.expiresAt ?? new Date()
                })
            );
            if (!result.success) {
                setErrorEmail(result.error?.error.message ?? 'Erro ao salvar Email');
                notify.error(result.error?.error.code ?? 'Error', result.error?.error.message ?? 'Erro ao salvar Email');
                setLoading(false);
                return;
            }

            setuserRegisterResponse({
                idUser: data?.idUser ?? 0,
                nextStep: data?.nextStep ?? '',
                name: data?.name ?? '',
                phone: data?.phone ?? '',
                backRegistration: data?.backRegistration ?? false,
                email: data?.email ?? '',
                expiresAt: data?.expiresAt ?? new Date()
            });

            if (!data?.backRegistration && result?.success) {
                const nextStep = validSteps.includes(data?.nextStep as RegistrationStep) ? (data?.nextStep as RegistrationStep) : "Started";
                setStep(nextStep);
            }
            setErrorEmail('');
        } finally {
            setLoading(false);
        }

    };

    const handleRegisterStartCancel = async () => {
        setuserRegisterResponse({
            idUser: 0,
            nextStep: '',
            name: '',
            phone: '',
            backRegistration: false,
            email: '',
            expiresAt: new Date()
        });
        setStep('Started');
        setFormNewUser({ name: '', phone: '' })
        setModalVoltaCadatro(false);
        setTitlePopapAvis('');
        setDescriptonPopapAvis('');
        setConfirmTextPopapAvis('');
        localStorage.removeItem("pending_registration");
        setStep("Started");
        setEmail("");
        setPassword("");
        formNewUser.name = "";
        formNewUser.phone = "";
        setFormEmail({ email: "", confirmEmail: "", userId: 0 });
        setVerificationCode("");
        setConfirmPassword("");
        setError("");
    };
    const handleNotYouCancele = async () => {
        setuserRegisterResponse({
            idUser: 0,
            nextStep: '',
            name: '',
            phone: '',
            backRegistration: false,
            email: '',
            expiresAt: new Date()
        });
        setFormNewUser({ name: '', phone: '' })
        localStorage.removeItem("pending_registration");
        setStep("Started");
        setEmail("");
        setPassword("");
        formNewUser.name = "";
        formNewUser.phone = "";
        setFormEmail({ email: "", confirmEmail: "", userId: 0 });
        setVerificationCode("");
        setConfirmPassword("");
        setError("");
        setModalNotYou(false);
    };
    const handleResendEmailCode = async () => {
        setLoading(true);
        if (UserRegisterResponse.email === '' || UserRegisterResponse.phone === '' || UserRegisterResponse.idUser === 0) {
            notify.error('Erro', 'Não foi possível reenviar o código.Tente novamente.');
            setLoading(false);
            setErrorCodeEmail('Não foi possível reenviar o código.Tente novamente.');
            return;
        }

        const result = await ResendCodigoExpired(UserRegisterResponse.idUser || 0, UserRegisterResponse.email || '', UserRegisterResponse.phone || '');
        console.log('data result', result);

        const data = result.data;
        console.log('data ResendCodigoExpired', data);
        if (!result.success) {
            notify.error('Erro', result.error?.error.message ?? 'Não foi possível reenviar o código.Tente novamente.');
            setLoading(false);
            setErrorCodeEmail(result.error?.error.message ?? 'Não foi possível reenviar o código.Tente novamente.');
            return;
        }

        setuserRegisterResponse({
            idUser: data?.idUser ?? 0,
            nextStep: data?.nextStep ?? '',
            name: data?.name ?? '',
            phone: data?.phone ?? '',
            backRegistration: data?.backRegistration ?? false,
            email: data?.email ?? '',
            expiresAt: data?.expiresAt ?? new Date()
        });
        localStorage.setItem(PENDING_REGISTRATION_KEY,
            JSON.stringify({
                email: data?.email ?? formEmail.email,
                idUser: data?.idUser ?? 0,
                nextStep: data?.nextStep ?? '',
                name: data?.name ?? '',
                phone: data?.phone ?? '',
                backRegistration: data?.backRegistration ?? false,
                expiresAt: data?.expiresAt ?? new Date()
            }));
        notify.success('Sucesso', 'Código reenviado com sucesso. Verifique seu e-mail.');
        setLoading(false);
    };
    const handleRegisterStartConfirmContinuar = async () => {
        const saved = localStorage.getItem('pending_registration');

        const data = JSON.parse(saved ?? '{}') as RegisterStartResponse;

        const nextStep = validSteps.includes(UserRegisterResponse?.nextStep as RegistrationStep) ? (UserRegisterResponse?.nextStep as RegistrationStep) : "Started";

        setuserRegisterResponse({
            idUser: data?.idUser ?? 0,
            nextStep: nextStep,
            name: data?.name ?? '',
            phone: data?.phone ?? '',
            backRegistration: data?.backRegistration ?? false,
            email: data?.email ?? '',
            expiresAt: data?.expiresAt ? new Date(data.expiresAt) : new Date()
        });


        setStep(nextStep);
        setModalVoltaCadatro(false);
    };


    const handleEditEmail = async () => {
        setLoading(true);
        if (!UserRegisterResponse?.idUser || UserRegisterResponse?.idUser === 0 || !UserRegisterResponse.email) {
            notify.error('Erro', 'Não foi possível editar o e-mail. Tente novamente.');
            setErrorCodeEmail('Não foi possível editar o e-mail. Tente novamente.');
            setLoading(false);
            return;
        }
        const result = await EditEmailEndEtapStore(UserRegisterResponse?.idUser || 0, UserRegisterResponse.email || '');

        const data = result.data;

        const nextStep = validSteps.includes(data?.nextStep as RegistrationStep) ? (data?.nextStep as RegistrationStep) : "Started";


        setuserRegisterResponse({
            idUser: data?.idUser ?? 0,
            nextStep: nextStep,
            name: data?.name ?? '',
            phone: data?.phone ?? '',
            backRegistration: data?.backRegistration ?? false,
            email: data?.email ?? '',
            expiresAt: data?.expiresAt ? new Date(data.expiresAt) : new Date()
        });

        localStorage.setItem(PENDING_REGISTRATION_KEY,
            JSON.stringify({
                email: data?.email ?? formEmail.email,
                idUser: data?.idUser ?? 0,
                nextStep: data?.nextStep ?? '',
                name: data?.name ?? '',
                phone: data?.phone ?? '',
                backRegistration: data?.backRegistration ?? false,
            }));

        setStep(nextStep);
        setShowEditEmailModal(false);
        setLoading(false);

    };
    const handleRegisterConfirmEmail = async () => {
        const code = verificationCode.trim();

        if (!code) {
            setErrorEmail('Preencha com seu código de verificação');
            notify.info('Erro', 'Preencha com seu código de verificação');
            return;
        }

        if (code.length !== 6) {
            setErrorEmail('Código de verificação deve ter 6 dígitos');
            notify.info('Erro', 'Código de verificação deve ter 6 dígitos');
            return;
        }

        if (!UserRegisterResponse?.idUser) {
            setErrorEmail('Usuário não encontrado');
            notify.error('Erro', 'Usuário não encontrado');
            return;
        }

        setLoading(true);
        setErrorEmail('');

        try {
            const result = await SaveRegisterEmailCode(
                UserRegisterResponse.idUser,
                code
            );

            if (!result.success) {
                const message =
                    result.error?.error?.message ??
                    'Erro ao confirmar e-mail';

                const errorCode =
                    result.error?.error?.code ??
                    'ERROR';

                setErrorEmail(message);
                notify.error(errorCode, message);

                return;
            }
            const data = result.data;
            console.log('data Codigo', data);

            localStorage.setItem(PENDING_REGISTRATION_KEY,
                JSON.stringify({
                    email: data?.email ?? formEmail.email,
                    idUser: data?.idUser ?? 0,
                    nextStep: data?.nextStep ?? '',
                    name: data?.name ?? '',
                    phone: data?.phone ?? '',
                    backRegistration: data?.backRegistration ?? false,
                }));
            console.log('E-mail confirmado:', result.data);

            if (data?.nextStep) {
                const nextStep = validSteps.includes(data?.nextStep as RegistrationStep) ? (data?.nextStep as RegistrationStep) : "Started";
                setStep(nextStep);
            }

            setErrorEmail('');
            notify.success('E-mail confirmado', 'Seu e-mail foi confirmado com sucesso. Você pode prosseguir para a próxima etapa do cadastro.');

            setVerificationCode('');

        } catch (error) {
            console.error('Erro ao confirmar código:', error);

            setErrorEmail('Não foi possível confirmar o e-mail');

            notify.error('ERROR', 'Não foi possível confirmar o e-mail'
            );
        } finally {
            setLoading(false);
        }
    };
    const handleRegisterPasswordSave = async () => {
        setLoading(true);

        if (!UserRegisterResponse?.idUser) {
            notify.error('Erro', 'Não foi possível identificar seu cadastro.');
            setLoading(false);
            setErrorPassword('Não foi possível identificar seu cadastro.');
            return;
        }

        if (!passwordRules.minLength ||
            !passwordRules.uppercase ||
            !passwordRules.lowercase ||
            !passwordRules.number ||
            !passwordRules.special) {

            notify.info('Senha inválida', 'A senha não atende a todos os requisitos.');

            setErrorPassword('A senha não atende a todos os requisitos.');
            setLoading(false);

            return;
        }

        if (!passwordRules.match) {
            notify.info(
                'Senhas diferentes',
                'A confirmação da senha não corresponde à senha informada.'
            );
            setErrorPassword('A confirmação da senha não corresponde à senha informada.');
            setLoading(false);

            return;
        }


        try {
            const result = await SaveRegisterPassword(UserRegisterResponse.idUser, password, confirmPassword);

            if (!result.success) {
                console.log(result.error);

                notify.error('Não foi possível concluir', result.error?.error?.message ?? 'Não foi possível finalizar seu cadastro.');
                setErrorPassword(result.error?.error?.message ?? 'Não foi possível finalizar seu cadastro.');
                return;
            }

            // Cadastro finalizado
            const data = result.data;

            ZerarInformaçoes();

            if (data?.nextStep) {
                const nextStep = validSteps.includes(data?.nextStep as RegistrationStep) ? (data?.nextStep as RegistrationStep) : "Started";
                setStep(nextStep);
            }

            //notify.success('Cadastro concluído!', result.data?.message ?? 'Cadastro realizado com sucesso! Você será direcionado para a tela de login para realizar seu primeiro acesso.');

            // Aguarda o usuário visualizar a mensagem
            // setTimeout(() => {
            //     setMode("login");
            // }, 2500);

        } catch (error) {
            console.error("Erro ao finalizar cadastro:", error);
            notify.error('Erro', 'Não foi possível finalizar seu cadastro. Tente novamente.');
            setErrorPassword('Não foi possível finalizar seu cadastro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const ZerarInformaçoes = async () => {


        localStorage.removeItem(PENDING_REGISTRATION_KEY);
        setFormNewUser({ name: '', phone: '' });
        setFormEmail({
            email: '',
            confirmEmail: '',
            userId: 0
        });
        setVerificationCode('');
        setConfirmPassword('');
        setPassword('');
    };
    return {
        action: {
            handleSubmit,
            setPassword,
            setEmail,
            setName,
            setStep,
            setFormNewUser,
            handleRegisterStartCancel,
            handleRegisterStartConfirmContinuar,
            handleRegisterStart,
            setErrorUser,
            setFormEmail,
            handleRegisterEmailSave,
            handleRegisterConfirmEmail,
            setVerificationCode,
            setShowConfirmPassword,
            setShowPassword,
            setConfirmPassword,
            handleRegisterPasswordSave,
            setuserRegisterResponse,
            handleResendEmailCode,
            setShowEditEmailModal,
            handleEditEmail,
            setModalNotYou,
            handleNotYouCancele,
            setConfirmTextPopapAvis,
            setDescriptonPopapAvis,
            setTitlePopapAvis,
            setCancelTextPopapAvis

        },
        result: {
            error,
            loading,
            email,
            password,
            name,
            step,
            formNewUser,
            modalVoltaCadatro,
            errorUser,
            message,
            subMessage,
            formEmail,
            errorEmail,
            UserRegisterResponse,
            verificationCode,
            showConfirmPassword,
            showPassword,
            confirmPassword,
            errorPassword,
            errorCodeEmail,
            showEditEmailModal,
            titlePopapAvis,
            descriptonPopapAvis,
            confirmTextPopapAvis,
            modalNotYou,
            cancelTextPopapAvis
        }

    }
}
