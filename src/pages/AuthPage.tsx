import { useEffect, useState } from 'react';
import { Eye, EyeOff, ArrowRight, ShoppingBag, Mail, Lock, User, AlertCircle, Phone, MailCheck } from 'lucide-react';
import { useStore } from '../context/store';
import { useNavigate, useParams } from 'react-router-dom';
import { useLoginController } from '../controller/useLoginController';
import Loading from '../components/Loading';
import { UseRouteStore } from '../store/UseRouteStore';
import { UseUserStore } from '../store/UseUserStore';
import ContinueRegistrationPopup from '../components/PendingRegistrationPopup';
import PendingRegistrationPopup from '../components/PendingRegistrationPopup';
import RegistrationProgress from "../components/RegistrationProgress";
import { RegistrationStep } from '../models/User';
import { useNotification } from '../utils/NotificationCard';
import ConfirmResendCodeModal from '../components/ConfirmResendCodeModal';
import ConfirmEditEmailModal from '../components/ConfirmEditEmailModal';
export default function AuthPage() {
  const Controller = useLoginController();
  const navigate = useNavigate();
  const { navigateTo } = UseRouteStore();
  const { modeRegister } = useParams();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [verificationTime, setVerificationTime] = useState(0);
  console.log('Controller.result.verificationTime:', verificationTime);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [showResendModal, setShowResendModal] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const notify = useNotification();
  useEffect(() => {
    if (modeRegister === 'register') {
      setMode('register');
    }
  }, [modeRegister]);
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length <= 2) {
      return `(${numbers}`;
    }

    if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }

    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };
  const password = Controller.result.password;
  const confirmPassword = Controller.result.confirmPassword;

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


  const [pendingRegistration, setPendingRegistration] = useState<{
    name: string;
    phone: string;
    step: string;
  } | null>(null);

  useEffect(() => {
    if (mode !== 'register') return;

    const saved = localStorage.getItem('pending_registration');

    if (!saved) return;

    try {
      const data = JSON.parse(saved);

      console.log('Cadastro recuperado:', data);

      const idUser = data?.idUser ?? 0;

      const nextStep = validSteps.includes(
        data?.nextStep as RegistrationStep
      )
        ? (data.nextStep as RegistrationStep)
        : 'Started';

      console.log('ID recuperado:', idUser);
      console.log('Etapa recuperada:', nextStep);

      Controller.action.setuserRegisterResponse({
        idUser: data?.idUser ?? 0,
        nextStep: nextStep,
        name: data?.name ?? '',
        phone: data?.phone ?? '',
        backRegistration: data?.backRegistration ?? false,
        email: data?.email ?? '',
        expiresAt: data?.expiresAt ? new Date(data.expiresAt) : new Date()
      });

      Controller.action.setStep(nextStep);

      notify.info('Cadastro pendente', 'Você tem um cadastro pendente. Continue de onde parou.');

    } catch (error) {
      console.error('Erro ao recuperar cadastro:', error);

      localStorage.removeItem('pending_registration');
    }

  }, []);
  useEffect(() => {
    if (mode !== 'register') return;

    const saved = localStorage.getItem('pending_registration');

    if (!saved) return;

    try {
      const data = JSON.parse(saved);

      console.log('Cadastro recuperado:', data);
      console.log('Controller.result.step:', Controller.result.step);


      const idUser = data?.idUser ?? 0;

      const nextStep = validSteps.includes(
        data?.nextStep as RegistrationStep
      )
        ? (data.nextStep as RegistrationStep)
        : 'Started';

      console.log('ID recuperado:', idUser);
      console.log('Etapa recuperada:', nextStep);

      Controller.action.setuserRegisterResponse({
        idUser: data?.idUser ?? 0,
        nextStep,
        name: data?.name ?? '',
        phone: data?.phone ?? '',
        backRegistration: data?.backRegistration ?? false,
        email: data?.email ?? '',
        expiresAt: data?.expiresAt
          ? new Date(data.expiresAt)
          : new Date()
      });

      Controller.action.setStep(nextStep);

      notify.info(
        'Cadastro pendente',
        'Você tem um cadastro pendente. Continue de onde parou.'
      );

    } catch (error) {
      console.error('Erro ao recuperar cadastro:', error);

      localStorage.removeItem('pending_registration');
    }

  }, [mode]);

  useEffect(() => {
    if (
      mode !== 'register' ||
      Controller.result.step !== 'EmailVerificationPending' ||
      !Controller.result.UserRegisterResponse?.expiresAt
    ) {
      return;
    }

    const updateTimer = () => {
      const expiresAt = new Date(Controller?.result.UserRegisterResponse?.expiresAt || Date.now()).getTime();
      console.log('Expires at:', expiresAt);
      const now = Date.now();

      const remaining = Math.max(
        0,
        Math.floor((expiresAt - now) / 1000)
      );

      setVerificationTime(remaining);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [mode, Controller.result.step, Controller.result.UserRegisterResponse]);
  const formattedVerificationTime =
    `${Math.floor(verificationTime / 60)}:${(verificationTime % 60)
      .toString()
      .padStart(2, '0')}`;
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-950 via-surface-900 to-surface-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-0 relative animate-fade-in">
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl rounded-r-none p-10 text-white overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="relative">
            <button onClick={() => navigateTo('home')} className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <span className="font-display font-bold text-sm">MC</span>
              </div>
              <span className="font-display font-bold text-xl">Mercado Craibas</span>
            </button>
            <ShoppingBag className="w-14 h-14 mb-6 opacity-80 animate-float" />
            <h2 className="font-display font-bold text-3xl leading-tight mb-4">A melhor<br />experiência de<br />compras online</h2>
            <p className="text-white/70 font-body text-base leading-relaxed">Milhares de produtos com os melhores preços, entrega rápida e compra 100% segura.</p>
          </div>
          <div className="relative space-y-2">
            {['✅ Mais de 500 produtos disponíveis', '🚚 Entrega rápida em todo Brasil', '🔒 Pagamento 100% seguro', '💳 Parcele em até 12x sem juros'].map((item, i) => (
              <p key={i} className="text-white/80 font-body text-sm">{item}</p>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-3xl md:rounded-l-none p-8 md:p-10 shadow-strong">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">MC</span>
            </div>
            <span className="font-display font-bold text-surface-900 text-lg">Mercado Craibas</span>
          </div>
          <div className="flex gap-1 bg-surface-100 rounded-2xl p-1 mb-8">
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} className={`flex-1 py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${mode === m ? 'bg-white text-surface-900 shadow-soft' : 'text-surface-400 hover:text-surface-600'}`}>
                {m === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            ))}
          </div>
          <h1 className="font-display font-bold text-surface-900 text-2xl mb-1">{mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}</h1>
          <p className="text-surface-400 font-body text-sm mb-6">{mode === 'login' ? 'Entre com suas credenciais para continuar' : 'Preencha os dados abaixo para se cadastrar'}</p>
          {mode === 'register' &&
            <RegistrationProgress step={Controller.result.step} />
          }

          {Controller.result.error && mode === 'login' ? (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-red-600 font-body text-sm">{Controller.result.error}</p>
            </div>
          ) : null}
          {Controller.result.errorUser && mode === 'register' ? (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-red-600 font-body text-sm">{Controller.result.errorUser || Controller.result.error}</p>
            </div>
          ) : null}
          {Controller.result.errorEmail && mode === 'register' ? (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-red-600 font-body text-sm">{Controller.result.errorEmail || Controller.result.error}</p>
            </div>
          ) : null}
          {Controller.result.errorPassword && mode === 'register' ? (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-red-600 font-body text-sm">{Controller.result.errorPassword || Controller.result.error}</p>
            </div>
          ) : null}
          {Controller.result.errorCodeEmail && mode === 'register' ? (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-red-600 font-body text-sm">{Controller.result.errorCodeEmail || Controller.result.error}</p>
            </div>
          ) : null}
          {mode === 'login' &&

            <form onSubmit={(e) => Controller.action.handleSubmit(e, form, mode)} className="space-y-4">
              <div>
                <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                  <input
                    type="email"
                    value={Controller.result.email}
                    onChange={(e) => {
                      Controller.action.setEmail(e.target.value);
                      setForm(f => ({ ...f, email: e.target.value }));
                    }}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-3 border-2 border-surface-200 rounded-xl font-body text-sm text-surface-800 placeholder:text-surface-300 focus:border-brand-400 focus:outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => {
                      Controller.action.setPassword(e.target.value);
                      setForm(f => ({ ...f, password: e.target.value }));
                    }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border-2 border-surface-200 rounded-xl font-body text-sm text-surface-800 placeholder:text-surface-300 focus:border-brand-400 focus:outline-none transition-colors" />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-300 hover:text-surface-500 transition-colors">
                    {showPass ?
                      <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={Controller.result.loading} className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-70 text-white font-display font-bold rounded-xl transition-all shadow-brand hover:shadow-brand-lg flex items-center justify-center gap-2 mt-2">
                {Controller.result.loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{mode === 'login' ? 'Entrar' : 'Criar Conta'}<ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          }
          {mode === 'register' && Controller.result.step === 'Started' &&
            <form onSubmit={(e) => { e.preventDefault(); Controller.action.handleRegisterStart(); }} className="space-y-4">

              <div>
                <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                  <input
                    type="text"
                    value={Controller.result.formNewUser.name}
                    onChange={e => Controller.action.setFormNewUser(f => ({ ...f, name: e.target.value }))}
                    placeholder="João Silva"
                    className="w-full pl-10 pr-4 py-3 border-2 border-surface-200 rounded-xl font-body text-sm text-surface-800 placeholder:text-surface-300 focus:border-brand-400 focus:outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">
                  Telefone
                </label>

                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />

                  <input
                    type="tel"
                    value={Controller.result.formNewUser.phone}
                    onChange={e =>
                      Controller.action.setFormNewUser(f => ({
                        ...f,
                        phone: formatPhone(e.target.value)
                      }))
                    }
                    maxLength={16}
                    placeholder="(99) 9 9999-9999"
                    className="w-full pl-10 pr-4 py-3 border-2 border-surface-200 rounded-xl font-body text-sm text-surface-800 placeholder:text-surface-300 focus:border-brand-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                {/* <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">Senha</label> */}
                {/* <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => {
                      Controller.action.setPassword(e.target.value);
                      setForm(f => ({ ...f, password: e.target.value }));
                    }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border-2 border-surface-200 rounded-xl font-body text-sm text-surface-800 placeholder:text-surface-300 focus:border-brand-400 focus:outline-none transition-colors" />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-300 hover:text-surface-500 transition-colors">
                    {showPass ?
                      <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />}
                  </button>
                </div> */}
              </div>
              <button
                type="submit"
                disabled={Controller.result.loading}
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-70 text-white font-display font-bold rounded-xl transition-all shadow-brand hover:shadow-brand-lg flex items-center justify-center gap-2 mt-2">
                {Controller.result.loading ?
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
                  <>{'Criar Conta'}<ArrowRight className="w-4 h-4" />
                  </>}
              </button>
            </form>
          }

          {mode === 'register' && Controller.result.step === 'PersonalDataCompleted' && (
            <form
              onSubmit={(e) => { e.preventDefault(); Controller.action.handleRegisterEmailSave(); }}
              className="space-y-4"
            >
              {/* E-mail */}
              <div>
                <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">
                  E-mail
                </label>

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />

                  <input
                    type="email"
                    value={Controller.result.formEmail.email}
                    onChange={(e) =>
                      Controller.action.setFormEmail(f => ({
                        ...f,
                        email: e.target.value
                      }))
                    }
                    placeholder="joao@email.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 border-2 border-surface-200 rounded-xl font-body text-sm text-surface-800 placeholder:text-surface-300 focus:border-brand-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Confirmar e-mail */}
              <div>
                <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">
                  Confirmar e-mail
                </label>

                <div className="relative">
                  <MailCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />

                  <input
                    type="email"
                    value={Controller.result.formEmail.confirmEmail}
                    onChange={(e) =>
                      Controller.action.setFormEmail(f => ({
                        ...f,
                        confirmEmail: e.target.value
                      }))
                    }
                    placeholder="Digite seu e-mail novamente"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 border-2 border-surface-200 rounded-xl font-body text-sm text-surface-800 placeholder:text-surface-300 focus:border-brand-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={Controller.result.loading}
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-70 text-white font-display font-bold rounded-xl transition-all shadow-brand hover:shadow-brand-lg flex items-center justify-center gap-2 mt-2"
              >
                {Controller.result.loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {mode === 'register' &&
            Controller.result.step === 'EmailVerificationPending' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  Controller.action.handleRegisterConfirmEmail();
                }}
                className="space-y-5"
              >

                {/* Ícone */}
                <div className="flex justify-center">
                  <div className=" w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center">
                    <MailCheck className="w-8 h-8 text-brand-500" />
                  </div>
                </div>

                {/* Título */}
                <div className="text-center">

                  <h2 className=" font-display font-bold text-surface-900 text-2xl">
                    Confirme seu e-mail
                  </h2>

                  <p className="  text-surface-400  font-body  text-sm  mt-2  leading-relaxed">
                    Enviamos um código de confirmação para
                  </p>

                  <p className="  text-surface-800  font-display  font-semibold  text-sm  mt-1  break-all">
                    {Controller.result.UserRegisterResponse?.email ?? Controller.result.formEmail.email}
                  </p>
                  <button
                    type="button"
                    onClick={() => Controller.action.setShowEditEmailModal(true)}
                    className="mt-2 text-brand-500 hover:text-brand-600 font-display font-semibold text-xs transition-colors underline underline-offset-2"
                  >
                    Editar e-mail
                  </button>
                </div>

                {/* Campo do código */}
                <div>

                  <label className="  block  text-xs  font-display  font-semibold  text-surface-600  mb-1.5  text-center">
                    Código de confirmação
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={Controller.result.verificationCode}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6);

                      Controller.action.setVerificationCode(value);
                    }}
                    placeholder="000000"
                    className=" w-full py-4 px-4 border-2 border-surface-200 rounded-xl font-display font-bold text-2xl tracking-[0.5em] text-center text-surface-800 placeholder:text-surface-300 focus:border-brand-400 focus:outline-none transition-colors" />

                </div>

                {/* Contador */}
                <div className="text-center">

                  {verificationTime > 0 ? (

                    <>
                      <p className="text-surface-400 font-body text-sm">
                        O código expira em
                      </p>

                      <p className="text-brand-500 font-display font-bold text-lg mt-1">
                        {formattedVerificationTime}
                      </p>
                    </>

                  ) : (

                    <p className="text-red-500 font-body text-sm">
                      O código expirou.
                    </p>

                  )}

                </div>

                {/* Confirmar */}
                <button
                  type="submit"
                  disabled={
                    Controller.result.loading ||
                    Controller.result.verificationCode.length !== 6 ||
                    verificationTime <= 0
                  }
                  className=" w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-bold rounded-xl transition-all shadow-brand hover:shadow-brand-lg flex items-center justify-center gap-2">

                  {Controller.result.loading ? (
                    <div className=" w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (

                    <>
                      Confirmar e-mail
                      <ArrowRight className="w-4 h-4" />
                    </>

                  )}

                </button>

                {/* Reenviar código */}
                <div className="text-center">

                  {verificationTime > 0 ? (

                    <p className="text-surface-400 font-body text-xs leading-relaxed">
                      Não recebeu o código?
                      <br />
                      Você poderá solicitar um novo código quando o atual expirar.
                    </p>

                  ) : (

                    <button
                      type="button"
                      disabled={Controller.result.loading}
                      onClick={() => setShowResendModal(true)}
                      className="  text-brand-500  hover:text-brand-600  font-display  font-semibold  text-sm  transition-colors  disabled:opacity-50  disabled:cursor-not-allowed"
                    >
                      Reenviar código
                    </button>
                  )}
                </div>
                {/* Aviso */}
                <div className=" p-4 bg-surface-50 rounded-xl border border-surface-100">

                  <p className=" text-xs text-surface-500 font-body text-center leading-relaxed">
                    Não encontrou o e-mail? Verifique também sua
                    pasta de spam ou lixo eletrônico.
                  </p>

                </div>

              </form>
            )}
          {mode === 'register' &&
            Controller.result.step === 'EmailCompleted' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  Controller.action.handleRegisterPasswordSave();
                }}
                className="space-y-5"
              >
                {/* Ícone */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-brand-500" />
                  </div>
                </div>

                {/* Título */}
                <div className="text-center">
                  <h2 className="font-display font-bold text-surface-900 text-2xl">
                    Crie sua senha
                  </h2>

                  <p className="text-surface-400 font-body text-sm mt-2 leading-relaxed">
                    Adicione uma senha segura para proteger sua conta.
                  </p>
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">
                    Senha
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />

                    <input
                      type={Controller.result.showPassword ? 'text' : 'password'}
                      value={Controller.result.password}
                      onChange={(e) =>
                        Controller.action.setPassword(e.target.value)
                      }
                      placeholder="Digite sua senha"
                      autoComplete="new-password"
                      className="  w-full  pl-10  pr-12  py-3  border-2  border-surface-200  rounded-xl  font-body  text-sm  text-surface-800  placeholder:text-surface-300  focus:border-brand-400  focus:outline-none  transition-colors"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        Controller.action.setShowPassword(
                          !Controller.result.showPassword
                        )
                      }
                      className="  absolute  right-3.5  top-1/2  -translate-y-1/2  text-surface-300  hover:text-surface-500  transition-colors">
                      {Controller.result.showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmar senha */}
                <div>
                  <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">
                    Confirmar senha
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />

                    <input
                      type={
                        Controller.result.showConfirmPassword
                          ? 'text'
                          : 'password'
                      }
                      value={Controller.result.confirmPassword}
                      onChange={(e) =>
                        Controller.action.setConfirmPassword(e.target.value)
                      }
                      placeholder="Digite sua senha novamente"
                      autoComplete="new-password"
                      className={`
              w-full
              pl-10
              pr-12
              py-3
              border-2
              rounded-xl
              font-body
              text-sm
              text-surface-800
              placeholder:text-surface-300
              focus:outline-none
              transition-colors
              ${Controller.result.confirmPassword &&
                          Controller.result.password !==
                          Controller.result.confirmPassword
                          ? 'border-red-300 focus:border-red-400'
                          : 'border-surface-200 focus:border-brand-400'
                        }
            `}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        Controller.action.setShowConfirmPassword(
                          !Controller.result.showConfirmPassword
                        )
                      }
                      className="
              absolute
              right-3.5
              top-1/2
              -translate-y-1/2
              text-surface-300
              hover:text-surface-500
              transition-colors
            "
                    >
                      {Controller.result.showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Senhas diferentes */}
                  {Controller.result.confirmPassword &&
                    Controller.result.password !==
                    Controller.result.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1.5">
                        As senhas não coincidem.
                      </p>
                    )}
                </div>

                {/* Requisitos */}
                <div className="p-4 bg-surface-50 rounded-xl border border-surface-100">
                  <p className="text-xs font-display font-semibold text-surface-600 mb-3">
                    Sua senha deve conter:
                  </p>

                  <div className="space-y-1.5">

                    {/* 8 caracteres */}
                    <p
                      className={`text-xs transition-colors ${passwordRules.minLength ? 'text-green-600' : password.length > 0 ? 'text-red-500' : 'text-surface-400'}`}
                    >
                      <span className="inline-block w-4">
                        {passwordRules.minLength ? '✓' : password.length > 0 ? '✕' : '•'}
                      </span>
                      Pelo menos 8 caracteres
                    </p>

                    {/* Maiúscula */}
                    <p className={`text-xs transition-colors ${passwordRules.uppercase ? 'text-green-600' : password.length > 0 ? 'text-red-500' : 'text-surface-400'}`}>
                      <span className="inline-block w-4">
                        {passwordRules.uppercase ? '✓' : password.length > 0 ? '✕' : '•'}
                      </span>
                      Pelo menos 1 letra maiúscula
                    </p>

                    {/* Minúscula */}
                    <p className={`text-xs transition-colors ${passwordRules.lowercase ? 'text-green-600' : password.length > 0 ? 'text-red-500' : 'text-surface-400'}`}>
                      <span className="inline-block w-4">
                        {passwordRules.lowercase ? '✓' : password.length > 0 ? '✕' : '•'}
                      </span>
                      Pelo menos 1 letra minúscula
                    </p>

                    {/* Número */}
                    <p
                      className={`text-xs transition-colors ${passwordRules.number ? 'text-green-600' : password.length > 0 ? 'text-red-500' : 'text-surface-400'}`}
                    >
                      <span className="inline-block w-4">
                        {passwordRules.number ? '✓' : password.length > 0 ? '✕' : '•'}
                      </span>
                      Pelo menos 1 número
                    </p>

                    {/* Caractere especial */}
                    <p className={`text-xs transition-colors ${passwordRules.special ? 'text-green-600' : password.length > 0 ? 'text-red-500' : 'text-surface-400'}`} >
                      <span className="inline-block w-4">
                        {passwordRules.special ? '✓' : password.length > 0 ? '✕' : '•'}
                      </span>
                      Pelo menos 1 caractere especial
                    </p>

                    {/* Senhas iguais */}
                    <p
                      className={`text-xs transition-colors ${passwordRules.match
                        ? 'text-green-600'
                        : confirmPassword.length > 0
                          ? 'text-red-500'
                          : 'text-surface-400'
                        }`}
                    >
                      <span className="inline-block w-4">
                        {passwordRules.match
                          ? '✓'
                          : confirmPassword.length > 0
                            ? '✕'
                            : '•'}
                      </span>
                      As senhas devem ser iguais
                    </p>

                  </div>
                </div>
                {/* Botão */}
                <button
                  type="submit"
                  disabled={
                    Controller.result.loading ||
                    !passwordRules.minLength ||
                    !passwordRules.uppercase ||
                    !passwordRules.lowercase ||
                    !passwordRules.number ||
                    !passwordRules.special ||
                    !passwordRules.match
                  }
                  className=" w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-bold rounded-xl transition-all shadow-brand hover:shadow-brand-lg flex items-center justify-center gap-2 mt-2">
                  {Controller.result.loading ? (<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Criar senha
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

          {mode === 'register' &&
            Controller.result.step === 'Completed' && (
              <div className="flex flex-col items-center justify-center text-center py-8">

                {/* Ícone de sucesso */}
                <div className=" w-20 h-20 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center mb-6 animate-fade-in">
                  <svg
                    className="w-10 h-10 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                {/* Título */}
                <h2 className=" font-display font-bold text-surface-900 text-2xl mb-2">
                  Cadastro realizado!
                </h2>

                {/* Descrição */}
                <p className="  text-surface-400  font-body  text-sm  leading-relaxed  max-w-sm  mb-8">
                  Sua conta foi criada com sucesso.
                  <br />
                  Agora você já pode acessar o Mercado Craibas.
                </p>

                {/* Botão OK */}
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("pending_registration");
                    Controller.action.setStep("Started");
                    setMode("login");

                  }}
                  className="  w-full  py-3.5  bg-brand-500  hover:bg-brand-600  text-white  font-display  font-bold  rounded-xl  transition-all  shadow-brand  hover:shadow-brand-lg  flex  items-center  justify-center  gap-2">
                  OK
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>
            )}
          {mode === 'register' && Controller.result.step != 'Started' && (
            <button
              type="button"
              onClick={() => {
                Controller.action.setTitlePopapAvis('Não é você?');
                Controller.action.setDescriptonPopapAvis('se você não é a pessoa que iniciou o cadastro, clique em "Cancelar" para começar um novo cadastro.');
                Controller.action.setConfirmTextPopapAvis('Cancelar');
                Controller.action.setCancelTextPopapAvis('Sim sou eu');
                Controller.action.setModalNotYou(true);
              }}
              title="Começar outro cadastro"
              className="w-full mt-4 py-2.5 text-surface-400 hover:text-brand-500 font-body text-sm transition-colors"
            >
              Não é você? Começar outro cadastro
            </button>
          )}
          <button onClick={() => navigate('/')} className="w-full mt-4 py-2.5 text-surface-400 hover:text-surface-600 font-body text-sm transition-colors">← Voltar à loja</button>
        </div>
      </div>
      {/* <Loading
        loading={Controller.result.loading}
        message={Controller.result.message || "Carregando..."}
        subMessage={Controller.result.subMessage || "Validando credenciais..."}
      /> */}
      <PendingRegistrationPopup
        open={Controller.result.modalVoltaCadatro}
        title={Controller.result.titlePopapAvis}
        description={Controller.result.descriptonPopapAvis}
        confirmText={Controller.result.confirmTextPopapAvis}
        cancelText={Controller.result.cancelTextPopapAvis}
        onContinue={Controller.action.handleRegisterStartConfirmContinuar}
        onCancel={Controller.action.handleRegisterStartCancel}
      />
      <PendingRegistrationPopup
        open={Controller.result.modalNotYou}
        title={Controller.result.titlePopapAvis}
        description={Controller.result.descriptonPopapAvis}
        confirmText={Controller.result.confirmTextPopapAvis}
        cancelText={Controller.result.cancelTextPopapAvis}
        onContinue={Controller.action.handleNotYouCancele}
        onCancel={() => Controller.action.setModalNotYou(false)}
      />
      <ConfirmResendCodeModal
        open={showResendModal}
        email={
          Controller.result.UserRegisterResponse.email || ""
        }
        loading={Controller.result.loading}
        onCancel={() => setShowResendModal(false)}
        onConfirm={async () => {
          await Controller.action.handleResendEmailCode();
          setShowResendModal(false);
        }}
      />
      <ConfirmEditEmailModal
        open={Controller.result.showEditEmailModal}
        loading={Controller.result.loading}
        onCancel={() => Controller.action.setShowEditEmailModal(false)}
        onConfirm={() => {
          Controller.action.handleEditEmail();
        }}
      />
    </div>
  );
}
