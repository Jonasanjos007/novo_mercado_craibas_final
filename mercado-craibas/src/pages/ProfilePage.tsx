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
} from 'lucide-react';

import { useStore } from '../context/store';
import { formatPrice, orderStatusLabels, orderStatusColors } from '../utils';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import { Address } from '../models/Address';
import { userProfileController } from '../controller/userProfileController';
import Loading from '../components/Loading';

type ProfileTab = 'overview' | 'orders' | 'wishlist' | 'addresses' | 'security' | 'preferences';



export default function ProfilePage() {
  const Controller = userProfileController();
  const navigate = useNavigate();
  const { user, orders, wishlist, address, navigateTo, logout, updateUser } = useStore();
  const [tab, setTab] = useState<ProfileTab>('overview');
  const [editing, setEditing] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [cardAddendereco, setcardAddendereco] = useState(false);

  const [defaultAddress, setDefaultAddress] = useState(Number);

  console.log(user);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    // bio: user?.bio || '',
  });
  const [addrForm, setAddrForm] = useState<Address>(
    {
      road: '',
      number: 0,
      supplement: '',
      neighborhood: '',
      city: '',
      state: '',
      referencePoint: '',
      standard: false,
    });
  console.log("addrForm", addrForm);
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
    { id: 'orders', label: 'Pedidos', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'wishlist', label: 'Favoritos', icon: <Heart className="w-4 h-4" /> },
    { id: 'addresses', label: 'Endereços', icon: <MapPin className="w-4 h-4" /> },
    { id: 'security', label: 'Segurança', icon: <Shield className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferências', icon: <Bell className="w-4 h-4" /> },
  ];

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
              <div className="space-y-4">

                {tab === 'addresses' && (
                  <div className="space-y-5">

                    {/* Lista */}
                    <div className="bg-white rounded-3xl border border-surface-100 p-6 shadow-soft">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3">
                          <h2 className="font-display font-bold text-surface-900 text-lg flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-brand-500" />
                            Meus Endereços
                          </h2>

                          <span className="text-xs font-medium text-surface-400">
                            {address?.length || 0} endereços
                          </span>
                        </div>

                        <button
                          onClick={() => setcardAddendereco(true)}
                          className=" w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-all text-sm font-semibold"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar Novo Endereço
                        </button>
                      </div>

                      <div className="space-y-4">
                        {address?.map((item, index) => (
                          <div
                            key={index}
                            className="rounded-3xl border border-surface-100 bg-gradient-to-br from-white to-surface-50 p-5 transition-all hover:shadow-medium"
                          >
                            <div className="flex flex-col lg:flex-row gap-4">

                              {/* Dados */}
                              <div className="flex gap-4 flex-1">
                                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0">
                                  <MapPin className="w-5 h-5 text-brand-500" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="font-display font-bold text-surface-900">
                                      Endereço #{index + 1}
                                    </h3>

                                    {defaultAddress === index && (
                                      <span className="bg-brand-50 text-brand-600 text-[10px] font-bold px-2 py-1 rounded-full">
                                        Principal
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-surface-800 font-medium">
                                    {item.road}, {item.number}
                                  </p>

                                  <p className="text-surface-500 text-sm mt-1">
                                    {item.neighborhood}
                                    {item.referencePoint && ` • ${item.referencePoint}`}
                                  </p>

                                  {item.supplement && (
                                    <p className="text-surface-400 text-xs mt-1">
                                      Complemento: {item.supplement}
                                    </p>
                                  )}

                                  <p className="text-surface-400 text-sm mt-2">
                                    {item.city} / {item.state}
                                  </p>
                                </div>
                              </div>

                              {/* Ações */}
                              <div className="w-full lg:w-[260px] flex flex-col gap-2">

                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className=" flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 transition-all text-sm font-semibold"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Editar
                                </button>

                                <button
                                  className=" px-4 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all text-sm font-semibold"
                                >
                                  Remover
                                </button>
                                {item.standard && (
                                  <div className="mt-2 border-t border-surface-100 pt-3 flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-surface-800">
                                        Endereço padrão
                                      </p>

                                      <p className="text-xs text-surface-400">
                                        Usar automaticamente
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-600">
                                      <CheckCircle className="w-5 h-5" />
                                      <span className="text-sm font-medium">Padrão</span>
                                    </div>
                                  </div>
                                )}

                              </div>
                            </div>
                          </div>
                        ))}

                        {(!address || address.length === 0) && (
                          <div className="text-center py-10">
                            <MapPin className="w-10 h-10 text-surface-200 mx-auto mb-3" />
                            <p className="text-surface-400">
                              Nenhum endereço cadastrado
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {cardAddendereco && (
                  <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-soft">
                    <h2 className="font-display font-bold text-surface-900 text-lg mb-5 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-brand-500" /> Endereço de Entrega
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Rua / Avenida', key: 'road', span: 'md:col-span-2', placeholder: 'Rua das Flores' },
                        { label: 'Número', key: 'number', placeholder: '123' },
                        { label: 'Complemento', key: 'supplement', placeholder: 'Apto 101' },
                        { label: 'Bairro', key: 'neighborhood', placeholder: 'Centro' },
                        { label: 'Cidade', key: 'city', placeholder: 'Craibas' },
                        { label: 'Estado', key: 'state', placeholder: 'AL' },
                        { label: 'Ponto de Referência', key: 'referencePoint', placeholder: 'Perto da Padaria' },

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
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                          Endereço padrão?
                        </label>

                        <button
                          type="button"
                          onClick={() =>
                            setAddrForm(prev => ({
                              ...prev,
                              standard: !prev.standard
                            }))
                          }
                          className={` relative w-12 h-7 rounded-full transition-all duration-300 ${addrForm.standard
                            ? 'bg-brand-500'
                            : 'bg-surface-200'
                            }`}
                        >
                          <span
                            className={` absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${addrForm.standard
                              ? 'translate-x-5'
                              : ''
                              }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={async () => {
                          const result = await Controller?.action.SubmitAddres(addrForm);

                          if (result) {
                            setAddrForm({
                              road: '',
                              number: 0,
                              supplement: '',
                              neighborhood: '',
                              city: '',
                              state: '',
                              referencePoint: '',
                              standard: false,
                            });

                            setcardAddendereco(false);
                          }
                        }}
                        className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-brand"
                      >
                        <Check className="w-4 h-4" />
                        Salvar Endereço
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddrForm({
                            road: '',
                            number: 0,
                            supplement: '',
                            neighborhood: '',
                            city: '',
                            state: '',
                            referencePoint: '',
                            standard: false,
                          });

                          setcardAddendereco(false);
                        }}
                        className="px-6 py-2.5 bg-surface-200 hover:bg-surface-300 text-surface-700 font-bold text-sm rounded-xl transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

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
      <Loading
        loading={Controller?.result?.LoadingProfile || false}
        message={Controller?.result.LoadingTitleMessage}
        subMessage={Controller?.result.LoadingMessage}
      />
    </div>
  );
}
