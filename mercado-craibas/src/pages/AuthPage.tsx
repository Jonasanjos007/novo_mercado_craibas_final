import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ShoppingBag, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useStore } from '../context/store';
import { useNavigate, useParams } from 'react-router-dom';
import { useLoginController } from '../controller/useLoginController';
import Loading from '../components/Loading';

export default function AuthPage() {
  const Controller = useLoginController();
  const navigate = useNavigate();
  const { saveUser, navigateTo } = useStore();
  const { modeRegister } = useParams();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });


  if (modeRegister === 'register' && mode !== 'register') {
    setMode('register');
  }


  const hints = [
    { label: 'Cliente', email: 'joao@email.com', badge: '👤' },
    { label: 'Admin', email: 'admin@mercadocraibas.com', badge: '🛠️' },
    { label: 'Entregador', email: 'entregador@mercadocraibas.com', badge: '🚚' },
  ];

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
          {error || Controller.result.error ? (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-red-600 font-body text-sm">{error || Controller.result.error}</p>
            </div>
          ) : null}
          <form onSubmit={(e) => Controller.action.handleSubmit(e, form, mode)} className="space-y-4">
            {mode === 'register' || modeRegister === 'register' && (
              <div>
                <label className="block text-xs font-display font-semibold text-surface-600 mb-1.5">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="João Silva" className="w-full pl-10 pr-4 py-3 border-2 border-surface-200 rounded-xl font-body text-sm text-surface-800 placeholder:text-surface-300 focus:border-brand-400 focus:outline-none transition-colors" />
                </div>
              </div>
            )}
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
          {mode === 'login' && (
            <div className="mt-6 p-4 bg-surface-50 rounded-2xl border border-surface-100">
              <p className="text-xs font-display font-semibold text-surface-500 mb-3">🧪 Contas de demonstração (senha: qualquer)</p>
              <div className="space-y-2">
                {hints.map(h => (
                  <button key={h.email} onClick={() => setForm({ name: '', email: h.email, password: '123456' })} className="w-full flex items-center justify-between px-3 py-2 bg-white border border-surface-200 rounded-xl hover:border-brand-300 hover:bg-brand-50 transition-all">
                    <span className="text-xs font-body text-surface-600 truncate">{h.email}</span>
                    <span className="text-xs bg-surface-100 px-2 py-0.5 rounded-full text-surface-500 shrink-0 ml-2">{h.badge} {h.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => navigate('/')} className="w-full mt-4 py-2.5 text-surface-400 hover:text-surface-600 font-body text-sm transition-colors">← Voltar à loja</button>
        </div>
      </div>
      <Loading
        loading={Controller.result.loading}
        message="Entrando na sua conta"
        subMessage="Validando credenciais..."
      />
    </div>
  );
}
