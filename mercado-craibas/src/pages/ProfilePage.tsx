import { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Edit3, Check, ArrowLeft, ShoppingBag,
  Heart, Star, Bell, Shield, CreditCard, Truck, Package, Globe,
  Camera, Lock, LogOut, ChevronRight, ToggleLeft, ToggleRight, Clock
} from 'lucide-react';
import { useStore } from '../context/store';
import { formatPrice, orderStatusLabels, orderStatusColors } from '../utils';

type ProfileTab = 'overview' | 'orders' | 'wishlist' | 'addresses' | 'security' | 'preferences';

export default function ProfilePage() {
  const { user, orders, wishlist, navigateTo, logout, updateUser } = useStore();
  const [tab, setTab] = useState<ProfileTab>('overview');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });
  const [addrForm, setAddrForm] = useState({
    street: user?.address?.street || '',
    number: user?.address?.number || '',
    complement: user?.address?.complement || '',
    neighborhood: user?.address?.neighborhood || '',
    city: user?.address?.city || 'Craibas',
    state: user?.address?.state || 'AL',
    zipCode: user?.address?.zipCode || '',
  });
  const [prefs, setPrefs] = useState({
    notifications: user?.preferences?.notifications ?? true,
    newsletter: user?.preferences?.newsletter ?? false,
    darkMode: user?.preferences?.darkMode ?? false,
  });

  const userOrders = orders.filter(o => o.userId === user?.id || true).slice(0, 10);
  const totalSpent = userOrders.reduce((s, o) => s + o.total, 0);

  const saveProfile = () => {
    updateUser({ name: form.name, email: form.email, phone: form.phone, bio: form.bio });
    setEditing(false);
  };

  const saveAddress = () => {
    updateUser({ address: addrForm });
  };

  const savePrefs = () => {
    updateUser({ preferences: { ...prefs, language: 'pt-BR' } });
  };

  const navTabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Visão Geral', icon: <User className="w-4 h-4" /> },
    { id: 'orders', label: 'Pedidos', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'wishlist', label: 'Favoritos', icon: <Heart className="w-4 h-4" /> },
    { id: 'addresses', label: 'Endereços', icon: <MapPin className="w-4 h-4" /> },
    { id: 'security', label: 'Segurança', icon: <Shield className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferências', icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <div className="bg-white border-b border-surface-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigateTo('home')} className="p-2 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-surface-900 text-lg">Minha Conta</h1>
          <button onClick={() => { logout(); navigateTo('home'); }} className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50 text-sm font-medium transition-all">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-1 space-y-4">
            {/* Avatar card */}
            <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden shadow-soft">
              <div className="h-16 bg-gradient-to-r from-brand-500 to-amber-500" />
              <div className="px-4 pb-4">
                <div className="flex items-end gap-3 -mt-8 mb-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center border-4 border-white shadow-medium">
                      <span className="text-white font-display font-bold text-xl">{user?.name?.[0]}</span>
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-500 rounded-lg flex items-center justify-center shadow">
                      <Camera className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div className="mb-0.5">
                    <p className="font-display font-bold text-surface-900 text-sm leading-none">{user?.name}</p>
                    <p className="text-brand-500 text-[10px] font-semibold mt-0.5">Cliente</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center">
                  {[
                    { v: userOrders.length, l: 'Pedidos' },
                    { v: wishlist.length, l: 'Favoritos' },
                    { v: formatPrice(totalSpent), l: 'Total' },
                  ].map((s, i) => (
                    <div key={i} className="bg-surface-50 rounded-xl p-2">
                      <p className="font-display font-bold text-surface-800 text-xs leading-none">{s.v}</p>
                      <p className="text-surface-400 text-[9px] mt-0.5">{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-2xl border border-surface-100 p-2 shadow-soft space-y-0.5">
              {navTabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    tab === t.id
                      ? 'bg-brand-500 text-white'
                      : 'text-surface-500 hover:text-surface-800 hover:bg-surface-50'
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ml-auto ${tab === t.id ? 'text-white/70' : 'text-surface-300'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-3">

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-display font-bold text-surface-900 text-lg">Informações Pessoais</h2>
                    <button
                      onClick={() => editing ? saveProfile() : setEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all bg-brand-500 hover:bg-brand-600 text-white"
                    >
                      {editing ? <><Check className="w-4 h-4" /> Salvar</> : <><Edit3 className="w-4 h-4" /> Editar</>}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Nome Completo', key: 'name', icon: <User className="w-4 h-4" />, placeholder: 'Seu nome' },
                      { label: 'Email', key: 'email', icon: <Mail className="w-4 h-4" />, placeholder: 'seu@email.com' },
                      { label: 'Telefone / WhatsApp', key: 'phone', icon: <Phone className="w-4 h-4" />, placeholder: '(82) 9xxxx-xxxx' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          {f.icon} {f.label}
                        </label>
                        {editing ? (
                          <input
                            value={(form as any)[f.key]}
                            onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                            placeholder={f.placeholder}
                            className="w-full px-4 py-2.5 border-2 border-surface-200 rounded-xl text-sm font-body focus:border-brand-400 focus:outline-none transition-colors"
                          />
                        ) : (
                          <div className="px-4 py-2.5 bg-surface-50 rounded-xl text-sm font-body text-surface-700">
                            {(form as any)[f.key] || <span className="text-surface-300 italic">Não informado</span>}
                          </div>
                        )}
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Bio / Sobre você</label>
                      {editing ? (
                        <textarea
                          value={form.bio}
                          onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                          rows={2}
                          placeholder="Conte um pouco sobre você..."
                          className="w-full px-4 py-2.5 border-2 border-surface-200 rounded-xl text-sm font-body focus:border-brand-400 focus:outline-none transition-colors resize-none"
                        />
                      ) : (
                        <div className="px-4 py-2.5 bg-surface-50 rounded-xl text-sm font-body text-surface-700">
                          {form.bio || <span className="text-surface-300 italic">Sem bio</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: <Package className="w-5 h-5 text-blue-500" />, label: 'Total Pedidos', value: userOrders.length, bg: 'bg-blue-50' },
                    { icon: <Truck className="w-5 h-5 text-green-500" />, label: 'Entregues', value: userOrders.filter(o => o.status === 'entregue').length, bg: 'bg-green-50' },
                    { icon: <Heart className="w-5 h-5 text-red-500" />, label: 'Favoritos', value: wishlist.length, bg: 'bg-red-50' },
                    { icon: <CreditCard className="w-5 h-5 text-brand-500" />, label: 'Total Gasto', value: formatPrice(totalSpent), bg: 'bg-brand-50' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-surface-100 p-4 shadow-soft flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
                      <div>
                        <p className="font-display font-bold text-surface-900 text-base">{s.value}</p>
                        <p className="text-surface-400 text-[10px]">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ORDERS ── */}
            {tab === 'orders' && (
              <div className="bg-white rounded-2xl border border-surface-100 shadow-soft">
                <div className="p-5 border-b border-surface-50 flex items-center justify-between">
                  <h2 className="font-display font-bold text-surface-900 text-lg">Meus Pedidos</h2>
                  <span className="text-surface-400 text-sm">{userOrders.length} pedidos</span>
                </div>
                {userOrders.length === 0 ? (
                  <div className="py-16 text-center">
                    <ShoppingBag className="w-10 h-10 text-surface-200 mx-auto mb-3" />
                    <p className="text-surface-400 font-body">Nenhum pedido ainda</p>
                    <button onClick={() => navigateTo('home')} className="mt-4 px-5 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-bold">Comprar agora</button>
                  </div>
                ) : (
                  <div className="divide-y divide-surface-50">
                    {userOrders.map(order => (
                      <div key={order.id} className="p-4 hover:bg-surface-50/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="font-display font-bold text-surface-900 text-sm">#{order.id}</span>
                            <p className="text-surface-400 text-xs">{order.createdAt.toLocaleDateString('pt-BR')}</p>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${orderStatusColors[order.status]}`}>
                            {orderStatusLabels[order.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {order.items.slice(0, 4).map((item, i) => (
                            <img key={i} src={item.product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-surface-100" />
                          ))}
                          {order.items.length > 4 && <span className="text-surface-400 text-xs">+{order.items.length - 4}</span>}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-surface-500 text-xs">{order.paymentMethod}</span>
                          <span className="font-display font-bold text-brand-500 text-base">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── WISHLIST ── */}
            {tab === 'wishlist' && (
              <div className="bg-white rounded-2xl border border-surface-100 shadow-soft">
                <div className="p-5 border-b border-surface-50">
                  <h2 className="font-display font-bold text-surface-900 text-lg">Meus Favoritos</h2>
                </div>
                {wishlist.length === 0 ? (
                  <div className="py-16 text-center">
                    <Heart className="w-10 h-10 text-surface-200 mx-auto mb-3" />
                    <p className="text-surface-400 font-body">Nenhum favorito ainda</p>
                  </div>
                ) : (
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {wishlist.map(({ product }) => (
                      <button
                        key={product.id}
                        onClick={() => navigateTo('product', product.id)}
                        className="text-left group"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden bg-surface-50 mb-2">
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <p className="text-surface-700 text-xs line-clamp-1 font-body">{product.name}</p>
                        <p className="font-display font-bold text-surface-900 text-sm">{formatPrice(product.price)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ADDRESSES ── */}
            {tab === 'addresses' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-soft">
                  <h2 className="font-display font-bold text-surface-900 text-lg mb-5 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-500" /> Endereço de Entrega
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Rua / Avenida', key: 'street', span: 'col-span-2', placeholder: 'Rua das Flores' },
                      { label: 'Número', key: 'number', placeholder: '123' },
                      { label: 'Complemento', key: 'complement', placeholder: 'Apto 101' },
                      { label: 'Bairro', key: 'neighborhood', placeholder: 'Centro' },
                      { label: 'Cidade', key: 'city', placeholder: 'Craibas' },
                      { label: 'Estado', key: 'state', placeholder: 'AL' },
                      { label: 'CEP', key: 'zipCode', placeholder: '57465-000' },
                    ].map(f => (
                      <div key={f.key} className={(f as any).span || ''}>
                        <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">{f.label}</label>
                        <input
                          value={(addrForm as any)[f.key]}
                          onChange={e => setAddrForm(p => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.placeholder}
                          className="w-full px-4 py-2.5 border-2 border-surface-200 rounded-xl text-sm font-body focus:border-brand-400 focus:outline-none transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                  <button onClick={saveAddress} className="mt-5 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-brand">
                    <Check className="w-4 h-4" /> Salvar Endereço
                  </button>
                </div>
              </div>
            )}

            {/* ── SECURITY ── */}
            {tab === 'security' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-soft">
                  <h2 className="font-display font-bold text-surface-900 text-lg mb-5 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-brand-500" /> Alterar Senha
                  </h2>
                  <div className="space-y-4 max-w-md">
                    {['Senha Atual', 'Nova Senha', 'Confirmar Nova Senha'].map(label => (
                      <div key={label}>
                        <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">{label}</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 border-2 border-surface-200 rounded-xl text-sm font-body focus:border-brand-400 focus:outline-none transition-colors"
                        />
                      </div>
                    ))}
                    <button className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-all shadow-brand flex items-center gap-2">
                      <Check className="w-4 h-4" /> Atualizar Senha
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-soft">
                  <h2 className="font-display font-bold text-surface-900 text-lg mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" /> Verificação em 2 Etapas
                  </h2>
                  <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
                    <div>
                      <p className="font-medium text-surface-800 text-sm">Autenticação 2FA</p>
                      <p className="text-surface-400 text-xs mt-0.5">Adicione uma camada extra de segurança</p>
                    </div>
                    <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-all">
                      Ativar
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl mt-3">
                    <div>
                      <p className="font-medium text-surface-800 text-sm">Sessões Ativas</p>
                      <p className="text-surface-400 text-xs mt-0.5">1 dispositivo conectado agora</p>
                    </div>
                    <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold rounded-xl transition-all">
                      Revogar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── PREFERENCES ── */}
            {tab === 'preferences' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-soft">
                  <h2 className="font-display font-bold text-surface-900 text-lg mb-5 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-brand-500" /> Notificações e Preferências
                  </h2>
                  <div className="space-y-3">
                    {[
                      { key: 'notifications', label: 'Notificações de pedidos', sub: 'Receba atualizações sobre seus pedidos em tempo real' },
                      { key: 'newsletter', label: 'Newsletter de ofertas', sub: 'Receba as melhores ofertas e lançamentos por email' },
                      { key: 'darkMode', label: 'Tema escuro', sub: 'Ativar modo escuro na interface (em breve)' },
                    ].map(p => (
                      <div key={p.key} className="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
                        <div>
                          <p className="font-medium text-surface-800 text-sm">{p.label}</p>
                          <p className="text-surface-400 text-xs mt-0.5">{p.sub}</p>
                        </div>
                        <button
                          onClick={() => setPrefs(prev => ({ ...prev, [p.key]: !(prev as any)[p.key] }))}
                          className="transition-all"
                        >
                          {(prefs as any)[p.key] ? (
                            <ToggleRight className="w-9 h-9 text-brand-500" />
                          ) : (
                            <ToggleLeft className="w-9 h-9 text-surface-300" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={savePrefs} className="mt-5 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-brand">
                    <Check className="w-4 h-4" /> Salvar Preferências
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-soft">
                  <h2 className="font-display font-bold text-surface-900 text-lg mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" /> Idioma e Região
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Idioma</label>
                      <select className="w-full px-4 py-2.5 border-2 border-surface-200 rounded-xl text-sm font-body focus:border-brand-400 focus:outline-none">
                        <option>Português (BR)</option>
                        <option>English</option>
                        <option>Español</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Moeda</label>
                      <select className="w-full px-4 py-2.5 border-2 border-surface-200 rounded-xl text-sm font-body focus:border-brand-400 focus:outline-none">
                        <option>BRL — Real</option>
                        <option>USD — Dólar</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                  <h3 className="font-display font-bold text-red-700 text-sm mb-1">Zona de Perigo</h3>
                  <p className="text-red-500/70 text-xs mb-4 font-body">Estas ações são irreversíveis. Prossiga com cuidado.</p>
                  <div className="flex gap-3 flex-wrap">
                    <button onClick={() => { logout(); navigateTo('home'); }} className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 font-bold text-sm rounded-xl transition-all">
                      <LogOut className="w-4 h-4" /> Sair da Conta
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-sm rounded-xl transition-all border border-red-200">
                      Excluir Conta
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
