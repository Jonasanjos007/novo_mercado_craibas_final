import { useEffect, useMemo, useRef, useState } from 'react';
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
  Sparkles,
  Tag,
  ShoppingCart,
  TicketPercent,
  Loader2,
  UserCheck,
  PackageCheck,

} from 'lucide-react';
import { Calendar, Hash } from 'lucide-react';
import { useStore } from '../context/store';
import { badgeColors, badgeLabels, formatPrice, orderStatusLabels, orderStatusColors, orderStatusSteps } from '../utils';
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
import { ProductSaveOrder } from '../models/Product';
import ProductReviewModal from '../components/ProductReviewModal';
import { useAuthStore } from '../context/AuthContext';
import { UseProductStore } from '../store/UseProductStore';
import ProductReviewDetailsModal from '../components/ProductReviewDetailsModal';
type ProfileTab = 'overview' | 'orders' | 'wishlist' | 'addresses' | 'security' | 'preferences' | 'settings';



export default function ProfilePage() {
  const Controller = userProfileController();
  const { orders, Category, LoadCategory } = UseOrderStore();
  const navigate = useNavigate();
  const { favorites, products, loadProducts, GetfavoriteAll, DeleteOneFavorite } = UseProductStore();
  const { wishlist } = useStore();
  const { navigateTo } = UseRouteStore();
  // const address = UseAddressStore((state) => state.address);
  const { address } = UseAddressStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ product: ProductSaveOrder; order: Order } | null>(null);
  const { updateUser, user, NameColorGlobal, ColorGlobalTema, ColorGlobalHover, ColorGlobalText, ColorGlobalHoverText } = UseUserStore();
  const logout = useAuthStore((state) => state.logout);
  const [tab, setTab] = useState<ProfileTab>('overview');
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const notify = useNotification();
  const formRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  console.log("User", user)
  const filteredOrders = statusFilter === "TODOS" ? orders : orders.filter(o => o.order_Status === statusFilter);
  const AddresStadand = address.filter(item => item.standard === true)[0];
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



  const [prefs, setPrefs] = useState({
    notifications: true,
    newsletter: false,
    darkMode: false,
  });

  const userOrders = orders.filter(o => o.id_Order === user?.id || true).slice(0, 10);
  const totalSpent = userOrders.reduce((s, o) => s + o.total_Value_Order, 0);


  const resetProfileForm = () => {
    Controller?.action.setForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || 0 });
    Controller?.action.setAvatarFile(null);
    setAvatarPreview(null);
  };

  const cancelProfileEditing = () => {
    resetProfileForm();
    setEditing(false);
  };

  // const saveProfile = async () => {
  //   const name = String(form.name).trim();
  //   const email = String(form.email).trim().toLowerCase();
  //   const phoneDigits = String(form.phone).replace(/\D/g, '');

  //   if (name.length < 3) {
  //     notify.warning('Nome inválido', 'Informe seu nome completo.');
  //     return;
  //   }
  //   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  //     notify.warning('E-mail inválido', 'Informe um endereço de e-mail válido.');
  //     return;
  //   }
  //   if (phoneDigits && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
  //     notify.warning('Telefone inválido', 'Informe um telefone com DDD.');
  //     return;
  //   }

  //   setSavingProfile(true);
  //   const result = await updateProfile(
  //     { name, email, phone: phoneDigits ? Number(phoneDigits) : 0 },
  //     avatarFile
  //   );
  //   setSavingProfile(false);

  //   if (!result.success) {
  //     notify.error('Erro ao atualizar', result.error?.error?.message || 'Não foi possível salvar seus dados.');
  //     return;
  //   }

  //   setForm({ name, email, phone: phoneDigits ? Number(phoneDigits) : 0 });
  //   setAvatarFile(null);
  //   setAvatarPreview(null);
  //   setEditing(false);
  //   notify.success('Perfil atualizado', 'Seus dados foram salvos com sucesso.');
  // };

  const selectProfilePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      notify.warning('Formato não permitido', 'Escolha uma imagem JPG, PNG ou WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify.warning('Imagem muito grande', 'A foto deve ter no máximo 5 MB.');
      return;
    }

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    Controller?.action.setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // const removeFavorite = async (productId?: number) => {
  //   if (!productId) return;
  //   setRemovingFavoriteId(productId);
  //   await DeleteOneFavorite(productId);
  //   setRemovingFavoriteId(null);
  // };
  const getTotalOriginalOrder = (idOrder: number) => {
    const order = orders.find(o => o.id_Order === idOrder);

    if (!order) return 0;

    return order.products.reduce((total, produto) => {
      return total + (Number(produto.origin_Price) * Number(produto.quantity));
    }, 0);
  };

  // const saveAddress = () => updateUser({ address: addrForm });



  // const savePrefs = () => updateUser({ preferences: { ...prefs, language: 'pt-BR' } });

  const navTabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Meus Dados', icon: <User className="w-4 h-4" /> },
    { id: 'orders', label: 'Minhas compras', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'wishlist', label: 'Favoritos', icon: <Heart className="w-4 h-4" /> },
    { id: 'addresses', label: 'Endereços', icon: <MapPin className="w-4 h-4" /> },
    // { id: 'security', label: 'Segurança', icon: <Shield className="w-4 h-4" /> },
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
  const favoriteProducts = useMemo(() => products.filter(product =>
    favorites.some(favorite => Number(favorite.id_Product) === Number(product.id))
  ), [products, favorites]);
  const favoriteCategories = useMemo(() => {
    const sections = Category
      .map(category => ({
        id: category.id,
        name: category.category,
        products: favoriteProducts.filter(product => Number(product.id_category) === Number(category.id)),
      }))
      .filter(section => section.products.length > 0);

    const categorizedIds = new Set(sections.flatMap(section => section.products.map(product => product.id)));
    const uncategorized = favoriteProducts.filter(product => !categorizedIds.has(product.id));
    if (uncategorized.length > 0) sections.push({ id: -1, name: 'Outros', products: uncategorized });
    return sections;
  }, [Category, favoriteProducts]);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    void GetfavoriteAll();
    if (products.length === 0) void loadProducts();
    if (Category.length === 0) void LoadCategory();
  }, [Category.length, GetfavoriteAll, LoadCategory, loadProducts, products.length]);

  useEffect(() => {
    if (!editing) resetProfileForm();
  }, [user?.name, user?.email, user?.phone]);

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

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
              wishlist={favorites}
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

                  {/* Foto de perfil centralizada, sem recortar a imagem */}
                  <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden bg-gradient-to-b from-surface-50 to-white px-5 py-8 sm:min-h-[320px]">
                    <div
                      className={`group relative h-48 w-48 overflow-hidden rounded-full border-4 border-white bg-surface-100 shadow-[0_14px_40px_rgba(15,23,42,0.16)] sm:h-60 sm:w-60 ${editing ? 'cursor-pointer ring-4 ring-brand-100' : 'cursor-zoom-in'}`}
                      onClick={() => editing ? avatarInputRef.current?.click() : setShowPhoto(true)}
                    >
                      <img
                        src={avatarPreview || `/Imagens/Usuarios/${user?.avatar}`}
                        alt="Foto de perfil"
                        className="h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]"
                      />

                      {editing && (
                        <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-black/10 pb-5 transition-colors group-hover:bg-black/20">
                          <span className="flex items-center gap-2 rounded-full border border-white/30 bg-black/60 px-3 py-2 text-[11px] font-bold text-white backdrop-blur-sm">
                            <Camera className="h-4 w-4" />
                            {Controller?.result.avatarFile ? 'Trocar novamente' : 'Escolher foto'}
                          </span>
                        </div>
                      )}
                    </div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onClick={event => event.stopPropagation()}
                      onChange={selectProfilePhoto}
                      className="sr-only"
                    />
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
                        src={avatarPreview || `/Imagens/Usuarios/${user?.avatar}`}
                        alt="Foto de perfil"
                        className="max-w-full max-h-[90vh] object-contain rounded-2xl"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-1">
                    <h2 className="font-display font-bold text-surface-900 text-lg">Informações Pessoais</h2>
                    <div className="flex items-center gap-2">
                      {editing && (
                        <button
                          type="button"
                          onClick={cancelProfileEditing}
                          disabled={Controller?.result.LoadingProfile}
                          className="flex items-center gap-2 rounded-xl border border-surface-200 px-3 py-2 text-sm font-bold text-surface-500 transition-all hover:bg-surface-50 disabled:opacity-50 sm:px-4"
                        >
                          <X className="h-4 w-4" /> <span className="hidden sm:inline">Cancelar</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => editing ? Controller?.action.handleSaveProfile() : setEditing(true)}
                        disabled={Controller?.result.LoadingProfile}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${ColorGlobalTema} hover:bg-brand-600 text-white disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {Controller?.result.LoadingProfile ? (
                          <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Salvando...</>
                        ) : editing ? (
                          <><Check className="w-4 h-4" /> Salvar</>
                        ) : (
                          <><Edit3 className="w-4 h-4" /> Editar</>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="px-5 pt-4 pb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {[
                        {
                          label: 'Nome Completo',
                          key: 'name',
                          icon: <User className="w-4 h-4" />,
                          placeholder: 'Seu nome'
                        },
                        {
                          label: 'Telefone / WhatsApp',
                          key: 'phone',
                          icon: <Phone className="w-4 h-4" />,
                          placeholder: '(82) 9xxxx-xxxx'
                        },
                        {
                          label: 'Email',
                          key: 'email',
                          icon: <Mail className="w-4 h-4" />,
                          placeholder: 'seu@email.com'
                        },
                      ].map(f => {

                        const error = Controller?.result.profileErrors?.[f.key as keyof typeof Controller.result.profileErrors];
                        return (
                          <div key={f.key}>

                            <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              {f.icon}
                              {f.label}
                            </label>

                            {editing ? (
                              <>
                                <input
                                  value={(Controller?.result.form as any)[f.key] ?? ''}
                                  onChange={e => Controller?.action.setForm(prev => ({ ...prev, [f.key]: e.target.value, }))}
                                  type={f.key === 'email' ? 'email' : f.key === 'phone' ? 'tel' : 'text'}
                                  maxLength={f.key === 'phone' ? 15 : undefined}
                                  disabled={savingProfile}
                                  placeholder={f.placeholder}
                                  className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm font-body focus:outline-none transition-colors ${error
                                    ? 'border-red-400 focus:border-red-500'
                                    : 'border-surface-200 focus:border-brand-400'
                                    }`}
                                />

                                {/* ERRO DO CAMPO */}
                                {error && (
                                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                                    ⚠ {error}
                                  </p>
                                )}
                              </>
                            ) : (
                              <div className="px-4 py-2.5 bg-surface-50 rounded-xl text-sm font-body text-surface-700">

                                {(Controller?.result.form as any)[f.key] || (
                                  <span className="text-surface-300 italic">
                                    Não informado
                                  </span>
                                )}

                              </div>
                            )}

                          </div>
                        );
                      })}

                    </div>
                  </div>

                  {/* Info strip */}
                  <div className="border-t border-surface-100 grid grid-cols-2 md:grid-cols-3 divide-x divide-surface-100">
                    {[
                      { icon: <MapPin className="w-4 h-4 text-surface-300" />, label: 'Localização', value: AddresStadand ? `${AddresStadand.road ?? ''}${AddresStadand.number ? ` N°${AddresStadand.number}` : ''}` : 'Não informado' },
                      { icon: <Clock className="w-4 h-4 text-surface-300" />, label: 'Membro desde', value: user?.insert_Date ? new Date(user.insert_Date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', }) : '-' },
                      // { icon: <Star className="w-4 h-4 text-surface-300" />, label: 'Avaliações', value: 0 },
                      { icon: <TicketPercent className="w-4 h-4 text-surface-300" />, label: 'Cupons utilizados', value: `${orders?.filter(item => item.id_Cupom != null || 0).length ?? 0} Cupons` }
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
                        }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-5 px-4 py-4 sm:px-5">
                  {filteredOrders.map(order => {
                    const itemsCount = order.products.reduce(
                      (s, p) => s + p.quantity,
                      0
                    );

                    const statusIdx = orderStatusSteps.indexOf(order.order_Status);
                    const progress = statusIdx / (orderStatusSteps.length - 1);
                    const isPending = order.status_Pay === "PENDENTE";
                    const isDelivered = order.order_Status === "ENTREGUE";

                    return (
                      <div
                        key={order.id_Order}
                        className="group relative overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm transition-all duration-200 hover:border-surface-300 hover:shadow-md"
                      >
                        {/* Barra lateral */}
                        {/* Barra superior */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${order.order_Status === "ENTREGUE"
                            ? "bg-green-500"
                            : colorConfig.class
                            } scale-y-0 group-hover:scale-y-100 transition-transform rounded-r-full`}
                        />
                        <div
                          className={`absolute left-0 top-0 right-0 h-1 ${order.order_Status === "ENTREGUE"
                            ? "bg-green-500"
                            : colorConfig.class
                            }`}
                        />

                        <div className="px-4 py-4 sm:px-5">
                          {/* Pedido + data */}
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-surface-900">
                              Pedido #{order.number_Order}
                            </h3>

                            <span className="h-1 w-1 shrink-0 rounded-full bg-surface-300" />

                            <span className="text-[10px] font-medium text-surface-400 sm:text-[11px]">
                              {new Date(order.insertDate).toLocaleDateString("pt-BR")}
                            </span>
                          </div>

                          {/* Informações */}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {/* Quantidade */}
                            <span className="text-[10px] text-surface-400 sm:text-[11px]">
                              {itemsCount} {itemsCount === 1 ? "item" : "itens"}
                            </span>

                            <span className="h-1 w-1 rounded-full bg-surface-300" />

                            {/* Total */}
                            <span className="text-[10px] text-surface-400 sm:text-[11px]">
                              Total{" "}
                              <strong className="font-semibold text-surface-700">
                                {formatPrice(order.total_Value_Order)}
                              </strong>
                            </span>

                            <span className="h-1 w-1 rounded-full bg-surface-300" />

                            {/* Status */}
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-bold sm:text-[10px] ${orderStatusColors[order.order_Status]
                                }`}
                            >
                              {orderStatusLabels[order.order_Status]}
                            </span>

                            {/* Pagamento pendente */}
                            {isPending && (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-700 sm:text-[10px]">
                                <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-amber-500" />
                                Pagamento pendente
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="border-y border-surface-100 bg-surface-50/40">

                          {/* PAGAMENTO PENDENTE */}
                          {isPending ? (
                            <div className="border-b border-surface-100 bg-surface-50/40 px-5 py-4">
                              <div className="flex items-center gap-3">

                                {/* Ícone */}
                                <div className="relative shrink-0">
                                  <div className="absolute inset-0 rounded-xl bg-amber-400/20 animate-pulse" />

                                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200 bg-white">
                                    <Clock className="h-4 w-4 text-amber-500" />
                                  </div>
                                </div>

                                {/* Texto */}
                                <div className="min-w-0 flex-1">

                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-surface-800">
                                      Aguardando pagamento
                                    </p>

                                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                                      Pendente
                                    </span>
                                  </div>

                                  <p className="mt-0.5 text-[10px] leading-relaxed text-surface-400">
                                    Após a confirmação, seu pedido seguirá automaticamente para preparação.
                                  </p>

                                </div>

                              </div>

                              {/* Indicador */}
                              <div className="mt-3">

                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[9px] font-medium text-surface-400">
                                    Processando pagamento
                                  </span>

                                  <span className="text-[9px] font-semibold text-amber-600">
                                    Aguardando
                                  </span>
                                </div>

                                <div className="relative h-1.5 overflow-hidden rounded-full bg-surface-200">

                                  {/* Base */}
                                  <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-amber-400" />

                                  {/* Shimmer */}
                                  <div className="absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-[shimmerSweep_1.6s_ease-in-out_infinite]" />

                                </div>

                              </div>
                            </div>
                          ) : order.order_Status === 'ENTREGUE' ? (
                            (() => {
                              const allEvaluated = order.products.every(p => p.evaluated);

                              return (
                                <div className="px-5 py-4 border-b border-surface-100 bg-surface-50/70">

                                  {/* Cabeçalho */}
                                  <div className="flex items-center gap-3">

                                    {/* Ícone */}
                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-white border border-green-200 shadow-sm flex items-center justify-center">
                                      <PackageCheck className="w-4.5 h-4.5 text-green-600" />
                                    </div>

                                    {/* Informações */}
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-xs sm:text-sm font-bold text-surface-800">
                                          Pedido entregue com sucesso
                                        </p>

                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-[9px] font-bold text-green-700">
                                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                          Concluído
                                        </span>
                                      </div>

                                      <p className="text-[10px] sm:text-[11px] text-surface-400 mt-1 leading-relaxed">
                                        {allEvaluated
                                          ? "Obrigado por avaliar os produtos deste pedido!"
                                          : "Conte para gente o que achou dos produtos."}
                                      </p>
                                    </div>

                                  </div>

                                  {/* Informações da entrega */}
                                  {(order.whoReceivedIt != null ||
                                    order.customerDeliveryDate != null) && (
                                      <div className="mt-4 pt-3 border-t border-surface-200/70">
                                        <div className="grid grid-cols-2">

                                          {/* Recebido por */}
                                          <div className="flex items-center gap-2 pr-4">
                                            <div className="w-7 h-7 rounded-lg bg-white border border-surface-200 flex items-center justify-center shrink-0">
                                              <UserCheck className="w-3.5 h-3.5 text-surface-400" />
                                            </div>

                                            <div className="min-w-0">
                                              <p className="text-[9px] text-surface-400 uppercase tracking-wide">
                                                Recebido por
                                              </p>

                                              <p className="text-[10px] sm:text-[11px] font-bold text-surface-700 truncate">
                                                {order.whoReceivedIt || "-"}
                                              </p>
                                            </div>
                                          </div>

                                          {/* Data da entrega */}
                                          <div className="flex items-center gap-2 pl-4 border-l border-surface-200">
                                            <div className="w-7 h-7 rounded-lg bg-white border border-surface-200 flex items-center justify-center shrink-0">
                                              <Calendar className="w-3.5 h-3.5 text-surface-400" />
                                            </div>

                                            <div className="min-w-0">
                                              <p className="text-[9px] text-surface-400 uppercase tracking-wide">
                                                Entregue em
                                              </p>

                                              {order.customerDeliveryDate ? (
                                                <p className="text-[10px] sm:text-[11px] font-bold text-surface-700 whitespace-nowrap">
                                                  {new Date(
                                                    order.customerDeliveryDate
                                                  ).toLocaleDateString("pt-BR", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                  })}{" "}
                                                  às{" "}
                                                  {new Date(
                                                    order.customerDeliveryDate
                                                  ).toLocaleTimeString("pt-BR", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                  })}
                                                </p>
                                              ) : (
                                                <p className="text-[10px] sm:text-[11px] font-bold text-surface-400">
                                                  -
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                </div>
                              );
                            })()

                          ) : (
                            <div className="px-5 py-4 bg-surface-50 border-b border-surface-100">
                              <div className="flex justify-between relative">
                                <div className="absolute left-7 right-7 top-3.5 h-1 bg-surface-200 rounded-full" />

                                <div
                                  className="absolute left-7 top-3.5 h-1.5 bg-green-600 rounded-full overflow-hidden transition-all progress-bar"
                                  style={{ '--progress': progress } as React.CSSProperties}
                                >
                                  <div className="shimmer-light" />
                                </div>

                                <style>{`.progress-bar {  width: calc(var(--progress) * 88%); } @media (min-width: 640px) {.progress-bar {width: calc(var(--progress) * 93%);} }
                              .shimmer-light {
                                position: absolute;
                                top: 0;
                                bottom: 0;
                                width: 40%;
                                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent);
                                animation: shimmerMove 1s ease-in-out infinite;
                              }
                              @keyframes shimmerMove {
                                0%   { left: -40%; }
                                100% { left: 100%; }
                              }
                            `}</style>

                                {orderStatusSteps.map((step, i) => {
                                  const done = i <= statusIdx;
                                  return (
                                    <div key={step} className="relative z-10 flex flex-col items-center">
                                      <div
                                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${done ? "bg-green-600 border-green-600 text-white" : "bg-white border-surface-300 text-surface-300"}`}
                                      >
                                        {done ? "✓" : i + 1}
                                      </div>
                                      <span className={`mt-1 text-[9px] text-center max-w-[-1px] ${done ? "text-green-600" : "text-surface-400"}`}>
                                        {orderStatusLabels[step]}
                                      </span>

                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                        </div>

                        <div className="space-y-2 p-4 sm:p-5">

                          {order.products.map((item, i) => {
                            const subtotal = item.price_Unic * item.quantity;
                            const isEvaluated = item.evaluated;
                            const isLoading = Controller?.result.Loading;

                            return (
                              <div
                                key={item.id ?? i}
                                className="group rounded-xl border border-surface-100 bg-white p-3 transition-all hover:border-surface-200 hover:bg-surface-50/50"
                              >
                                {/* Produto */}
                                <div className="flex gap-3">
                                  {/* Imagem */}
                                  <img
                                    src={`/Imagens/Produtos/${item.imagens?.[0]?.url_Imagem ?? ""}`}
                                    alt={item.name}
                                    className="h-14 w-14 shrink-0 rounded-xl border border-surface-100 bg-surface-50 object-cover sm:h-16 sm:w-16"
                                  />

                                  {/* Conteúdo */}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                      {/* Nome */}
                                      <p className="line-clamp-2 min-w-0 text-xs font-semibold leading-snug text-surface-800 sm:text-sm">
                                        {item.name}
                                      </p>

                                      {/* Subtotal */}
                                      <div className="shrink-0 text-right">
                                        <p className="text-[8px] font-semibold uppercase tracking-wide text-surface-400">
                                          Subtotal
                                        </p>

                                        <p className="mt-0.5 text-xs font-bold text-surface-900 sm:text-sm">
                                          {formatPrice(subtotal)}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Quantidade / Unitário */}
                                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-[10px] text-surface-400 sm:text-xs">
                                      <span>
                                        Qtd.{" "}
                                        <strong className="font-semibold text-surface-600">
                                          {item.quantity}
                                        </strong>
                                      </span>

                                      <span className="h-1 w-1 rounded-full bg-surface-300" />

                                      <span>
                                        Unit.{" "}
                                        <strong className="font-semibold text-surface-600">
                                          {formatPrice(item.price_Unic)}
                                        </strong>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Ações */}
                                {isDelivered && (
                                  <div className="mt-3 grid grid-cols-1 gap-2 border-t border-surface-100 pt-3 sm:flex sm:items-center sm:justify-between">

                                    {/* Comprar novamente */}
                                    <button
                                      onClick={() => navigate(`/product/${item.id}`)}
                                      type="button"
                                      className={`flex w-full items-center justify-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3 py-2.5 text-[10px] font-bold text-surface-600 transition-all hover:border-surface-300 hover:bg-surface-50 sm:w-auto sm:py-2 ${ColorGlobalHoverText}`}
                                    >
                                      <ShoppingCart className="h-3.5 w-3.5" />
                                      Comprar novamente
                                    </button>

                                    {/* Avaliação */}
                                    {!isEvaluated ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setReviewTarget({
                                            product: item,
                                            order,
                                          })
                                        }
                                        className={`flex w-full items-center justify-center gap-1.5 rounded-lg bg-surface-100 px-3 py-2.5 text-[10px] font-bold transition-colors hover:bg-surface-200 sm:w-auto sm:py-2 ${colorConfig.class_text}`}
                                      >
                                        <Star className="h-3.5 w-3.5" />
                                        Avaliar produto
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          Controller?.action.handleGetAssents(
                                            order.id_Order,
                                            item.id
                                          )
                                        }
                                        disabled={isLoading}
                                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-50 px-3 py-2.5 text-[10px] font-bold text-green-600 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-2"
                                      >
                                        {isLoading ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <>
                                            <Star className="h-3.5 w-3.5 fill-current" />
                                            Avaliado, obrigado!
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                        </div>

                        <div className="flex items-center justify-between border-t border-surface-100 bg-surface-50/40 px-4 py-3 sm:px-5">

                          <span className="text-[10px] text-surface-400 sm:text-xs">
                            {order.products.length}{" "}
                            {order.products.length === 1
                              ? "produto"
                              : "produtos"}
                          </span>

                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className={`${colorConfig.class_text} inline-flex items-center gap-1.5 rounded-xl border border-current/20 bg-current/5 px-3.5 py-2 text-xs font-semibold shadow-sm transition-all duration-200 hover:bg-current/10 hover:shadow-md active:scale-95 sm:text-sm`}
                          >
                            Ver detalhes
                            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
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
                      {selectedOrder.whoReceivedIt && (
                        <div className="flex items-start gap-2 p-3 bg-surface-50 rounded-xl">
                          <Calendar className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] text-surface-400 font-body">Recebida por</p>
                            <p className="text-sm font-bold text-surface-900">
                              {selectedOrder.whoReceivedIt}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedOrder.customerDeliveryDate && (
                        <div className="flex items-start gap-2 p-3 bg-surface-50 rounded-xl">
                          <Calendar className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] text-surface-400 font-body">Data de entrega</p>
                            <p className="text-sm font-bold text-surface-900">
                              {new Date(
                                selectedOrder.customerDeliveryDate
                              ).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}{" "}
                              às{" "}
                              {new Date(
                                selectedOrder.customerDeliveryDate
                              ).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
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
                            className="group relative rounded-xl border border-surface-100 bg-white p-3 transition-all hover:border-surface-200 hover:bg-surface-50/50"
                          >
                            {/* Produto */}
                            <div className="flex items-center gap-3">
                              {/* Imagem */}
                              <img
                                onClick={() => navigate(`/product/${item.id}`)}
                                src={`/Imagens/Produtos/${item.imagens?.[0]?.url_Imagem}`}
                                alt={item.name}
                                className="h-14 w-14 shrink-0 cursor-pointer rounded-xl object-cover border border-surface-100 transition-transform duration-200 group-hover:scale-[1.02]"
                              />

                              {/* Informações */}
                              <div className="min-w-0 flex-1">
                                <p
                                  className={`line-clamp-2 cursor-pointer text-sm font-semibold leading-snug text-surface-800 ${ColorGlobalHoverText} transition-colors`}
                                  onClick={() => navigate(`/product/${item.id}`)}
                                >
                                  {item.name}
                                </p>

                                <div className="mt-1 flex items-center gap-2 text-xs text-surface-400">
                                  <span>
                                    {item.quantity} {item.quantity === 1 ? "unidade" : "unidades"}
                                  </span>

                                  <span className="h-1 w-1 rounded-full bg-surface-300" />

                                  <span>{formatPrice(item.price_Unic)} cada</span>
                                </div>
                              </div>

                              {/* Total */}
                              <div className="shrink-0 text-right">
                                <p className="text-sm font-bold text-surface-900">
                                  {formatPrice(item.price_Unic * item.quantity)}
                                </p>
                              </div>
                            </div>

                            {/* Ações */}
                            <div className="mt-3 flex items-center justify-between border-t border-surface-100 pt-3">

                              {/* Comprar novamente */}
                              <button
                                type="button"
                                onClick={() => navigate(`/product/${item.id}`)}
                                className={`flex items-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3 py-2 text-[10px] font-bold text-surface-600 transition-all hover:border-surface-300 hover:bg-surface-50 ${ColorGlobalHoverText}`}
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                                Comprar novamente
                              </button>

                              {/* Avaliação */}
                              {selectedOrder.order_Status === "ENTREGUE" && (
                                <>
                                  {!item.evaluated ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setReviewTarget({
                                          product: item,
                                          order: selectedOrder,
                                        })
                                      }
                                      className={`flex items-center justify-center gap-1.5 rounded-lg bg-surface-100 px-3 py-2 text-[10px] font-bold transition-colors hover:bg-surface-200 ${colorConfig.class_text}`}
                                    >
                                      <Star className="h-3.5 w-3.5" />
                                      Avaliar produto
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        Controller?.action.handleGetAssents(
                                          selectedOrder.id_Order,
                                          item.id
                                        )
                                      }
                                      disabled={Controller?.result.Loading}
                                      className="flex items-center justify-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-[10px] font-bold text-green-600 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {Controller?.result.Loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <Star className="h-3.5 w-3.5 fill-current" />
                                          Avaliado, obrigado!
                                        </>
                                      )}
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
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
              <>
                {favoriteProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-24 text-center shadow-soft">
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50">
                      <Heart className="h-10 w-10 text-red-300" />
                    </div>
                    <h3 className="mb-2 font-display text-xl font-bold text-surface-700"
                    >Sua lista está vazia
                    </h3>
                    <p className="mb-6 text-sm text-surface-400">
                      Salve produtos que você gosta para comprar depois!
                    </p>
                    <button
                      onClick={() => navigate('/')}
                      className={`rounded-xl px-6 py-3 font-display text-sm font-bold text-white ${ColorGlobalTema} ${ColorGlobalHover}`}>
                      Explorar Produtos
                    </button>
                  </div>
                ) : (
                  <div className="space-y-7 sm:space-y-10">
                    {favoriteCategories.map(category => (
                      <section key={category.id}>
                        <div className="mb-3 flex items-center gap-2.5 sm:mb-4 sm:gap-3">
                          <div className={`h-8 w-1.5 rounded-full ${ColorGlobalTema}`} />
                          <div>
                            <h2 className="font-display text-base font-bold text-surface-900 sm:text-lg">
                              {category.name}
                            </h2>
                            <p className="text-xs text-surface-400">
                              {category.products.length} {category.products.length === 1 ? 'produto favorito' : 'produtos favoritos'}
                            </p>
                          </div>
                        </div>

                        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
                          {category.products.map(item => {
                            const disc = item.origin_Price
                              ? Math.round(
                                ((item.origin_Price - item.price_Unic) /
                                  item.origin_Price) *
                                100
                              )
                              : 0;

                            return (
                              <article
                                key={item.id}
                                className="group relative w-[60vw] min-w-[180px] max-w-[260px] shrink-0 snap-start overflow-hidden rounded-[20px] border border-white bg-white shadow-[0_6px_22px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(15,23,42,0.13)] sm:w-auto sm:max-w-none sm:min-w-0 sm:rounded-[24px]"
                              >

                                {/* IMAGEM */}
                                <button
                                  type="button"
                                  onClick={() => navigate(`/product/${item.id}`)}
                                  className="block w-full text-left"
                                >
                                  <div className="relative aspect-[1/1.03] overflow-hidden bg-gradient-to-br from-surface-50 via-white to-surface-100">

                                    <img
                                      src={`/Imagens/Produtos/${item.imagens?.[0]?.url_Imagem ?? ''}`}
                                      alt={item.name}
                                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                                      loading="lazy"
                                    />

                                    {/* BADGE */}
                                    {item.badge && (
                                      <span
                                        className={`absolute left-3 top-3 flex max-w-[65%] items-center gap-1 truncate rounded-full px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-lg sm:text-[10px] ${badgeColors[item.badge]}`}
                                      >
                                        <Sparkles className="h-3 w-3 shrink-0" />
                                        {badgeLabels[item.badge]}
                                      </span>
                                    )}

                                    {/* DESCONTO */}
                                    {disc > 0 && (
                                      <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-2.5 py-1.5 text-[10px] font-extrabold text-white shadow-lg">
                                        -{disc}%
                                      </span>
                                    )}
                                  </div>

                                  {/* INFORMAÇÕES */}
                                  <div className="relative p-3.5 sm:p-5">

                                    <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-600">
                                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50">
                                        <Check
                                          className="h-2.5 w-2.5"
                                          strokeWidth={3}
                                        />
                                      </span>

                                      Disponível para compra
                                    </div>

                                    <p className="mb-3 min-h-[44px] line-clamp-2 font-display text-sm font-semibold leading-[1.45] text-surface-800 sm:text-[15px]">
                                      {item.name}
                                    </p>

                                    {/* PREÇO */}
                                    <div className="flex min-h-[46px] items-end justify-between gap-2">
                                      <div>

                                        {item.origin_Price && (
                                          <p className="mb-0.5 text-[11px] text-surface-400 line-through">
                                            {formatPrice(item.origin_Price)}
                                          </p>
                                        )}

                                        <p className="font-display text-xl font-semibold leading-none tracking-tight text-surface-950 sm:text-2xl">
                                          {formatPrice(item.price_Unic)}
                                        </p>

                                      </div>

                                      {disc > 0 && (
                                        <span className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                                          <Tag className="h-3 w-3" />
                                          Economize
                                        </span>
                                      )}
                                    </div>

                                  </div>
                                </button>

                                {/* BOTÕES */}
                                <div className="flex gap-2 px-3 pb-3 sm:px-5 sm:pb-5">

                                  {/* COMPRAR */}
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/product/${item.id}`)}
                                    className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[11px] font-extrabold text-white transition-all active:scale-[0.98] sm:gap-2 sm:px-3 sm:py-3 sm:text-sm ${ColorGlobalTema} ${ColorGlobalHover}`}
                                  >
                                    <ShoppingCart className="h-3.5 w-3.5 shrink-0" />

                                    Comprar
                                  </button>

                                  {/* REMOVER */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      Controller?.action.removeFavorite(item.id)
                                    }
                                    disabled={
                                      Controller?.result.removingFavoriteId === item.id
                                    }
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-500 transition-all hover:border-rose-200 hover:bg-rose-100 disabled:opacity-60 sm:h-11 sm:w-11"
                                    aria-label={`Remover ${item.name} dos favoritos`}
                                  >
                                    {Controller?.result.removingFavoriteId === item.id ? (
                                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </button>

                                </div>

                                {/* RODAPÉ */}
                                <div className="flex items-center justify-center gap-1.5 border-t border-surface-100 px-4 py-3 text-[10px] font-medium text-surface-400">
                                  <Heart className="h-3 w-3 fill-rose-400 text-rose-400" />

                                  Produto salvo na sua lista
                                </div>

                              </article>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </>
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
                        <article
                          key={item.id ?? index}
                          className={`group relative overflow-hidden rounded-2xl border bg-white shadow-[0_6px_22px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-medium ${item.standard ? 'border-transparent' : 'border-surface-200'}`}
                          style={item.standard ? { boxShadow: `0 8px 28px ${colorConfig.hex}18`, borderColor: `${colorConfig.hex}35` } : undefined}
                        >
                          {item.standard && <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: colorConfig.hex }} />}
                          <div className="p-4 sm:p-5">
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
                          </div>
                          <div className="flex border-t border-surface-100 bg-surface-50/50">


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

                              className="flex flex-1 items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-surface-600 transition-colors hover:bg-white hover:text-surface-900"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Editar
                            </button>

                            <div className="w-px bg-surface-100" />
                            <button
                              onClick={() => {
                                Controller?.action.setAddrForm(item);
                                Controller?.action.setOpenDelete(true);
                              }}
                              className="flex flex-1 items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Excluir
                            </button>

                          </div>

                        </article>
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
            {/* {tab === 'security' && (
              <div className="space-y-4">


              </div>
            )} */}
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
                    <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-soft">
                      <h2 className="font-display font-bold text-surface-900 text-lg mb-5 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-brand-500" /> Alterar Senha
                      </h2>
                      <div className="space-y-4 max-w-md">

                        <div className="space-y-4 max-w-md">

                          <div>
                            <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                              Senha Atual
                            </label>

                            <input
                              type="password"
                              autoComplete="current-password"
                              value={Controller?.result.passwordForm.currentPassword}
                              onChange={e =>
                                Controller?.action.setPasswordForm(prev => ({
                                  ...prev,
                                  currentPassword: e.target.value
                                }))
                              }
                              className="w-full px-4 py-2.5 border-2 border-surface-200 rounded-xl text-sm font-body focus:border-brand-400 focus:outline-none transition-colors"
                            />
                            {Controller?.result.passwordErrors.currentPassword && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                ⚠ {Controller?.result.passwordErrors.currentPassword}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                              Nova Senha
                            </label>

                            <input
                              type="password"
                              autoComplete="new-password"
                              value={Controller?.result.passwordForm.newPassword}
                              onChange={e =>
                                Controller?.action.setPasswordForm(prev => ({
                                  ...prev,
                                  newPassword: e.target.value
                                }))
                              }
                              className="w-full px-4 py-2.5 border-2 border-surface-200 rounded-xl text-sm font-body focus:border-brand-400 focus:outline-none transition-colors"
                            />
                            {Controller?.result.passwordErrors.newPassword && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                ⚠ {Controller?.result.passwordErrors.newPassword}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                              Confirmar Nova Senha
                            </label>

                            <input
                              type="password"
                              autoComplete="new-password"
                              value={Controller?.result.passwordForm.confirmPassword}
                              onChange={e =>
                                Controller?.action.setPasswordForm(prev => ({
                                  ...prev,
                                  confirmPassword: e.target.value
                                }))
                              }
                              className="w-full px-4 py-2.5 border-2 border-surface-200 rounded-xl text-sm font-body focus:border-brand-400 focus:outline-none transition-colors"
                            />
                            {Controller?.result.passwordErrors.confirmPassword && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                ⚠ {Controller?.result.passwordErrors.confirmPassword}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => { Controller?.action.handleChangePassword() }}
                            disabled={Controller?.result.LoadingPassword}
                            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-brand flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />

                            {Controller?.result.LoadingPassword ? 'Atualizando...' : 'Atualizar Senha'}
                          </button>

                        </div>



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
                  <button className="mt-5 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-brand">
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
      <ProductReviewModal
        open={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        product={reviewTarget?.product || null}
        orderId={reviewTarget?.order.id_Order || 0}
        orderNumber={reviewTarget?.order.number_Order}
        themeClass={`${ColorGlobalTema} hover:opacity-90`}
      />

      <ProductReviewDetailsModal
        open={!!Controller?.result.reviewDetailsTarget}
        onClose={() => Controller?.action.setReviewDetailsTarget(false)}
        assessment={Controller?.result.assessmentResponse}
        onCloseEdite={() => Controller?.action.setReviewDetailsTarget(false)}
      />
    </div>

  );

}
