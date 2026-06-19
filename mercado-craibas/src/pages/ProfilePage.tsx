import { useEffect, useState } from 'react';
import {
  User, Mail, Phone, MapPin, Edit3, Check, ArrowLeft, ShoppingBag,
  Heart, Star, Bell, Shield, CreditCard, Truck, Package, Globe,
  Camera, Lock, LogOut, ChevronRight, ToggleLeft, ToggleRight,
  Settings, BarChart2, Crown,
  Clock,
  Pencil,
  Plus,
  CheckCircle,
  CheckCircle2,
  Trash2,

} from 'lucide-react';
import { useStore } from '../context/store';
import { formatPrice, orderStatusLabels, orderStatusColors } from '../utils';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import { Address } from '../models/Address';
import { userProfileController } from '../controller/userProfileController';
import Loading from '../components/Loading';
import ConfirmPopup from '../components/ConfirmPopup';
import { useNotification } from '../utils/NotificationCard';
import AlertPopup from '../components/AlertPopup';

type ProfileTab = 'overview' | 'orders' | 'wishlist' | 'addresses' | 'security' | 'preferences' | 'settings';



export default function ProfilePage() {
  const Controller = userProfileController();
  const navigate = useNavigate();
  const { user, orders, wishlist, address, navigateTo, logout, updateUser } = useStore();
  const [tab, setTab] = useState<ProfileTab>('overview');
  const [editing, setEditing] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const notify = useNotification();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    newsletter: true,
    primaryColor: "#3b82f6",
  });
  console.log(user);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    // bio: user?.bio || '',
  });

  const [prefs, setPrefs] = useState({
    notifications: user?.preferences?.notifications ?? true,
    newsletter: user?.preferences?.newsletter ?? false,
    darkMode: user?.preferences?.darkMode ?? false,
  });

  const userOrders = orders.filter(o => o.userId === user?.id || true).slice(0, 10);
  const totalSpent = userOrders.reduce((s, o) => s + o.total, 0);
  const AVATAR_URL =
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=280&fit=crop&crop=face,top";

  const saveProfile = () => {
    updateUser({ name: form.name, email: form.email, phone: form.phone, bio: form.bio });
    setEditing(false);
  };

  // const saveAddress = () => updateUser({ address: addrForm });



  const savePrefs = () => updateUser({ preferences: { ...prefs, language: 'pt-BR' } });

  const navTabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Visão Geral', icon: <User className="w-4 h-4" /> },
    { id: 'orders', label: 'Minhas compras', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'wishlist', label: 'Favoritos', icon: <Heart className="w-4 h-4" /> },
    { id: 'addresses', label: 'Endereços', icon: <MapPin className="w-4 h-4" /> },
    { id: 'security', label: 'Segurança', icon: <Shield className="w-4 h-4" /> },
    { id: 'settings', label: 'Configuração', icon: <Settings className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferências', icon: <Bell className="w-4 h-4" /> },
  ];
  const fields = [
    { label: "Rua / Avenida", key: "road", span: true, placeholder: "Rua das Flores" },
    { label: "Número", key: "number", placeholder: "123" },
    { label: "Complemento", key: "supplement", placeholder: "Apto 101" },
    { label: "Bairro", key: "neighborhood", placeholder: "Centro" },
    { label: "Ponto de referência", key: "referencePoint", placeholder: "Próximo à padaria" },
    { label: "Cidade", key: "city", placeholder: "Campinas" },
    { label: "Estado", key: "state", placeholder: "SP" },
  ];
  const colors = [
    { value: "brand", class: "bg-brand-500" },
    { value: "red", class: "bg-red-500" },
    { value: "orange", class: "bg-orange-500" },
    { value: "amber", class: "bg-amber-500" },
    { value: "yellow", class: "bg-yellow-500" },
    { value: "lime", class: "bg-lime-500" },
    { value: "green", class: "bg-green-500" },
    { value: "emerald", class: "bg-emerald-500" },
    { value: "teal", class: "bg-teal-500" },
    { value: "cyan", class: "bg-cyan-500" },
    { value: "sky", class: "bg-sky-500" },
    { value: "blue", class: "bg-blue-500" },
    { value: "indigo", class: "bg-indigo-500" },
    { value: "violet", class: "bg-violet-500" },
    { value: "purple", class: "bg-purple-500" },
    { value: "fuchsia", class: "bg-fuchsia-500" },
    { value: "pink", class: "bg-pink-500" },
    { value: "rose", class: "bg-rose-500" },
    { value: "brown", class: "bg-stone-500" },
    { value: "gray", class: "bg-gray-500" },
    { value: "slate", class: "bg-slate-500" },
    { value: "zinc", class: "bg-zinc-500" },
    { value: "black", class: "bg-black" },
  ];

  const colorMap = {
    brand: "#ea580c",
    red: "#ef4444",
    orange: "#f97316",
    amber: "#f59e0b",
    yellow: "#eab308",
    lime: "#84cc16",
    green: "#22c55e",
    emerald: "#10b981",
    teal: "#14b8a6",
    cyan: "#06b6d4",
    sky: "#0ea5e9",
    blue: "#3b82f6",
    indigo: "#6366f1",
    violet: "#8b5cf6",
    purple: "#a855f7",
    fuchsia: "#d946ef",
    pink: "#ec4899",
    rose: "#f43f5e",
    brown: "#78716c",
    gray: "#6b7280",
    slate: "#64748b",
    zinc: "#71717a",
    black: "#000000",
  };
  const currentColor =
    colorMap[settings.primaryColor as keyof typeof colorMap] || "#6366f1";

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

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
            { }
            <ProfileCard
              user={user}
              userOrders={userOrders}
              wishlist={wishlist}
              totalSpent={totalSpent}
            />

            {/* Navigation */}
            <div className="bg-white rounded-2xl border border-surface-100 p-2 shadow-soft space-y-0.5">
              {navTabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.id
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

                {/* ── Personal Info Card ── */}
                <div className="bg-white rounded-2xl border border-surface-100 shadow-soft overflow-hidden">

                  {/* Profile photo banner */}
                  <div
                    className="relative overflow-hidden h-56 sm:h-72 md:h-80 lg:h-[420px] cursor-zoom-in"
                    onClick={() => setShowPhoto(true)}
                  >
                    <img
                      src={`/avatar/${user?.avatar}`}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // upload da foto
                      }}
                      className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/40 border border-white/20 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm"
                    >
                      <Camera className="w-3 h-3" />
                      Alterar foto
                    </button>
                  </div>
                  {showPhoto && (
                    <div
                      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                      onClick={() => setShowPhoto(false)}
                    >
                      <button
                        className="absolute top-5 right-5 text-white text-3xl font-light"
                        onClick={() => setShowPhoto(false)}
                      >
                        ✕
                      </button>

                      <img
                        src={`/avatar/${user?.avatar}`}
                        alt="Foto de perfil"
                        className="max-w-full max-h-[90vh] object-contain rounded-2xl"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-1">
                    <h2 className="font-display font-bold text-surface-900 text-lg">Informações Pessoais</h2>
                    <button
                      onClick={() => editing ? saveProfile() : setEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all bg-brand-500 hover:bg-brand-600 text-white"
                    >
                      {editing ? <><Check className="w-4 h-4" /> Salvar</> : <><Edit3 className="w-4 h-4" /> Editar</>}
                    </button>
                  </div>

                  {/* Fields */}
                  <div className="px-5 pt-4 pb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Nome Completo', key: 'name', icon: <User className="w-4 h-4" />, placeholder: 'Seu nome' },
                        { label: 'Telefone / WhatsApp', key: 'phone', icon: <Phone className="w-4 h-4" />, placeholder: '(82) 9xxxx-xxxx' },
                        { label: 'Email', key: 'email', icon: <Mail className="w-4 h-4" />, placeholder: 'seu@email.com' },
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

                    </div>
                  </div>

                  {/* Info strip */}
                  <div className="border-t border-surface-100 grid grid-cols-2 md:grid-cols-4 divide-x divide-surface-100">
                    {[
                      { icon: <MapPin className="w-4 h-4 text-surface-300" />, label: 'Localização', value: 'Não informado' },
                      { icon: <Clock className="w-4 h-4 text-surface-300" />, label: 'Membro desde', value: 'jan. 2023' },
                      { icon: <Clock className="w-4 h-4 text-surface-300" />, label: 'Último acesso', value: '2 dias atrás' },
                      { icon: <Star className="w-4 h-4 text-surface-300" />, label: 'Nível atual', value: 'Gold → Diamond' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-4 py-3">
                        {item.icon}
                        <div>
                          <p className="font-display font-bold text-surface-800 text-xs leading-none">{item.value}</p>
                          <p className="text-surface-400 text-[10px] mt-0.5">{item.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Quick Stats ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: <Package className="w-5 h-5 text-blue-600" />, label: 'Total Pedidos', value: userOrders.length, bg: 'bg-blue-50' },
                    { icon: <Truck className="w-5 h-5 text-green-600" />, label: 'Entregues', value: userOrders.filter(o => o.status === 'entregue').length, bg: 'bg-green-50' },
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

                {/* ── Last Order ── */}
                {userOrders.length > 0 && (() => {
                  const last = userOrders[0];
                  return (
                    <div className="bg-white rounded-2xl border border-surface-100 shadow-soft overflow-hidden">
                      <div className="px-5 pt-4 pb-2 flex items-center gap-2 text-xs font-bold text-surface-500 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" /> Último pedido
                      </div>
                      <div className="px-4 pb-4 flex items-center gap-3">
                        <img
                          src={last.items[0]?.product?.images[0]}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-surface-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-bold text-surface-900 text-sm truncate">
                            {last.items[0]?.product?.name}
                            {last.items.length > 1 && <span className="text-surface-400 font-normal"> +{last.items.length - 1} itens</span>}
                          </p>
                          <p className="text-surface-400 text-xs mt-0.5">
                            Pedido #{last.id} · {last.createdAt.toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${orderStatusColors[last.status]}`}>
                            {orderStatusLabels[last.status]}
                          </span>
                          <span className="font-display font-bold text-brand-500 text-sm">{formatPrice(last.total)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

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
                          {order.items.slice(0, 4).map((item: any, i: number) => (
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
                    {wishlist.map(({ product }: any) => (
                      <button key={product.id} onClick={() => navigateTo('product', product.id)} className="text-left group">
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
              <div className="space-y-5">

                {/* ── Card principal ── */}
                <div className="bg-white rounded-2xl border border-surface-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

                  {/* Cabeçalho */}
                  <div className="flex items-center justify-between gap-4 px-6 py-5 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-brand-500" />
                      </div>
                      <span className="font-semibold text-surface-900 text-base">Meus endereços</span>
                      <span className="text-xs font-medium text-surface-400 bg-surface-50 border border-surface-100 px-2 py-0.5 rounded-full">
                        {address?.length || 0} {address?.length === 1 ? "endereço" : "endereços"}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        Controller?.action.setAddrForm({
                          road: "", number: 0, supplement: "", neighborhood: "",
                          city: "", state: "", referencePoint: "", standard: false,
                        });
                        Controller?.action.setIsEditeAddres(false);
                        Controller?.action.setcardAddendereco(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Novo endereço
                    </button>
                  </div>

                  {/* Lista de endereços */}
                  <div className="px-6 pb-6 space-y-3">
                    {(!address || address.length === 0) ? (
                      <div className="text-center py-12 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-surface-50 border border-surface-100 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-surface-300" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-surface-500">Nenhum endereço cadastrado</p>
                          <p className="text-xs text-surface-400 mt-0.5">Adicione um endereço para continuar.</p>
                        </div>
                      </div>
                    ) : (
                      address.map((item, index) => (
                        <div
                          key={index}
                          className={`
                  relative rounded-xl border overflow-hidden bg-white
                  transition-shadow duration-200
                  hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]
                  ${item.standard
                              ? "border-brand-200"
                              : "border-surface-100"
                            }
                `}
                        >
                          {/* Barra topo — só no padrão */}
                          {item.standard && (
                            <div className="h-[2px] w-full bg-brand-400 opacity-60" />
                          )}

                          <div className="flex items-start gap-4 p-4">

                            {/* Ícone */}
                            <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                              <MapPin className="w-4 h-4 text-brand-400" />
                            </div>

                            {/* Dados */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="text-[11px] font-semibold text-surface-400 tracking-widest uppercase">
                                  Endereço #{index + 1}
                                </span>
                                {item.standard && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Padrão
                                  </span>
                                )}
                              </div>

                              <p className="text-[14px] font-semibold text-surface-900 truncate leading-snug">
                                {item.road}, {item.number}
                              </p>

                              <p className="text-[12px] text-surface-500 mt-0.5 truncate">
                                {item.neighborhood}
                                {item.referencePoint && (
                                  <span className="text-surface-400"> · {item.referencePoint}</span>
                                )}
                              </p>

                              {item.supplement && (
                                <p className="text-[11px] text-surface-400 mt-0.5">
                                  Complemento: {item.supplement}
                                </p>
                              )}

                              <p className="text-[11px] text-surface-400 mt-1.5 font-medium">
                                {item.city} · {item.state}
                              </p>
                            </div>

                            {/* Ações */}
                            <div className="flex flex-col gap-1.5 shrink-0">
                              <button
                                onClick={() => {
                                  Controller?.action.setAddrForm(item);
                                  Controller?.action.setcardAddendereco(true);
                                  Controller?.action.setIsEditeAddres(true);
                                }}
                                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-surface-600 bg-surface-50 hover:bg-surface-100 border border-surface-200 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5 text-surface-400" />
                                Editar
                              </button>

                              <button
                                onClick={() => {
                                  Controller?.action.setAddrForm(item);
                                  Controller?.action.setOpenDelete(true);
                                }}
                                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                Remover
                              </button>
                            </div>

                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* ── Formulário inline ── */}
                  {Controller?.result.cardAddendereco && (
                    <>
                      <div className="border-t border-surface-100 mx-6" />

                      <div className="px-6 py-5">
                        <p className="flex items-center gap-2 text-sm font-semibold text-surface-800 mb-5">
                          <div className="relative w-4 h-4 shrink-0">
                            <MapPin className="w-4 h-4 text-brand-500" />
                          </div>
                          {Controller.result.IsEditeAddres ? "Editar endereço" : "Novo endereço"}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                          {/* Rua — span full */}
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                              Rua / Avenida
                            </label>
                            <input
                              value={Controller?.result.addrForm.road || ""}
                              onChange={e => Controller?.action.setAddrForm(p => ({ ...p, road: e.target.value }))}
                              placeholder="Rua das Flores"
                              className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl bg-surface-50 focus:bg-white focus:border-brand-400 focus:outline-none transition-colors"
                            />
                          </div>

                          {fields.filter(f => f.key !== "road").map(f => (
                            <div key={f.key}>
                              <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                                {f.label}
                              </label>
                              <input
                                value={(Controller?.result.addrForm as any)[f.key]}
                                onChange={e => Controller?.action.setAddrForm(p => ({ ...p, [f.key]: e.target.value }))}
                                placeholder={f.placeholder}
                                className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-xl bg-surface-50 focus:bg-white focus:border-brand-400 focus:outline-none transition-colors"
                              />
                            </div>
                          ))}

                          {/* Toggle endereço padrão */}
                          <div className="sm:col-span-2 flex items-center justify-between gap-4 py-1">
                            <div>
                              <p className="text-sm font-medium text-surface-700">Endereço padrão</p>
                              <p className="text-xs text-surface-400 mt-0.5">Usar automaticamente nos pedidos</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => Controller?.action.setAddrForm(p => ({ ...p, standard: !p.standard }))}
                              className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 ${Controller?.result.addrForm.standard ? "bg-brand-500" : "bg-surface-200"
                                }`}
                              aria-label="Definir como padrão"
                            >
                              <span
                                className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${Controller?.result.addrForm.standard ? "translate-x-[18px]" : ""
                                  }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Ações do formulário */}
                        <div className="flex gap-2 mt-5">
                          {!Controller?.result.IsEditeAddres ? (
                            <button
                              onClick={async () => {
                                const result = await Controller?.action.SubmitAddres(Controller?.result.addrForm);
                                if (result) {
                                  Controller?.action.setAddrForm({
                                    road: "", number: 0, supplement: "", neighborhood: "",
                                    city: "", state: "", referencePoint: "", standard: false,
                                  });
                                  Controller?.action.setcardAddendereco(false);
                                }
                              }}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              Salvar endereço
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                const result = await Controller.action.UpdateAddress(Controller?.result.addrForm);
                                if (result) {
                                  Controller.action.setcardAddendereco(false);
                                  Controller.action.setIsEditeAddres(false);
                                }
                              }}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              Salvar alterações
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              Controller?.action.setAddrForm({
                                road: "", number: 0, supplement: "", neighborhood: "",
                                city: "", state: "", referencePoint: "", standard: false,
                              });
                              Controller.action.setcardAddendereco(false);
                              Controller.action.setIsEditeAddres(false);
                            }}
                            className="px-5 py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-600 text-sm font-semibold rounded-xl transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </>
                  )}

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
                    <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-all">Ativar</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl mt-3">
                    <div>
                      <p className="font-medium text-surface-800 text-sm">Sessões Ativas</p>
                      <p className="text-surface-400 text-xs mt-0.5">1 dispositivo conectado agora</p>
                    </div>
                    <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold rounded-xl transition-all">Revogar</button>
                  </div>
                </div>
              </div>
            )}
            {tab === 'settings' && (
              <div className="space-y-4">

                {/* Configurações Gerais */}
                <div className="bg-white rounded-2xl border border-surface-100 shadow-soft overflow-hidden">
                  <div className="flex items-center justify-between px-5 pt-4 pb-1">
                    <h2 className="font-display font-bold text-surface-900 text-lg">
                      Configurações
                    </h2>

                    <button
                      // onClick={saveSettings}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all bg-brand-500 hover:bg-brand-600 text-white"
                    >
                      <Check className="w-4 h-4" />
                      Salvar
                    </button>
                  </div>

                  <div className="p-5 space-y-6">

                    {/* Preferências */}
                    <div>
                      <h3 className="text-sm font-bold text-surface-800 mb-3">
                        Preferências
                      </h3>

                      <div className="space-y-3">

                        <label className="flex items-center justify-between p-3 rounded-xl border border-surface-100">
                          <div>
                            <p className="font-semibold text-sm">Receber notificações</p>
                            <p className="text-xs text-surface-400">
                              Receber avisos e atualizações
                            </p>
                          </div>

                          <input
                            type="checkbox"
                            checked={settings.notifications}
                            onChange={(e) =>
                              setSettings((s) => ({
                                ...s,
                                notifications: e.target.checked
                              }))
                            }
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 rounded-xl border border-surface-100">
                          <div>
                            <p className="font-semibold text-sm">Modo escuro</p>
                            <p className="text-xs text-surface-400">
                              Utilizar tema escuro
                            </p>
                          </div>

                          <input
                            type="checkbox"
                            checked={settings.darkMode}
                            onChange={(e) =>
                              setSettings((s) => ({
                                ...s,
                                darkMode: e.target.checked
                              }))
                            }
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 rounded-xl border border-surface-100">
                          <div>
                            <p className="font-semibold text-sm">Newsletter</p>
                            <p className="text-xs text-surface-400">
                              Receber novidades por email
                            </p>
                          </div>

                          <input
                            type="checkbox"
                            checked={settings.newsletter}
                            onChange={(e) =>
                              setSettings((s) => ({
                                ...s,
                                newsletter: e.target.checked
                              }))
                            }
                          />
                        </label>

                      </div>
                    </div>

                    {/* Cor do sistema */}
                    <div className="relative overflow-hidden rounded-3xl border border-surface-100 bg-gradient-to-br from-white via-surface-50 to-surface-100 p-6">

                      {/* Glow */}
                      <div
                        className="absolute -top-20 -right-20 w-52 h-52 rounded-full blur-3xl opacity-20"
                        style={{ backgroundColor: currentColor }}
                      />

                      <div className="relative">
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <h3 className="font-display font-bold text-surface-900 text-lg">
                              Personalização
                            </h3>

                            <p className="text-sm text-surface-400 mt-1">
                              Escolha a identidade visual da sua experiência.
                            </p>
                          </div>

                          <div
                            className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg"
                            style={{ backgroundColor: currentColor }}
                          >
                            Tema Ativo
                          </div>
                        </div>

                        {/* Preview */}
                        {/* Preview */}
                        <div className="mb-6 overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-lg">
                          <div
                            className="h-24 transition-all duration-300 flex items-center justify-center relative overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${currentColor}, ${currentColor}CC)`
                            }}
                          >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25),transparent_60%)]" />

                            <div className="relative text-center">
                              <h2 className="text-white font-black text-2xl tracking-wide drop-shadow-lg">
                                Mercado Caribas
                              </h2>

                              <p className="text-white/80 text-xs tracking-widest uppercase">
                                Preview do Tema
                              </p>
                            </div>
                          </div>

                          <div className="p-5 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-surface-900">
                                Tema Selecionado
                              </p>

                              <p className="text-xs text-surface-400 font-mono">
                                {settings.primaryColor}
                              </p>
                            </div>

                            <button
                              className="px-4 py-2 rounded-xl text-white font-semibold text-sm shadow-lg transition-transform hover:scale-105"
                              style={{ backgroundColor: currentColor }}
                            >
                              Comprar Agora
                            </button>
                          </div>
                        </div>

                        {/* Cores */}
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3">
                          {colors.map((color) => {
                            const selected = settings.primaryColor === color.value;

                            return (
                              <button
                                key={color.value}
                                onClick={() =>
                                  setSettings((s) => ({
                                    ...s,
                                    primaryColor: color.value,
                                  }))
                                }
                                className={`
          relative h-14 w-14 rounded-2xl
          transition-all duration-300
          hover:scale-110 hover:-translate-y-1
          shadow-md ${color.class}
          ${selected ? "scale-110 -translate-y-1 shadow-xl ring-2 ring-white" : ""}
        `}
                              >
                                {selected && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Check className="w-5 h-5 text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Indicador */}
                        <div className="mt-6 flex items-center gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur border border-surface-100">
                          <div
                            className="w-14 h-14 rounded-2xl shadow-lg"
                            style={{
                              background: `linear-gradient(135deg, ${currentColor}, ${currentColor}AA)`
                            }}
                          />

                          <div>
                            <p className="font-semibold text-surface-900">
                              Cor Selecionada
                            </p>

                            <p className="font-mono text-xs text-surface-500">
                              {currentColor}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Segurança */}
                    <div>
                      <h3 className="text-sm font-bold text-surface-800 mb-3">
                        Segurança
                      </h3>

                      <div className="space-y-2">
                        <button className="w-full text-left p-3 rounded-xl border border-surface-100 hover:bg-surface-50 transition-colors">
                          Alterar senha
                        </button>

                        <button className="w-full text-left p-3 rounded-xl border border-surface-100 hover:bg-surface-50 transition-colors">
                          Encerrar sessões ativas
                        </button>

                        <button className="w-full text-left p-3 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 transition-colors">
                          Excluir conta
                        </button>
                      </div>
                    </div>

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
                        <button onClick={() => setPrefs(prev => ({ ...prev, [p.key]: !(prev as any)[p.key] }))}>
                          {(prefs as any)[p.key]
                            ? <ToggleRight className="w-9 h-9 text-brand-500" />
                            : <ToggleLeft className="w-9 h-9 text-surface-300" />}
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
      <ConfirmPopup
        open={Controller?.result.openDelete || false}
        title="Remover Endereço"
        description="Deseja realmente remover este endereço?"
        confirmText="Remover"
        onCancel={() => { Controller?.action.setOpenDelete(false); }}
        onConfirm={async () => {
          Controller?.action.setOpenDelete(false);
          await Controller?.action.DeleteAddres(Controller.result.addrForm);
        }}
      />
      <Loading
        loading={Controller?.result?.LoadingProfile || false}
        message={Controller?.result.LoadingTitleMessage}
        subMessage={Controller?.result.LoadingMessage}
      />

      <AlertPopup
        open={Controller?.result.openAlert || false}
        title={Controller?.result.LoadingTitleMessage}
        description={Controller?.result.LoadingMessage}
        onClose={() => Controller?.action.setOpenAlert(false)}
      />
    </div>
  );
}
