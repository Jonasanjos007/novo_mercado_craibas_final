import { useEffect, useRef, useState } from 'react';
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
  X,
  CheckIcon,
  BadgePercent,
  ShoppingCart,

} from 'lucide-react';
import { Calendar, Hash } from 'lucide-react';
import { useStore } from '../context/store';
import { formatPrice, orderStatusLabels, orderStatusColors, orderStatusSteps } from '../utils';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import { Address } from '../models/Address';
import { userProfileController } from '../controller/userProfileController';
import Loading from '../components/Loading';
import ConfirmPopup from '../components/ConfirmPopup';
import { useNotification } from '../utils/NotificationCard';
import AlertPopup from '../components/AlertPopup';
import { UseUserStore } from '../store/UseUserStore';
import { UseAddressStore } from '../store/UseAddressStore';
import { UseRouteStore } from '../store/UseRouteStore';
import { colors, getColorConfig } from '../types/Colors';
import Headerpages from '../components/Headerpages';
import { UseOrderStore } from '../store/UseOrderStore';
import { Order } from '../models/OrderSave';
type ProfileTab = 'overview' | 'orders' | 'wishlist' | 'addresses' | 'security' | 'preferences' | 'settings';



export default function ProfilePage() {
  const Controller = userProfileController();
  const { orders } = UseOrderStore();
  console.log(orders, 'orders');
  const navigate = useNavigate();
  const { wishlist } = useStore();
  const { navigateTo } = UseRouteStore();
  // const address = UseAddressStore((state) => state.address);
  const { address } = UseAddressStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { updateUser, user, logout, NameColorGlobal, ColorGlobalTema, ColorGlobalHover, ColorGlobalText, ColorGlobalHoverText } = UseUserStore();
  const [tab, setTab] = useState<ProfileTab>('overview');
  const [editing, setEditing] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const notify = useNotification();
  const formRef = useRef<HTMLDivElement>(null);
  const [statusFilter, setStatusFilter] = useState("TODOS");

  const filteredOrders = statusFilter === "TODOS" ? orders : orders.filter(o => o.order_Status === statusFilter);
  const filters = [
    { label: "Todos", value: "TODOS" },
    { label: "Pendente", value: "PENDENTE" },
    { label: "Preparando", value: "PREPARANDO" },
    { label: "Confirmado", value: "CONFIRMADO" },
    { label: "Saiu p/ entrega", value: "SAIU_PARA_ENTREGA" },
    { label: "Entregue", value: "ENTREGUE" },
    { label: "Cancelado", value: "CANCELADO" },
  ];
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    newsletter: true,
    primaryColor: "#3b82f6",
  });
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
  const getTotalOriginalOrder = (idOrder: number) => {
    const order = orders.find(o => o.id_Order === idOrder);

    if (!order) return 0;

    return order.products.reduce((total, produto) => {
      return total + (Number(produto.origin_Price) * Number(produto.quantity));
    }, 0);
  };

  // const saveAddress = () => updateUser({ address: addrForm });



  const savePrefs = () => updateUser({ preferences: { ...prefs, language: 'pt-BR' } });

  const navTabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Meus Dados', icon: <User className="w-4 h-4" /> },
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
    { label: "Nome Completo", key: "name", placeholder: "João da Silva Souza" },
    { label: "Complemento", key: "supplement", placeholder: "Apto 101" },
    { label: "Bairro", key: "neighborhood", placeholder: "Centro" },
    { label: "Ponto de referência", key: "referencePoint", placeholder: "Próximo à padaria" },
    { label: "Cidade", key: "city", placeholder: "Campinas" },
    { label: "Estado", key: "state", placeholder: "SP" },

  ];

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 2) {
      return numbers ? `(${numbers}` : "";
    }

    if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }

    if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }

    // Depois de 11 números continua mostrando o restante
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };
  // const colors = [
  //   { value: "brand", class: "bg-brand-500", class_text: "text-brand-400", class_hover: "hover:bg-brand-600" },
  //   { value: "red", class: "bg-red-500", class_text: "text-red-500", class_hover: "hover:bg-red-600" },
  //   { value: "orange", class: "bg-orange-500", class_text: "text-orange-500", class_hover: "hover:bg-orange-600" },
  //   { value: "amber", class: "bg-amber-500", class_text: "text-amber-500", class_hover: "hover:bg-amber-600" },
  //   { value: "yellow", class: "bg-yellow-500", class_text: "text-yellow-500", class_hover: "hover:bg-yellow-600" },
  //   { value: "lime", class: "bg-lime-500", class_text: "text-lime-500", class_hover: "hover:bg-lime-600" },
  //   { value: "green", class: "bg-green-500", class_text: "text-green-500", class_hover: "hover:bg-green-600" },
  //   { value: "emerald", class: "bg-emerald-500", class_text: "text-emerald-500", class_hover: "hover:bg-emerald-600" },
  //   { value: "teal", class: "bg-teal-500", class_text: "text-teal-500", class_hover: "hover:bg-teal-600" },
  //   { value: "cyan", class: "bg-cyan-500", class_text: "text-cyan-500", class_hover: "hover:bg-cyan-600" },
  //   { value: "sky", class: "bg-sky-500", class_text: "text-sky-500", class_hover: "hover:bg-sky-600" },
  //   { value: "blue", class: "bg-blue-500", class_text: "text-blue-500", class_hover: "hover:bg-blue-600" },
  //   { value: "indigo", class: "bg-indigo-500", class_text: "text-indigo-500", class_hover: "hover:bg-indigo-600" },
  //   { value: "violet", class: "bg-violet-500", class_text: "text-violet-500", class_hover: "hover:bg-violet-600" },
  //   { value: "purple", class: "bg-purple-500", class_text: "text-purple-500", class_hover: "hover:bg-purple-600" },
  //   { value: "fuchsia", class: "bg-fuchsia-500", class_text: "text-fuchsia-500", class_hover: "hover:bg-fuchsia-600" },
  //   { value: "pink", class: "bg-pink-500", class_text: "text-pink-500", class_hover: "hover:bg-pink-600" },
  //   { value: "rose", class: "bg-rose-500", class_text: "text-rose-500", class_hover: "hover:bg-rose-600" },
  //   { value: "brown", class: "bg-stone-500", class_text: "text-stone-500", class_hover: "hover:bg-stone-600" },
  //   { value: "gray", class: "bg-gray-500", class_text: "text-gray-500", class_hover: "hover:bg-gray-600" },
  //   { value: "slate", class: "bg-slate-500", class_text: "text-slate-500", class_hover: "hover:bg-slate-600" },
  //   { value: "zinc", class: "bg-zinc-500", class_text: "text-zinc-500", class_hover: "hover:bg-zinc-600" },
  //   { value: "black", class: "bg-black", class_text: "text-black", class_hover: "hover:bg-zinc-900" },
  // ];

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
  const colorConfig = getColorConfig(NameColorGlobal);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <Headerpages title="Meu Perfil" showSecure={false} />
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
                    ? `${ColorGlobalTema} text-white`
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
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${ColorGlobalTema} hover:bg-brand-600 text-white`}
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
                    { icon: <Package className="w-5 h-5 text-blue-600" />, label: 'Total Pedidos', value: orders.length, bg: 'bg-blue-50' },
                    { icon: <Truck className="w-5 h-5 text-green-600" />, label: 'Entregues', value: orders.filter(o => o.order_Status === 'ENTREGUE').length, bg: 'bg-green-50' },
                    { icon: <Heart className="w-5 h-5 text-red-500" />, label: 'Favoritos', value: wishlist.length, bg: 'bg-red-50' },
                    { icon: <CreditCard className="w-5 h-5 text-brand-500" />, label: 'Nivel Compra', value: formatPrice(totalSpent), bg: 'bg-brand-50' },
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
                  const last = orders[0];
                  console.log(last.products);
                  return (
                    <div className="bg-white rounded-2xl border border-surface-100 shadow-soft overflow-hidden">
                      <div className="px-5 pt-4 pb-2 flex items-center gap-2 text-xs font-bold text-surface-500 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" /> Último pedido
                      </div>
                      <div className="px-4 pb-4 flex items-center gap-3">
                        {orders[0]?.products?.slice(0, 4).map((item, i) => (
                          <img
                            key={i}
                            src={`/Imagens/Produtos/${item.imagens?.[0]?.url_Imagem} ` || ""}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-surface-100"
                          />
                        ))}
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-bold text-surface-900 text-sm truncate">
                            {last.products[0]?.name}
                            {last.products.length > 1 && <span className="text-surface-400 font-normal"> +{last.products.length - 1} itens</span>}
                          </p>
                          <p className="text-surface-400 text-xs mt-0.5">
                            Pedido #{last.id_Order} · {new Date(last.insertDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${orderStatusColors[last.order_Status]}`}>
                            {orderStatusLabels[last.order_Status]}
                          </span>
                          <span className="font-display font-bold text-brand-500 text-sm">{formatPrice(last.total_Value_Order)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>
            )}


            {/* ── ORDERS ── */}


            {tab === 'orders' && (
              <div className="bg-white rounded-2xl border border-surface-100 shadow-soft overflow-hidden">

                {/* Header */}
                <div className="px-5 py-5 border-b border-surface-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-bold text-surface-900 text-lg">
                      Minhas Compras
                    </h2>
                    <p className="text-surface-400 text-sm">
                      {orders.length} pedidos realizados
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 px-5 pt-5">
                  {filters.map(filter => (
                    <button
                      key={filter.value}
                      onClick={() => setStatusFilter(filter.value)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all${statusFilter === filter.value
                        ? `${ColorGlobalTema}  shadow-lg`
                        : "bg-surface-100 text-surface-500 hover:bg-surface-200"
                        }
          `}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 px-4 py-4 sm:px-5">
                  {filteredOrders.map(order => {
                    const itemsCount = order.products.reduce((s, p) => s + p.quantity, 0);
                    const isPending = order.status_Pay === "PENDENTE";

                    return (
                      <div
                        key={order.id_Order}
                        className="group relative bg-white rounded-2xl border border-surface-100 hover:border-surface-200 hover:shadow-md transition-all px-4 py-4"
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorConfig.class} scale-y-0 group-hover:scale-y-100 transition-transform rounded-r-full`} />

                        {/* Topo: Pedido + Data + Status */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="min-w-0">
                            <h3 className="font-bold text-surface-900 text-sm break-all">
                              Pedido #{order.number_Order}
                            </h3>
                            <p className="text-xs text-surface-400 mt-1">
                              {new Date(order.insertDate).toLocaleDateString("pt-BR")} •{" "}
                              {itemsCount} {itemsCount === 1 ? "item" : "itens"}
                            </p>
                          </div>

                          <p className="font-bold text-lg text-surface-900 whitespace-nowrap shrink-0">
                            {formatPrice(order.total_Value_Order)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          {isPending && (
                            <span className="inline-flex px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                              Pagamento pendente
                            </span>
                          )}
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${orderStatusColors[order.order_Status]}`}
                          >
                            {orderStatusLabels[order.order_Status]}
                          </span>
                        </div>

                        {/* Embaixo: Foto + Ver detalhes */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex -space-x-2 shrink-0">
                            {order.products.slice(0, 3).map((item, i) => (
                              <img
                                key={i}
                                src={`/Imagens/Produtos/${item.imagens?.[0]?.url_Imagem}`}
                                className="w-14 h-14 rounded-xl border-2 border-white object-cover shadow"
                              />
                            ))}
                            {order.products.length > 3 && (
                              <div className="w-14 h-14 rounded-xl bg-surface-100 border-2 border-white flex items-center justify-center text-xs font-bold">
                                +{order.products.length - 3}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className={`${colorConfig.class_text} text-sm font-semibold flex items-center gap-1 shrink-0`}
                          >
                            Ver detalhes
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MODAL DE DETALHES DO PEDIDO */}
            {selectedOrder && (
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                onClick={() => setSelectedOrder(null)}
              >
                <div
                  className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header do modal */}
                  <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-surface-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-surface-900 text-lg">
                        Pedido #{selectedOrder.number_Order}
                      </h3>
                      <p className="text-xs text-surface-400 font-body">
                        {new Date(selectedOrder.insertDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="w-8 h-8 rounded-full bg-surface-100 hover:bg-surface-200 flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4 text-surface-500" />
                    </button>
                  </div>

                  <div className="p-5 space-y-5">

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${orderStatusColors[selectedOrder.order_Status]}`}
                      >
                        {orderStatusLabels[selectedOrder.order_Status]}
                      </span>
                      {selectedOrder.status_Pay === "PENDENTE" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pagamento pendente
                        </span>
                      )}
                    </div>

                    {/* Steps de progresso */}
                    {selectedOrder.order_Status !== "cancelado" && selectedOrder.status_Pay !== "PENDENTE" && (
                      <div className="px-1 py-3 bg-surface-50 rounded-2xl">
                        <div className="flex items-center justify-between relative px-3">
                          <div className="absolute left-0 right-0 h-0.5 bg-surface-200 top-3.5 mx-7" />
                          <div
                            className={`absolute left-7 h-0.5 bg-green-600 top-3.5 transition-all duration-500`}
                            style={{
                              width: `${(orderStatusSteps.indexOf(selectedOrder.order_Status) / (orderStatusSteps.length - 1)) * (100 - 14)}%`,
                            }}
                          />
                          {orderStatusSteps.map((s, i) => {
                            const done = i <= orderStatusSteps.indexOf(selectedOrder.order_Status);
                            return (
                              <div key={s} className="flex flex-col items-center gap-1 relative z-10">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-[9px] font-bold transition-all ${done ? `bg-green-600 border-transparent text-white` : "bg-white border-surface-200 text-surface-300"
                                    }`}
                                >
                                  {done ? "✓" : i + 1}
                                </div>
                                <span className={`text-[8px] font-body text-center max-w-[50px] leading-tight ${done ? "text-green-600" : "text-surface-300"}`}>
                                  {orderStatusLabels[s]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Informações gerais */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start gap-2 p-3 bg-surface-50 rounded-xl">
                        <Hash className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-surface-400 font-body">Nº do pedido</p>
                          <p className="text-sm font-bold text-surface-900">#{selectedOrder.number_Order}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-3 bg-surface-50 rounded-xl">
                        <Calendar className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-surface-400 font-body">Data do pedido</p>
                          <p className="text-sm font-bold text-surface-900">
                            {new Date(selectedOrder.insertDate).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      {selectedOrder.payment_terms && (
                        <div className="flex items-start gap-2 p-3 bg-surface-50 rounded-xl">
                          <CreditCard className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] text-surface-400 font-body">Pagamento</p>
                            <p className="text-sm font-bold text-surface-900">{selectedOrder.payment_terms}</p>
                          </div>
                        </div>
                      )}

                      {selectedOrder.discont > 0 && (
                        <div className="flex items-start gap-2 p-3 bg-surface-50 rounded-xl">
                          <BadgePercent className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] text-surface-400 font-body">Disconto</p>
                            <p className="text-sm font-bold text-surface-900">
                              {selectedOrder.discont.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </p>
                          </div>
                        </div>

                      )}
                    </div>

                    {/* Endereço */}
                    {selectedOrder.address && (
                      <div className="p-3 bg-surface-50 rounded-xl flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-surface-400 font-body">Endereço de entrega</p>
                          <p className="text-sm font-semibold text-surface-900">
                            {selectedOrder.address.road}, {selectedOrder.address.number}
                          </p>
                          <p className="text-xs text-surface-500">
                            {selectedOrder.address.neighborhood ? `${selectedOrder.address.neighborhood} · ` : ""}
                            {selectedOrder.address.city} - {selectedOrder.address.state}
                          </p>
                          {selectedOrder.address.number && (
                            <p className="text-xs text-surface-400">CEP: {selectedOrder.address.number}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Produtos */}
                    <div>
                      <h4 className="font-display font-bold text-surface-900 text-sm mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Itens do pedido
                      </h4>
                      <div className="space-y-2">
                        {selectedOrder.products.map((item, i) => (
                          <div
                            key={i}
                            onClick={() => navigate(`/product/${item.id}`)}
                            className="group flex gap-3 items-center p-3 rounded-xl cursor-pointer hover:bg-surface-50 transition-all"
                          >
                            <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                              <div className="flex items-center gap-1 rounded-full bg-white border border-surface-200 shadow-xl px-3 py-1">
                                <ShoppingCart className="w-3 h-3 text-green-600" />
                                <span className="text-xs font-semibold text-surface-800">
                                  Comprar novamente
                                </span>
                              </div>
                            </div>
                            <img
                              src={`/Imagens/Produtos/${item.imagens?.[0]?.url_Imagem}`}
                              className="w-12 h-12 rounded-lg object-cover shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold text-surface-800 line-clamp-1 ${ColorGlobalHoverText} transition-colors`}>
                                {item.name}
                              </p>

                              <p className="text-xs text-surface-400">
                                Qtd: {item.quantity} · {formatPrice(item.price_Unic)}
                              </p>
                            </div>

                            <p className="text-sm font-bold text-surface-900 shrink-0">
                              {formatPrice(item.price_Unic * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resumo de valores */}
                    <div className="mt-5 rounded-2xl border border-surface-200 bg-surface-50 p-5">

                      <h3 className="text-sm font-bold text-surface-900 mb-4">
                        Resumo do Pedido
                      </h3>

                      <div className="space-y-3">

                        {selectedOrder.discont > 0 && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-surface-500">
                                Valor dos produtos
                              </span>

                              <span className="font-semibold text-surface-900">
                                {formatPrice(getTotalOriginalOrder(selectedOrder.id_Order))}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm text-surface-500">
                                Desconto
                              </span>

                              <span className="font-bold text-green-600">
                                - {formatPrice(selectedOrder.discont)}
                              </span>
                            </div>
                          </>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-surface-500">
                            Frete
                          </span>

                          <span
                            className={`font-semibold ${selectedOrder.total_Value_Order === 0
                              ? "text-green-600"
                              : "text-surface-900"
                              }`}
                          >
                            {selectedOrder.total_Value_Order === 0
                              ? "Grátis"
                              : formatPrice(selectedOrder.total_Value_Order)}
                          </span>
                        </div>

                        <div className="border-t border-dashed border-surface-300 pt-4 mt-2">

                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-surface-900">
                              Total Pago
                            </span>

                            <span className={`text-2xl font-black ${colorConfig.class_text}`}>
                              {formatPrice(selectedOrder.total_Value_Order)}
                            </span>
                          </div>

                          {selectedOrder.discont > 0 && (
                            <div className="mt-3 rounded-xl bg-green-50 border border-green-200 px-3 py-2 flex items-center justify-between">
                              <span className="text-xs font-semibold text-green-700">
                                Você economizou
                              </span>

                              <span className="text-sm font-bold text-green-700">
                                {formatPrice(selectedOrder.discont)}
                              </span>
                            </div>
                          )}

                        </div>

                      </div>

                    </div>
                  </div>
                </div>
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
                  <div className="px-6 py-5">

                    {/* Linha superior */}
                    <div className="flex items-center justify-between gap-4">

                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                          <MapPin className={`w-4 h-4 ${ColorGlobalText}`} />
                        </div>

                        <span className="font-semibold text-surface-900 text-base sm:text-lg">
                          Meus endereços
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          Controller?.action.setAddrForm({
                            road: "",
                            number: 0,
                            supplement: "",
                            neighborhood: "",
                            city: "",
                            state: "",
                            referencePoint: "",
                            standard: false,
                            phone: "",
                            name: "",
                          });

                          Controller?.action.setIsEditeAddres(false);
                          Controller?.action.setcardAddendereco(true);

                          setTimeout(() => {
                            formRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }, 100);
                        }}
                        className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl ${ColorGlobalTema} ${ColorGlobalHover} text-white text-sm font-semibold transition-colors`}
                      >
                        <Plus className="w-4 h-4" />

                        {/* Mobile */}
                        <span className="sm:hidden">Novo</span>

                        {/* Desktop */}
                        <span className="hidden sm:inline">Novo endereço</span>
                      </button>

                    </div>

                    {/* Quantidade */}
                    <div className="ml-12">
                      <span className="text-sm text-surface-500">
                        {address?.length || 0}{" "}
                        {address?.length === 1 ? "endereço cadastrado" : "endereços cadastrados"}
                      </span>
                    </div>

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
                          key={item.id ?? index}
                          className="bg-white border-b border-surface-200 px-5 py-5 hover:bg-surface-50 transition-colors"
                        >
                          {/* Cabeçalho */}
                          <div className="flex flex-col sm:flex-row gap-4">

                            {/* Ícone */}
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: `${colorConfig.hex}12` }}
                            >
                              <MapPin
                                className="w-5 h-5"
                                style={{ color: colorConfig.hex }}
                              />
                            </div>

                            {/* Conteúdo */}
                            <div className="flex-1">

                              {/* Nome + Telefone */}
                              {/* Nome + Telefone */}
                              <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">

                                <h3 className="text-sm sm:text-lg font-semibold text-surface-900 truncate">
                                  {item.name ?? "Jonas José Dos Anjos"}
                                </h3>

                                <span className="text-surface-300 flex-shrink-0">|</span>

                                <span className="text-xs sm:text-base text-surface-600 flex-shrink-0">
                                  {item.phone ?? "(82) 99999-9999"}
                                </span>

                              </div>

                              {/* Rua */}
                              <p className="text-surface-700 mt-2">
                                {item.road}, {item.number}
                                {item.supplement && `, ${item.supplement}`}
                                {item.neighborhood && `, ${item.neighborhood}`}
                              </p>

                              {/* Cidade */}
                              <p className="text-surface-500 mt-1">
                                {item.city}, {item.state}
                              </p>

                              {/* Referência */}
                              {item.referencePoint && (
                                <p className="text-surface-400 text-sm mt-1">
                                  {item.referencePoint}
                                </p>
                              )}

                              {/* Badge */}
                              <div className="mt-4">
                                {item.standard ? (
                                  <span
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded border text-xs font-semibold"
                                    style={{
                                      color: colorConfig.hex,
                                      borderColor: `${colorConfig.hex}55`,
                                      background: `${colorConfig.hex}08`,
                                    }}
                                  >
                                    <CheckCircle2
                                      className="w-3 h-3"
                                      fill={colorConfig.hex}
                                    />
                                    Padrão
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded border border-surface-300 text-surface-500 text-xs">
                                    Endereço de entrega
                                  </span>
                                )}
                              </div>

                            </div>

                          </div>

                          {/* Botões */}
                          <div className="mt-5 flex flex-wrap gap-2">


                            <button
                              onClick={() => {
                                Controller?.action.setAddrForm(item);
                                Controller?.action.setcardAddendereco(true);
                                Controller?.action.setIsEditeAddres(true);

                                setTimeout(() => {
                                  formRef.current?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                }, 100);
                              }}

                              className="flex-1 min-w-[110px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 hover:bg-surface-100 text-surface-700 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                              Editar
                            </button>

                            <button
                              onClick={() => {
                                Controller?.action.setAddrForm(item);
                                Controller?.action.setOpenDelete(true);
                              }}
                              className="flex-1 min-w-[110px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </button>

                          </div>

                        </div>
                      ))
                    )}
                  </div>

                  {/* ── Formulário inline ── */}
                  {Controller?.result.cardAddendereco && (
                    <>
                      <div ref={formRef}>
                        <div className="border-t border-surface-100 mx-6" />

                        <div className="px-6 py-5">
                          <div className="flex items-center justify-between mb-5">

                            <div className="flex items-center gap-2">
                              <div className="relative w-4 h-4 shrink-0">
                                <MapPin className={`w-4 h-4 ${ColorGlobalText}`} />
                              </div>

                              <p className="text-sm font-semibold text-surface-800">
                                {Controller.result.IsEditeAddres
                                  ? "Editar endereço"
                                  : "Novo endereço"}
                              </p>
                            </div>

                            <button
                              onClick={() => Controller.action.setcardAddendereco(false)}
                              className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>

                          </div>
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
                            <div>
                              <label className="block text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                                Telefone
                              </label>

                              <input
                                value={formatPhone(Controller?.result.addrForm.phone ?? "")}
                                required
                                onChange={(e) =>
                                  Controller?.action.setAddrForm(p => ({
                                    ...p,
                                    phone: e.target.value.replace(/\D/g, "")
                                  }))
                                }
                                placeholder="(99) 99999-9999 "
                                maxLength={17}
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
                                className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 ${Controller?.result.addrForm.standard ? `${ColorGlobalTema} ${ColorGlobalHover}` : "bg-surface-200"
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
                                      city: "", state: "", referencePoint: "", standard: false, phone: '', name: ''
                                    });
                                    Controller?.action.setcardAddendereco(false);
                                  }
                                }}
                                className={`inline-flex items-center gap-2 px-5 py-2.5 ${ColorGlobalTema} ${ColorGlobalHover} text-white text-sm font-semibold rounded-xl transition-colors`}
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
                                className={`inline-flex items-center gap-2 px-5 py-2.5 ${ColorGlobalTema} ${ColorGlobalHover} text-white text-sm font-semibold rounded-xl transition-colors`}
                              >
                                <Check className="w-4 h-4" />
                                Editar alterações
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                Controller?.action.setAddrForm({
                                  road: "", number: 0, supplement: "", neighborhood: "",
                                  city: "", state: "", referencePoint: "", standard: false, phone: '', name: ''
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


                  </div>

                  <div className="p-5 space-y-6">


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
                                onClick={() => {
                                  setSettings((s) => ({
                                    ...s,
                                    primaryColor: color.value,
                                  }))
                                  Controller?.action.setNameColorGlobal(color.value);
                                }
                                }
                                className={`relative h-14 w-14 rounded-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-md ${color.class}${selected ? "scale-110 -translate-y-1 shadow-xl ring-2 ring-white" : ""}`}>
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
                    {Controller?.result.NameColorGlobal && (<button
                      onClick={() => Controller?.action.SaveCustomizeGlobal(Controller?.result.NameColorGlobal)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all bg-brand-500 hover:bg-brand-600 text-white"
                    >
                      <Check className="w-4 h-4" />
                      Salvar Tema
                    </button>)}

                    {/* Segurança */}
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
