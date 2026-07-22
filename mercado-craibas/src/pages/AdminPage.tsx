import { useState, useRef, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, Package, ShoppingBag, Tag, Settings, LogOut,
  TrendingUp, TrendingDown, DollarSign, Bell, Search, Plus, Edit3,
  Trash2, Eye, X, Check, ChevronRight, BarChart2, ArrowUpRight,
  Zap, Shield, Store, User, Camera, Mail, Phone, MapPin,
  RefreshCw, AlertTriangle, Moon, Sun, ToggleLeft, ToggleRight, Menu,
  Truck,
  BadgeCheck,
  CheckCircle2,
  Clock,
  ImagePlus,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ChevronDown,
  CheckCircle,
  PauseCircle,
  LucideIcon
} from 'lucide-react';
import { useStore } from '../context/store';
import { formatPrice, orderStatusLabels, orderStatusColors, categoryLabels, badgeLabels, badgeLabel, cupomStatusLabels } from '../utils';
import { useAdminController } from '../controller/useAdminController';
import { UseOrderStore } from '../store/UseOrderStore';
import { UseOrderAdminStore } from '../storeAdmin/UseOrderAdminStore';
import Loading from '../components/AdminPageLoading';
import { UseUserStore } from '../store/UseUserStore';
import AdminPageLoading from '../components/AdminPageLoading';
import { GraficoMes } from '../components/GraficoMes';
import { GraficoDay } from '../components/GraficoDay';
import { GraficoMediaCIrcule } from '../components/GraficoMediaCIrcule';
import { UseProductStore } from '../store/UseProductStore';
import { Imagens_Products, Product, ProductAdmin, ProductVariation } from '../models/Product';
import { Promotion } from '../types';
import { UseProductAdminStore } from '../storeAdmin/UseProductAdminStore';
import ConfirmAdminPopup from '../components/ConfirmAdminPopup';
import { UseRouteStore } from '../store/UseRouteStore';
import { useNavigate } from 'react-router-dom';
import OrderQuickView from '../components/OrderQuickView';
import { Order } from '../models/OrderSave';
import { ProductQuickView } from '../components/ProductQuickView';
import { Cupom, CupomAdmin, DiscountType } from '../models/Cupom';
import { UseCupomAdminStore } from '../storeAdmin/UseCupomAdminStore';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'promotions' | 'profile' | 'settings';


type ApplicationScope = "store" | "categories" | "products";




export default function AdminPage() {

  const {
    darkMode, toggleDarkMode,
    deleteProduct, addProduct, updateProduct,
    applyPromoToProduct, showNotification
  } = useStore();
  const navigate = useNavigate();

  const Controller = useAdminController();
  const { ordersAdmin, logs, Category } = UseOrderAdminStore();
  const { user } = UseUserStore();
  const { products } = UseProductAdminStore();
  const { orders } = UseOrderStore();
  const { navigatePages, navigateTo } = UseRouteStore();
  const { cupom } = UseCupomAdminStore();

  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const [ProductCategoryFilter, setProductCategoryFilter] = useState('all');
  const [quickViewOrder, setQuickViewOrder] = useState<Order | null>(null);
  const [applicationScope, setApplicationScope] = useState<'store' | 'categories' | 'products'>('store');
  // const [editingCoupon, setEditingCoupon] = useState<Cupom | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<CupomAdmin | null>(null);
  const [cupomSearch, setCupomSearch] = useState("");
  const [cupomFilter, setCupomFilter] = useState<"all" | "active" | "paused" | "expired">("all");
  //popap delete cupom confirm
  const [idCupom, setIdCupom] = useState(Number);



  // categories: assumido já existente no componente (ex: veio de fetch, igual "products").
  // Caso não exista ainda, declarar algo como:
  // const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);


  // ─── estado (perto dos outros estados do componente) ───
  useEffect(() => {
    if (!Controller?.result.editingCoupon) return;

    if ((Controller?.result.newCoupon.categoryIds?.length ?? 0) > 0) {
      setApplicationScope("categories");
    } else if ((Controller?.result.newCoupon.productIds?.length ?? 0) > 0) {
      setApplicationScope("products");
    } else {
      setApplicationScope("store");
    }

    const discountType = Controller.result.newCoupon.discount_Type;

    if (typeof discountType === "string") {
      Controller.action.setNewCoupon(prev => ({
        ...prev,
        discount_Type: DiscountType[discountType as keyof typeof DiscountType]
      }));
    }

  }, [
    Controller?.result.editingCoupon,
  ]);
  // ─── computed: produtos filtrados pelo cupom selecionado ───
  const filteredPromotionProducts = useMemo(() => {

    // Nenhum cupom selecionado
    if (!selectedCoupon) {

      const productIds = new Set<number>();
      const categoryIds = new Set<number>();

      let hasGlobalCoupon = false;

      cupom.forEach(c => {

        const hasProducts = (c.productIds?.length ?? 0) > 0;
        const hasCategories = (c.categoryIds?.length ?? 0) > 0;

        // Cupom aplicado na loja inteira
        if (!hasProducts && !hasCategories) {
          hasGlobalCoupon = true;
          return;
        }

        c.productIds?.forEach(p =>
          productIds.add(p.id_Product)
        );

        c.categoryIds?.forEach(cat =>
          categoryIds.add(cat.id_Category)
        );
      });

      if (hasGlobalCoupon) {
        return products;
      }

      return products.filter(product =>
        productIds.has(product.id) ||
        categoryIds.has(product.id_category)
      );
    }

    // ----------------------------
    // Usuário clicou em Ver Produtos
    // ----------------------------

    const productIds = new Set(
      selectedCoupon.productIds?.map(x => x.id_Product) ?? []
    );

    const categoryIds = new Set(
      selectedCoupon.categoryIds?.map(x => x.id_Category) ?? []
    );

    if (productIds.size === 0 && categoryIds.size === 0) {
      return products;
    }

    return products.filter(product =>
      productIds.has(product.id) ||
      categoryIds.has(product.id_category)
    );

  }, [selectedCoupon, cupom, products]);


  const [quickViewProduct, setQuickViewProduct] = useState<ProductAdmin | null>(null);
  const [editingStatus, setEditingStatus] = useState<Record<number, string>>({});
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', bio: user?.name || '' });
  const [settingsForm, setSettingsForm] = useState({
    storeName: 'Mercado Craibas', slogan: 'O melhor marketplace de Craibas',
    primaryColor: '#2d14be', freeShippingAbove: '299', baseShipping: '19.90', deliveryDays: '3-5',
    twoFactor: false, sessionTimeout: '30',
  });

  // const blankProduct: Partial<Product> = {
  //   name: '', price: 0, originalPrice: undefined, category: 'eletronicos', stoke: 0,
  //   images: [],
  //   description: '', rating: 0, reviewCount: 0, sold: 0, freeShipping: false, variations: [], tags: [], featured: false,
  // };
  // const blankPromo: Partial<Promotion> = {
  //   title: '', description: '', discount: 10, code: '', minValue: 0,
  //   validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), active: true, productIds: [], type: 'percent',
  // };
  // const [newPromo, setNewPromo] = useState<Partial<Promotion>>(blankPromo);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingOrders = orders.filter(o => ['confirmado', 'preparando', 'saiu_entrega'].includes(o.order_Status)).length;
  const deliveredOrders = orders.filter(o => o.order_Status === 'ENTREGUE').length;
  const cancelledOrdersPerDay = orders.reduce((acc, order) => {
    if (order.order_Status !== 'CANCELADO') return acc;

    const day = new Date(order.insertDate || 0)
      .toISOString()
      .split('T')[0];

    acc[day] = (acc[day] || 0) + 1;

    return acc;
  }, {} as Record<string, number>);

  const cancelledOrders = orders.filter(
    order => order.order_Status === 'CANCELADO'
  );

  // AGRUPA E SOMA POR DATA
  const groupedCancelled = cancelledOrders.reduce((acc, order) => {
    const date = new Date(order.insertDate || order.insertDate);

    const key = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });

    acc[key] = (acc[key] || 0) + 1;

    return acc;
  }, {} as Record<string, number>);

  // PEGA MENOR E MAIOR DATA
  const allDates = cancelledOrders.map(
    o => new Date(o.insertDate || o.insertDate)
  );

  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

  // // MONTA TODOS OS DIAS ENTRE ELAS
  const cancelledlabels: string[] = [];
  const cancelledData: number[] = [];

  const current = new Date(minDate);

  while (current <= maxDate) {
    const key = current.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });

    cancelledlabels.push(key);

    // se não existir -> 0
    cancelledData.push(groupedCancelled[key] || 0);

    current.setDate(current.getDate() + 1);
  }


  const lowStock = products.filter(p => p.total_Stock < 0).length;

  const revenueData = [5200, 4100, 3800, 5200, 8800, 6100, Math.max(1000, Math.round(Controller?.result.totalRevenue || 0 / 10))];

  const revenueLabels = orders.map(item => {
    const date = new Date(item.insertDate ? item.insertDate : Date.now());

    const today = new Date();

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() + 1 &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return 'Hoje';
    }

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  });

  const ordersData = [8, 12, 10, 15, 13, 17, Math.max(1, orders.length)];
  const viewsData = [120, 180, 150, 220, 195, 260, 310];
  const orderDonut = [
    { value: 40, color: '#22c55e', label: 'Entregues' },
    { value: 20, color: '#f97316', label: 'Ativos' },
    { value: 10, color: '#ef4444', label: 'Cancelados' },
  ];
  // const catCounts = Object.entries(Category).map(([k, v]) => ({ name: v, count: products.filter(p => p.category === k).length, key: k }));

  const catCounts = Category.map(category => ({
    name: category.category,
    count: products.filter(p => p.id_category === category.id).length,
    key: category.id,
    count_Sold: products
      .filter(p => p.id_category === category.id)
      .reduce((total, product) => total + (product.count_Sold ?? 0), 0),
  }));
  console.log("catCounts", catCounts)
  const filteredProducts = products
    .filter(p =>
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    )
    .filter(
      p =>
        ProductCategoryFilter === "all" ||
        p.id_category === Number(ProductCategoryFilter)
    )
    .sort(
      (a, b) =>
        new Date(b.insertDate).getTime() - new Date(a.insertDate).getTime()
    );

  const filteredProductsCategory = products
    .filter(p =>
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    ).sort(
      (a, b) =>
        new Date(b.insertDate).getTime() - new Date(a.insertDate).getTime()
    );
  const filteredOrders = ordersAdmin.filter(o => {
    const ms = o.id_Order
      .toString()
      .includes(orderSearch);

    const mst =
      orderStatusFilter === "all" ||
      o.order_Status === orderStatusFilter;

    return ms && mst;
  });
  const filteredCupom = cupom.filter(c => {
    // Pesquisa pelo código do cupom
    const matchSearch =
      c.cod_Cupom
        ?.toLowerCase()
        .includes(cupomSearch.toLowerCase()) ?? false;

    // Está vencido?
    const expired =
      !!c.date_End &&
      new Date(c.date_End).getTime() < Date.now();

    // Status
    const matchStatus =
      cupomFilter === "all" ||

      (cupomFilter === "active" &&
        c.active &&
        !expired) ||

      (cupomFilter === "paused" &&
        !c.active &&
        !expired) ||

      (cupomFilter === "expired" &&
        expired);

    return matchSearch && matchStatus;
  });


  // const handleSavePromo = () => {
  //   const promo: Promotion = {
  //     ...blankPromo, ...newPromo,
  //     id: editingPromo ? editingPromo.id : `promo-${Date.now()}`,
  //     validUntil: newPromo.validUntil instanceof Date ? newPromo.validUntil : new Date(newPromo.validUntil as any),
  //   } as Promotion;
  //   if (editingPromo) { updatePromotion(promo); if (promo.productIds?.length) promo.productIds.forEach(pid => applyPromoToProduct(pid, promo.discount)); showNotification('Promoção atualizada!', 'success'); }
  //   else addPromotion(promo);
  //   Controller?.action.setShowCouponModal(false); setEditingCoupon(null); setNewPromo(blankPromo);
  // };

  // const openEditProduct = (p: Product) => { Controller?.action.setEditingProduct(p); Controller?.action.setNewProduct({ ...p }); Controller?.action.setShowProductModal(true); };
  // const openEditPromo = (pr: Promotion) => { setEditingCoupon(pr); setNewPromo({ ...pr }); Controller?.action.setShowCouponModal(true); };

  const dk = darkMode;
  const bg = dk ? 'bg-[#0a0a0f]' : 'bg-[#f0f0f5]';
  const sidebar = dk ? 'bg-[#0d0d14] border-white/[0.06]' : 'bg-white border-surface-200';
  const card = dk ? 'bg-[#0d0d14] border-white/[0.06]' : 'bg-white border-surface-200';
  const cardH = dk ? 'hover:border-white/[0.12]' : 'hover:border-brand-200';
  const topb = dk ? 'bg-[#0d0d14] border-white/[0.06]' : 'bg-white border-surface-200';
  const txt = dk ? 'text-white' : 'text-surface-900';
  const txt2 = dk ? 'text-white/60' : 'text-surface-500';
  const sub = dk ? 'text-white/35' : 'text-surface-400';
  const inp = dk ? 'bg-[#0a0a0f] border-white/[0.08] text-white placeholder:text-white/20 focus:border-brand-400' : 'bg-surface-50 border-surface-200 text-surface-800 focus:border-brand-400';
  const div_ = dk ? 'divide-white/[0.06]' : 'divide-surface-100';
  const bord = dk ? "border-white/10" : "border-black/20";
  const rowH = dk ? 'hover:bg-white/[0.02]' : 'hover:bg-surface-50';


  const options: { key: ApplicationScope; label: string }[] = [
    { key: "store", label: "Toda Loja" },
    { key: "categories", label: "Categorias" },
    { key: "products", label: "Produtos" },
  ];
  type CupomFilter = "all" | "active" | "paused" | "expired";

  const filtros: {
    v: CupomFilter;
    l: string;
    n: number;
    icon: LucideIcon;
  }[] = [
      {
        v: "all",
        l: "Todos",
        n: cupom.length,
        icon: ShoppingBag,
      },
      {
        v: "active",
        l: "Ativos",
        n: cupom.filter(c => c.active).length,
        icon: CheckCircle,
      },
      {
        v: "paused",
        l: "Pausados",
        n: cupom.filter(c => !c.active && c.date_End && new Date(c.date_End).getTime() >= Date.now()).length,
        icon: PauseCircle,
      },
      {
        v: "expired",
        l: "Vencidos",
        n: cupom.filter(c => c.date_End && new Date(c.date_End) < new Date()).length,
        icon: Clock,
      },
    ];
  const navGroups = [
    {
      label: 'Principal', items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'products', label: 'Produtos', icon: <Package className="w-4 h-4" />, badge: lowStock > 0 ? `${lowStock} baixo` : undefined, badgeRed: true },
        { id: 'orders', label: 'Pedidos', icon: <ShoppingBag className="w-4 h-4" />, badge: pendingOrders > 0 ? String(pendingOrders) : undefined, badgeRed: false },
        { id: 'promotions', label: 'Promoções', icon: <Tag className="w-4 h-4" /> },
      ]
    },
    {
      label: 'Conta', items: [
        { id: 'profile', label: 'Perfil', icon: <User className="w-4 h-4" /> },
        { id: 'settings', label: 'Configurações', icon: <Settings className="w-4 h-4" /> },
      ]
    },
  ];
  const SidebarContent = () => (
    <>
      <div className={`p-5 border-b ${bord} flex items-center gap-3 flex-shrink-0`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-brand flex-shrink-0">
          <Store className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className={`font-display font-bold text-sm leading-none truncate ${txt}`}>Mercado Craibas</p>
          <p className="text-brand-400 text-[10px] mt-0.5 font-semibold uppercase tracking-wide">Admin Panel</p>
        </div>
        <button onClick={() => setSidebarOpen(false)} className={`ml-auto md:hidden p-1 rounded-lg ${txt2}`}><X className="w-4 h-4" /></button>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className={`text-[10px] font-bold uppercase tracking-widest px-3 mb-1.5 ${sub}`}>{group.label}</p>
            {group.items.map((item: any) => (
              <button key={item.id}
                onClick={() => { setTab(item.id as AdminTab); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${tab === item.id ? 'bg-brand-500 text-white shadow-brand' : `${txt2} ${dk ? 'hover:bg-white/[0.06]' : 'hover:bg-surface-50'} hover:${txt}`
                  }`}
              >
                <span>{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tab === item.id ? 'bg-white/25 text-white' : item.badgeRed ? 'bg-red-500/15 text-red-400' : 'bg-brand-500/20 text-brand-400'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className={`p-3 border-t ${bord} space-y-1 flex-shrink-0`}>
        <button onClick={toggleDarkMode} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${txt2} ${dk ? 'hover:bg-white/[0.06]' : 'hover:bg-surface-50'}`}>
          {dk ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {dk ? 'Modo Claro' : 'Modo Escuro'}
        </button>
        <button onClick={() => { setSidebarOpen(false); navigate('/'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${txt2} ${dk ? 'hover:bg-white/[0.06]' : 'hover:bg-surface-50'}`}>
          <Store className="w-4 h-4" /> Ver Loja
        </button>
        <button onClick={() => { navigateTo('home'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-red-400 hover:bg-red-500/10">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </>
  );
  const orderFilters = [
    { label: 'Todos', value: 'all' },
    { label: 'Entregue', value: 'ENTREGUE' },
    { label: 'Saiu para Entrega', value: 'SAIU_PARA_ENTREGA' },
    { label: 'Preparando', value: 'PREPARANDO' },
    { label: 'Confirmado', value: 'CONFIRMADO' },
  ];
  const metrics = [
    {
      label: "Receita do Mês Atual",
      value: formatPrice(Controller?.result.totalRevenue ?? 0),
      icon: <DollarSign className="w-5 h-5" />,
      color: "#22c55e",
      change: Controller?.action.generateMonthlyRevenue()?.slice(-1)[0]?.percentage ? `${Controller?.action.generateMonthlyRevenue()?.slice(-1)[0]?.percentage > 0 ? '+' : ''}${Controller?.action.generateMonthlyRevenue()?.slice(-1)[0]?.percentage?.toFixed(1)}%` : '+0%',
      up: (Controller?.action.generateMonthlyRevenue()?.slice(-1)[0]?.percentage ?? 0) >= 0,
      data: Controller?.action.generateMonthlyRevenue()?.map(x => x.total) ?? [],
      labels: Controller?.action.generateMonthlyRevenue()?.map(x => x.month) ?? [],
      percentages: Controller?.action.generateMonthlyRevenue()?.map(x => x.percentage) ?? [],
      differences: Controller?.action.generateMonthlyRevenue()?.map(x => x.difference) ?? [],
      ValueR$_Number: true
    },
    {
      label: "Pedidos do Mês Atual",
      value: `${Controller?.result.currentMonthOrdersCount ?? 0} Pedidos`,
      icon: <ShoppingBag className="w-5 h-5" />,
      color: "#3b82f6",
      change: Controller?.action.generateMonthlyOrders()?.slice(-1)[0]?.percentage ? `${Controller?.action.generateMonthlyOrders()?.slice(-1)[0]?.percentage > 0 ? '+' : ''}${Controller?.action.generateMonthlyOrders()?.slice(-1)[0]?.percentage?.toFixed(1)}%` : '+0%',
      up: (Controller?.action.generateMonthlyOrders()?.slice(-1)[0]?.percentage ?? 0) >= 0,
      data: Controller?.action.generateMonthlyOrders()?.map(x => x.total) ?? [],
      labels: Controller?.action.generateMonthlyOrders()?.map(x => x.month) ?? [],
      percentages: Controller?.action.generateMonthlyOrders()?.map(x => x.percentage) ?? [],
      differences: Controller?.action.generateMonthlyOrders()?.map(x => x.difference) ?? [],
      ValueR$_Number: false
    },
    {
      label: "Pedidos Entregues",
      value: pendingOrders,
      icon: <Truck className="w-5 h-5" />,
      color: "#f59e0b",
      change: "-3.1%",
      up: false,
      data: viewsData,
      labels: revenueLabels,
      ValueR$_Number: false
    },
    {
      label: "Movimentação do Sistema Mês Atual",
      value: `${logs.filter(l => l.tipo == "Acesso" && l.nivel == "CLIENTE").length} Usuários`,
      icon: <Package className="w-5 h-5" />,
      color: "#a855f7",
      change: Controller?.action.generateMonthlyLogs()?.slice(-1)[0]?.percentage ? `${Controller?.action.generateMonthlyLogs()?.slice(-1)[0]?.percentage > 0 ? '+' : ''}${Controller?.action.generateMonthlyLogs()?.slice(-1)[0]?.percentage?.toFixed(1)}%` : '+0%',
      up: (Controller?.action.generateMonthlyLogs()?.slice(-1)[0]?.percentage ?? 0) >= 0,
      data: Controller?.action.generateMonthlyLogs()?.map(x => x.total) ?? [],
      labels: Controller?.action.generateMonthlyLogs()?.map(x => x.month) ?? [],
      percentages: Controller?.action.generateMonthlyLogs()?.map(x => x.percentage) ?? [],
      differences: Controller?.action.generateMonthlyLogs()?.map(x => x.difference) ?? [],
      ValueR$_Number: false

    }
  ];
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredOrdersStatus =
    (selectedStatus === 'all'
      ? ordersAdmin
      : ordersAdmin.filter(order => order.order_Status === selectedStatus)
    ).sort((a, b) =>
      new Date(b.insertDate).getTime() - new Date(a.insertDate).getTime()
    );
  console.log("filteredOrdersStatus", filteredOrdersStatus, ordersAdmin)
  return (
    <div className={`min-h-screen flex font-body ${bg}`}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex w-60 flex-col border-r ${sidebar} sticky top-0 h-screen`}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      <aside className={`fixed top-0 left-0 h-full w-72 flex flex-col border-r z-50 md:hidden transition-transform duration-300 ${sidebar} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className={`sticky top-0 z-30 border-b px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 ${topb}`}>
          {/* Hamburger — mobile only */}
          <button onClick={() => setSidebarOpen(true)} className={`md:hidden p-2 rounded-xl transition-all ${txt2} ${dk ? 'hover:bg-white/[0.08]' : 'hover:bg-surface-100'}`}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className={`font-display font-bold text-base md:text-lg truncate ${txt}`}>
              {navGroups.flatMap(g => g.items).find((n: any) => n.id === tab)?.label || 'Dashboard'}
            </h1>
            <p className={`text-xs mt-0.5 hidden sm:block ${sub}`}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          <button className={`relative p-2 rounded-xl transition-all ${txt2} ${dk ? 'hover:bg-white/[0.06]' : 'hover:bg-surface-50'}`}>
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button onClick={toggleDarkMode} className={`p-2 rounded-xl transition-all ${txt2} ${dk ? 'hover:bg-white/[0.06]' : 'hover:bg-surface-50'}`}>
            {dk ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* ─── DASHBOARD ─── */}
          {tab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                {metrics.map((m, index) => (
                  <div
                    key={index}
                    className={` relative overflow-hidden rounded-2xl sm:rounded-3xl border ${card} ${cardH} p-4 sm:p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
                    {/* Bolha decorativa */}
                    <div
                      className=" absolute -right-4 -top-10 sm:-right-10 sm:-top-10 md:-right-12 md:-top-12 w-28 h-28 sm:w-32 sm:h-32 md:w-30 md:h-30 lg:w-40 lg:h-36 rounded-full opacity-10"
                      style={{ background: m.color }}
                    />

                    {/* Header */}
                    <div className="relative flex justify-between items-start gap-2">
                      <div
                        className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shrink-0"
                        style={{
                          background: m.color,
                          boxShadow: `0 10px 25px ${m.color}55`,
                        }}
                      >
                        {m.icon}
                      </div>

                      <div
                        className={`flex items-center gap-1 text-xs sm:text-xs md:text-sm font-semibold whitespace-nowrap ${m.up ? "text-green-500" : "text-red-500"
                          }`}
                      >
                        {m.up ? (
                          <TrendingUp size={13} className="shrink-0" />
                        ) : (
                          <TrendingDown size={13} className="shrink-0" />
                        )}
                        {m.change}
                      </div>
                    </div>
                    {/* Valor */}
                    <h2 className={`mt-4 sm:mt-5 md:mt-6 text-2xl sm:text-2xl md:text-3xl font-bold ${txt} truncate`}>
                      {m.value}
                    </h2>
                    {/* Título */}
                    <p className={`mt-1 mb-4 text-xs sm:text-xs md:text-sm ${sub} truncate`}>
                      {m.label}
                    </p>

                    {/* Gráfico */}
                    <div className="mt-4 sm:mt-4 md:mt-5">
                      <GraficoMes data={m.data} labels={m.labels} percentages={m.percentages} differences={m.differences} color={m.color} darkMode={dk} ValueR$_Number={m.ValueR$_Number} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
                <div className={`lg:col-span-2 rounded-2xl border p-4 md:p-5 ${card}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`font-display font-bold text-sm ${txt}`}>Receita — Últimos 7 dias</h3>
                      <p className={`text-xs mt-0.5 ${sub}`}>Crescimento consistente</p>
                    </div>
                  </div>
                  <GraficoDay data={Controller?.action.generateLast7DaysOrders().map(item => ({ day: item.day, value: item.total })) ?? []} labels={revenueLabels} color="#f97316" darkMode={dk} valor={true} />
                </div>
                <div className={`rounded-2xl border p-4 md:p-5 ${card} flex flex-col`}>
                  <h3 className={`font-display font-bold text-sm ${txt} mb-4`}>Status dos Pedidos</h3>
                  <div className="flex items-center gap-3 flex-1">
                    <GraficoMediaCIrcule
                      segments={Controller?.action.generateCurrentMonthOrderDonut() ?? []}
                      dark={dk}
                    />
                    <div className="space-y-2 flex-1">
                      {Controller?.action.generateCurrentMonthOrderDonut().map((seg, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                          <span className={`text-xs flex-1 ${txt2}`}>{seg.label}</span>
                          <span className={`text-xs font-bold ${txt}`}>{seg.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
                {/* <div className={`rounded-2xl border p-4 md:p-5 ${card}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-display font-bold text-sm ${txt}`}>Pedidos por Dia</h3>
                    <span className="text-blue-400 text-xs font-bold">{orders.length} total</span>
                  </div>
                  <MiniBarChart data={ordersData} color="#3b82f6" />
                  <div className={`flex justify-between mt-2 text-[10px] ${sub}`}>
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => <span key={d}>{d}</span>)}
                  </div>
                </div> */}

                <div className={`rounded-2xl border p-4 md:p-5 ${card}`}>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`font-display font-bold text-sm ${txt}`}>Cancelados — Últimos 7 dias</h3>
                      <p className={`text-xs mt-0.5 ${sub}`}>Crescimento consistente</p>
                    </div>
                  </div>
                  <GraficoDay
                    data={Controller?.action.generateLast7DaysOrdersCancelado().map(item => ({ day: item.day, value: item.total })) ?? []}
                    labels={cancelledlabels}
                    color="#ef4444"
                    darkMode={dk}
                    valor={true}
                  />
                </div>

                <div className={`rounded-3xl border p-5 md:p-6 ${card} relative overflow-hidden`}>
                  {/* glow */}
                  <div className="absolute -top-16 -right-16 w-40 h-40 bg-brand-500/10 blur-3xl rounded-full" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6 gap-3">
                      <div>
                        <h3 className={`font-display font-bold text-base ${txt}`}>
                          Distribuição por Categoria
                        </h3>
                        <p className={`text-xs mt-1 ${sub}`}>
                          Vendas e catálogo organizados por categoria
                        </p>
                      </div>

                      <div
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold border whitespace-nowrap ${dk
                          ? 'bg-white/[0.04] border-white/[0.06] text-white/60'
                          : 'bg-surface-50 border-surface-200 text-surface-500'
                          }`}
                      >
                        {products.length} produtos
                      </div>
                    </div>

                    <div className="space-y-4">
                      {catCounts.map((c, i) => {
                        const totalSales = catCounts.reduce((s, cat) => s + (cat.count ?? 0), 0) || 1;

                        const salesPct = Math.round(((c.count ?? 0) / totalSales) * 100);
                        const productPct =
                          products.length > 0 ? Math.round((c.count / products.length) * 100) : 0;

                        const colors = ['#f97316', '#3b82f6', '#a855f7', '#ef4444'];

                        return (
                          <div
                            key={i}
                            className={`group rounded-2xl p-3 transition-all duration-300 ${dk ? 'hover:bg-white/[0.03]' : 'hover:bg-surface-50'
                              }`}
                          >
                            <div className="flex items-center justify-between mb-2 gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {/* bolinha */}
                                <div
                                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-lg"
                                  style={{
                                    background: colors[i],
                                    boxShadow: `0 0 12px ${colors[i]}70`,
                                  }}
                                />
                                <span className={`text-sm font-medium truncate ${txt}`}>
                                  {c.name}
                                </span>
                              </div>

                              <div className="text-right shrink-0">
                                <p className={`text-sm font-bold ${txt}`}>{salesPct}%</p>
                                <p className={`text-[11px] ${sub}`}>das vendas</p>
                              </div>
                            </div>

                            {/* barra (participação em vendas) */}
                            <div
                              className={`relative h-2.5 rounded-full overflow-hidden ${dk ? 'bg-white/[0.05]' : 'bg-surface-100'
                                }`}
                            >
                              <div
                                className="absolute inset-y-0 left-0 blur-md opacity-40"
                                style={{ width: `${salesPct}%`, background: colors[i] }}
                              />
                              <div
                                className="relative h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                  width: `${salesPct}%`,
                                  background: `linear-gradient(90deg, ${colors[i]}, ${colors[i]}cc)`,
                                }}
                              />
                              <div
                                className="absolute top-0 h-full opacity-30"
                                style={{
                                  width: `${salesPct}%`,
                                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.35), transparent)',
                                }}
                              />
                            </div>

                            {/* métricas: produtos e vendas */}
                            <div className="flex items-center gap-4 mt-2.5">
                              <div className="flex items-center gap-1.5">
                                <Package size={12} className={sub} />
                                <span className={`text-[11px] ${sub}`}>
                                  <span className={`font-semibold ${txt}`}>{c.count}</span> produtos ({productPct}%)
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <ShoppingBag size={12} className={sub} />
                                <span className={`text-[11px] ${sub}`}>
                                  <span className={`font-semibold ${txt}`}>
                                    {(c.count_Sold ?? 0).toLocaleString("pt-BR")}
                                  </span>{" "}
                                  vendas
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
                <div className={`rounded-3xl border overflow-hidden ${card} relative`}>
                  {/* glow */}
                  {/* filtros */}
                  <div className="flex flex-wrap gap-2 px-5 py-4">
                    {orderFilters.map(filter => {
                      const active = selectedStatus === filter.value;

                      return (
                        <button
                          key={filter.value}
                          onClick={() => setSelectedStatus(filter.value)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 border ${active
                            ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20'
                            : dk
                              ? 'bg-white/[0.03] border-white/[0.06] text-white/70 hover:bg-white/[0.06]'
                              : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-100'
                            }`}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="absolute -top-20 -right-20 w-48 h-48 bg-brand-500/10 blur-3xl rounded-full" />

                  <div className="relative z-10">
                    {/* header */}
                    <div className={`flex items-center justify-between px-5 py-4 border-b ${bord}`}>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center ${dk
                            ? 'bg-brand-500/10 border border-brand-500/20'
                            : 'bg-brand-50 border border-brand-100'
                            }`}
                        >
                          <ShoppingBag className="w-4 h-4 text-brand-400" />
                        </div>

                        <div>
                          <h3 className={`font-display font-bold text-base ${txt}`}>
                            Pedidos Recentes
                          </h3>

                          <p className={`text-xs mt-0.5 ${sub}`}>
                            Últimas movimentações da loja
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setTab('orders')}
                        className={`group flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${dk
                          ? 'hover:bg-white/[0.05]'
                          : 'hover:bg-surface-100'
                          }`}
                      >
                        <span className="text-brand-400 text-xs font-semibold">
                          Ver todos
                        </span>

                        <ArrowUpRight className="w-3.5 h-3.5 text-brand-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </button>
                    </div>

                    {/* lista */}
                    <div className={`divide-y ${div_}`}>
                      {filteredOrdersStatus.slice(0, 5).map(o => (

                        <div
                          key={o.id_Order}
                          className={`group flex items-center gap-4 px-5 py-4 transition-all duration-300 ${rowH}`}
                        >
                          {/* ícone */}
                          <div
                            className={`relative w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${dk
                              ? 'bg-white/[0.05] group-hover:bg-white/[0.08]'
                              : 'bg-surface-100 group-hover:bg-surface-200'
                              }`}
                          >
                            <div className="absolute inset-0 rounded-2xl bg-brand-500/0 group-hover:bg-brand-500/5 transition-all duration-300" />

                            <ShoppingBag className={`w-4 h-4 relative z-10 ${sub}`} />
                          </div>

                          {/* infos */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`text-sm font-bold ${txt}`}>
                                #{o.id_Order}
                              </p>

                              <span
                                className={`text-[10px] font-bold px-2 py-1 rounded-full border ${orderStatusColors[o.order_Status]}`}
                              >
                                {orderStatusLabels[o.order_Status]}
                              </span>
                            </div>

                            <p className={`text-xs ${sub}`}>
                              {o.quantity} itens •{' '}
                              {new Date(o.insertDate).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>

                          {/* valor */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-brand-400 text-sm font-bold">
                              {formatPrice(o.total_Value_Order)}
                            </p>

                            <p className={`text-[10px] mt-0.5 ${sub}`}>
                              Total do pedido
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={`rounded-3xl border overflow-hidden ${card} relative`}>
                  {/* glow */}
                  <div className="absolute -top-16 -right-16 w-40 h-40 bg-brand-500/10 blur-3xl rounded-full" />

                  <div className="relative z-10">
                    {/* header */}
                    <div className={`flex items-center justify-between px-4 md:px-5 py-4 border-b ${bord}`}>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center ${dk
                            ? 'bg-brand-500/10 border border-brand-500/20'
                            : 'bg-brand-50 border border-brand-100'
                            }`}
                        >
                          <BarChart2 className="w-4 h-4 text-brand-400" />
                        </div>

                        <div>
                          <h3 className={`font-display font-bold text-sm md:text-base ${txt}`}>
                            Top Produtos
                          </h3>

                          <p className={`text-[11px] md:text-xs mt-0.5 ${sub}`}>
                            Mais vendidos da loja
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setTab('products')}
                        className={`group flex items-center gap-1.5 px-2.5 py-2 rounded-xl transition-all duration-300 ${dk
                          ? 'hover:bg-white/[0.05]'
                          : 'hover:bg-surface-100'
                          }`}
                      >
                        <span className="text-brand-400 text-[11px] md:text-xs font-semibold">
                          Ver todos
                        </span>

                        <ArrowUpRight className="w-3.5 h-3.5 text-brand-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </button>
                    </div>

                    {/* lista */}
                    <div className="p-3 md:p-4 space-y-2.5">
                      {[...products]
                        .sort((a, b) => b.count_Sold - a.count_Sold)
                        .slice(0, 5)
                        .map((p, i) => {
                          const percent = Math.min(100, (p.count_Sold / 20000) * 100);

                          return (
                            <div
                              key={p.id}
                              className={`group flex items-center gap-3 rounded-2xl p-2.5 md:p-3 transition-all duration-300 ${dk
                                ? 'hover:bg-white/[0.03]'
                                : 'hover:bg-surface-50'
                                }`}
                            >
                              {/* rank */}
                              <div
                                className={`w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center text-[10px] md:text-xs font-black flex-shrink-0 ${i === 0
                                  ? 'bg-yellow-500/15 text-yellow-400'
                                  : i === 1
                                    ? 'bg-slate-400/15 text-slate-300'
                                    : i === 2
                                      ? 'bg-orange-700/15 text-orange-400'
                                      : dk
                                        ? 'bg-white/[0.05] text-white/70'
                                        : 'bg-surface-100 text-surface-600'
                                  }`}
                              >
                                #{i + 1}
                              </div>

                              {/* imagem */}
                              <img
                                src={`/Imagens/Produtos/${p.imagens[0].url_Imagem}`}
                                alt={p.name}
                                className={`w-11 h-11 md:w-12 md:h-12 rounded-xl object-cover border flex-shrink-0 ${dk
                                  ? 'border-white/10'
                                  : 'border-surface-200'
                                  }`}
                              />

                              {/* infos */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className={`text-xs md:text-sm font-bold truncate ${txt}`}>
                                      {p.name}
                                    </p>

                                    <p className={`text-[10px] md:text-[11px] ${sub}`}>
                                      {p.count_Sold.toLocaleString('pt-BR')} vendas
                                    </p>
                                  </div>

                                  <p className="text-brand-400 text-xs md:text-sm font-bold whitespace-nowrap">
                                    {formatPrice(p.price_Unic)}
                                  </p>
                                </div>

                                {/* barra */}
                                <div
                                  className={`mt-2 relative h-1.5 md:h-2 rounded-full overflow-hidden ${dk
                                    ? 'bg-white/[0.05]'
                                    : 'bg-surface-100'
                                    }`}
                                >
                                  <div
                                    className="absolute inset-y-0 left-0 blur-sm opacity-40 bg-brand-500"
                                    style={{ width: `${percent}%` }}
                                  />

                                  <div
                                    className="relative h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>

              {lowStock > 0 && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
                  <div className="flex-1">
                    <p className="text-red-400 font-bold text-sm">{lowStock} produto{lowStock > 1 ? 's' : ''} com estoque crítico (&lt;20 unid.)</p>
                    <p className="text-red-400/60 text-xs mt-0.5">Reposição necessária para evitar ruptura</p>
                  </div>
                  <button onClick={() => setTab('products')} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-bold transition-all flex-shrink-0">Ver</button>
                </div>
              )}
            </>
          )}

          {/* ─── PRODUCTS ─── */}
          {tab === 'products' && (
            <>
              {/* topo */}
              <div
                className={`relative overflow-hidden rounded-[28px] border backdrop-blur-2xl ${card} `}
              >
                {/* Glow */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute -top-24 right-0 w-72 h-72 bg-brand-500/10 blur-3xl rounded-full" />
                  <div className="absolute bottom-0 left-0 w-52 h-52 bg-blue-500/10 blur-3xl rounded-full" />
                </div>

                <div className="relative z-10 p-4 md:p-6">

                  {/* TOP */}
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                    {/* TITLE */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center shadow-lg shadow-brand-500/10 flex-shrink-0">
                          <Package className="w-5 h-5 text-brand-400" />
                        </div>

                        <div className="min-w-0">
                          <h2 className={`font-display font-black text-lg md:text-xl truncate ${txt}`}>
                            Produtos
                          </h2>

                          <p className={`text-xs md:text-sm mt-1 ${sub}`}>
                            Acompanhe Produtos ou adicione Novos produtos
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">

                      {/* SEARCH */}
                      <div className="relative flex-1 xl:w-[320px]">
                        <Search
                          className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`}
                        />

                        <input
                          value={productSearch}
                          onChange={e => setProductSearch(e.target.value)}
                          placeholder="Buscar produtos..."
                          className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm outline-none transition-all ${inp}`}
                        />
                      </div>

                      {/* SELECT */}
                      <select
                        value={ProductCategoryFilter}
                        onChange={e => setProductCategoryFilter(e.target.value)}
                        className={`w-full sm:w-[220px] h-12 px-4 rounded-2xl border text-sm outline-none transition-all backdrop-blur-xl ${inp} `}
                      >
                        <option value="all">Todas Categorias</option>

                        {Object.entries(Category).map(([k, v]) => (
                          <option key={k} value={v.id}>
                            {v.category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* FILTER CHIPS */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar mt-5 pb-1">

                    {[
                      {
                        Filtro: 'Todos',
                        Category: 'all',
                        Quantity: filteredProductsCategory.length,
                        icon: ShoppingBag,
                      },
                      ...Category.map(c => ({
                        Filtro: c.category.charAt(0).toUpperCase() + c.category.slice(1).toLowerCase(),
                        Category: c.id,
                        Quantity: filteredProductsCategory.filter(p => p.id_category === c.id).length,
                        icon: ShoppingBag,
                      })),

                    ].map(s => {
                      const active = ProductCategoryFilter === s.Category.toString();
                      const Icon = s.icon;

                      return (
                        <button
                          key={s.Filtro}
                          onClick={() => setProductCategoryFilter(s.Category.toString())}
                          className={`flex items-center gap-2 h-10 px-4 rounded-2xl whitespace-nowrap border transition-all duration-300 flex-shrink-0 ${active
                            ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                            : `${bord} ${txt2}
                        ${dk
                              ? 'bg-white/[0.04] hover:bg-white/[0.07]'
                              : 'bg-white hover:bg-surface-50'
                            }`
                            }`}
                        >
                          <Icon className="w-3.5 h-3.5" />

                          <span className="text-xs font-bold">
                            {s.Filtro}
                          </span>

                          <span
                            className={` px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white/20' : dk ? 'bg-white/10' : 'bg-surface-100'} `}
                          >
                            {s.Quantity}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                {/* busca */}
                <div className="relative flex-1">
                  <Search
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`}
                  />

                  <input
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Buscar produtos..."
                    className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm outline-none transition-all ${inp}`}
                  />
                </div>

                {/* botão */}
                <button
                  onClick={() => {
                    Controller?.action.setEditingProduct(null);
                    // setNewProduct(blankProduct);
                    Controller?.action.setShowProductModal(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-sm font-bold transition-all shadow-brand whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Novo Produto
                </button>
              </div>

              {/* tabela / cards */}
              <div className={`rounded-3xl border overflow-hidden ${card}`}>
                {/* desktop */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        className={`border-b last:border-0 ${bord} ${rowH} transition-colors`}
                      >
                        {[
                          'Produto',
                          'Categoria',
                          'Preço',
                          'Promoção',
                          'Estoque',
                          'Vendidos',
                          'Ativo',
                          'Ações'
                        ].map(h => (
                          <th
                            key={h}
                            className={`px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${sub}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredProducts.map(p => {
                        const hasPromo =
                          p.origin_Price && p.origin_Price > p.price_Unic;

                        const discPct = hasPromo
                          ? Math.round(
                            ((p.origin_Price! - p.price_Unic) /
                              p.origin_Price!) *
                            100
                          )
                          : 0;

                        return (
                          <tr
                            key={p.id}
                            className={`border-b last:border-0 ${bord} ${rowH} transition-colors`}
                          >
                            {/* produto */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3 min-w-[220px]">
                                <img
                                  src={`/Imagens/Produtos/${p.imagens[0].url_Imagem}`}
                                  alt=""
                                  className={`w-12 h-12 rounded-2xl object-cover border flex-shrink-0 ${dk
                                    ? 'border-white/10'
                                    : 'border-surface-200'
                                    }`}
                                />

                                <div className="min-w-0">
                                  <p
                                    className={`text-sm font-semibold truncate max-w-[180px] ${txt}`}
                                  >
                                    {p.name}
                                  </p>

                                  {p.badge && (
                                    <span className="text-[10px] font-bold text-brand-400">
                                      {badgeLabels[p.badge]}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* categoria */}
                            <td
                              className={`px-5 py-4 text-xs capitalize ${sub}`}
                            >
                              {Category.find(c => c.id === p.id_category)?.category || "Sem categoria"}
                            </td>

                            {/* preço */}
                            <td className="px-5 py-4">
                              <p className="text-brand-400 font-bold text-sm">
                                {formatPrice(p.price_Unic)}
                              </p>

                              {hasPromo && (
                                <p
                                  className={`text-[10px] line-through ${sub}`}
                                >
                                  {formatPrice(p.origin_Price!)}
                                </p>
                              )}
                            </td>

                            {/* promoção */}
                            <td className="px-5 py-4">
                              {hasPromo ? (
                                <div>
                                  <span className="bg-red-500/15 text-red-400 text-[10px] font-bold px-2 py-1 rounded-full">
                                    -{discPct}%
                                  </span>

                                  <p className={`text-[10px] mt-1 ${sub}`}>
                                    -
                                    {formatPrice(
                                      p.origin_Price! - p.price_Unic
                                    )}
                                  </p>
                                </div>
                              ) : (
                                <span className={`text-xs ${sub}`}>—</span>
                              )}
                            </td>

                            {/* estoque */}
                            <td className="px-5 py-4">
                              <span
                                className={`text-sm font-bold ${p.total_Stock < 20
                                  ? 'text-red-400'
                                  : p.total_Stock < 50
                                    ? 'text-amber-400'
                                    : 'text-green-400'
                                  }`}
                              >
                                {p.total_Stock}
                              </span>
                            </td>

                            {/* vendidos */}
                            <td
                              className={`px-5 py-4 text-sm font-medium ${txt}`}
                            >
                              {p.count_Sold.toLocaleString('pt-BR')}
                            </td>
                            <td
                              className={`px-5 py-4 text-sm font-medium ${txt}`}
                            >
                              {p.ativo ? "Sim" : "Não"}
                            </td>
                            {/* ações */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    setQuickViewProduct(p)
                                  }
                                  className={`p-2 rounded-xl transition-all ${txt2} hover:text-blue-400 ${dk
                                    ? 'hover:bg-blue-500/10'
                                    : 'hover:bg-blue-50'
                                    }`}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => {
                                    Controller?.action.setEditingProduct(p);
                                    Controller?.action.setNewProduct({ ...p });
                                    Controller?.action.setShowProductModal(true);
                                  }}
                                  className={`p-2 rounded-xl transition-all ${txt2} hover:text-brand-400 ${dk
                                    ? 'hover:bg-brand-500/10'
                                    : 'hover:bg-brand-50'
                                    }`}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => {
                                    Controller?.action.setNewProduct({ ...p });
                                    Controller?.action.SetTitleCOnfirm("Excluir Produto");
                                    Controller?.action.SetDescriptionConfirm("Tem certeza que deseja excluir este produto? Essa ação é permanente e não poderá ser desfeita.");
                                    Controller?.action.SetButtonConfirm("Exluir Produto");
                                    Controller?.action.setShowDeleteModal(true);
                                  }}
                                  className={`p-2 rounded-xl transition-all ${txt2} hover:text-red-400 ${dk
                                    ? 'hover:bg-red-500/10'
                                    : 'hover:bg-red-50'
                                    }`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* mobile */}
                <div
                  className={`lg:hidden ${dk ? "divide-y divide-white/10" : "divide-y divide-gray-300"
                    }`}
                >
                  {filteredProducts.map(p => {
                    const hasPromo =
                      p.origin_Price && p.origin_Price > p.price_Unic;

                    const discPct = hasPromo
                      ? Math.round(
                        ((p.origin_Price! - p.price_Unic) /
                          p.origin_Price!) *
                        100
                      )
                      : 0;

                    return (
                      <div
                        key={p.id}
                        className="p-4 space-y-3"
                      >
                        {/* topo */}
                        <div className="flex items-center gap-3">
                          <img
                            src={`/Imagens/Produtos/${p.imagens[0].url_Imagem}`}
                            alt=""
                            className={`w-14 h-14 rounded-2xl object-cover border ${dk
                              ? 'border-white/10'
                              : 'border-surface-200'
                              }`}
                          />

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-bold truncate ${txt}`}
                            >
                              {p.name}
                            </p>

                            <p
                              className={`text-xs capitalize mt-0.5 ${sub}`}
                            >
                              {Category.find(c => c.id === p.id_category)?.category ?? "Sem categoria"}
                            </p>

                            {p.badge && (
                              <span className="text-[10px] font-bold text-brand-400">
                                {badgeLabels[p.badge]}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* infos */}
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className={`text-[10px] uppercase ${sub}`}>
                              Preço
                            </p>

                            <p className="text-brand-400 font-bold text-sm">
                              {formatPrice(p.price_Unic)}
                            </p>
                          </div>

                          <div>
                            <p className={`text-[10px] uppercase ${sub}`}>
                              Estoque
                            </p>

                            <p
                              className={`text-sm font-bold ${p.total_Stock < 20
                                ? 'text-red-400'
                                : p.total_Stock < 50
                                  ? 'text-amber-400'
                                  : 'text-green-400'
                                }`}
                            >
                              {p.total_Stock}
                            </p>
                          </div>

                          <div>
                            <p className={`text-[10px] uppercase ${sub}`}>
                              Vendidos
                            </p>

                            <p className={`text-sm font-bold ${txt}`}>
                              {p.count_Sold.toLocaleString('pt-BR')}
                            </p>
                          </div>

                        </div>

                        {/* promoção */}
                        {/* Informações Extras */}
                        <div className="grid grid-cols-3 gap-3 min-h-[60px]">
                          <div>
                            <p className={`text-[10px] uppercase ${sub}`}>
                              Desconto
                            </p>

                            {hasPromo ? (
                              <div className="flex flex-col gap-1">
                                <span className="bg-red-500/15 text-red-400 text-[10px] font-bold px-2 py-1 rounded-full w-fit">
                                  -{discPct}%
                                </span>

                                <span className={`text-[11px] line-through ${sub}`}>
                                  {formatPrice(p.origin_Price!)}
                                </span>
                              </div>
                            ) : (
                              <span className={`text-xs ${sub}`}>—</span>
                            )}
                          </div>

                          <div>
                            <p className={`text-[10px] uppercase ${sub}`}>
                              Frete
                            </p>

                            <p
                              className={`text-sm font-bold ${p.freeShipping ? "text-green-500" : "text-red-500"
                                }`}
                            >
                              {p.freeShipping ? "Sim" : "Não"}
                            </p>
                          </div>

                          <div>
                            <p className={`text-[10px] uppercase ${sub}`}>
                              Ativo
                            </p>

                            <p
                              className={`text-sm font-bold ${p.ativo ? "text-green-500" : "text-red-500"
                                }`}
                            >
                              {p.ativo ? "Sim" : "Não"}
                            </p>
                          </div>
                        </div>

                        {/* ações */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() =>
                              setQuickViewProduct(p)
                            }
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${dk
                              ? 'bg-white/[0.04] hover:bg-white/[0.07]'
                              : 'bg-surface-100 hover:bg-surface-200'
                              }`}
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                            <span className={`text-xs font-medium ${txt}`}>
                              Ver
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              Controller?.action.setEditingProduct(p);
                              Controller?.action.setNewProduct({ ...p });
                              Controller?.action.setShowProductModal(true);
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${dk
                              ? 'bg-white/[0.04] hover:bg-white/[0.07]'
                              : 'bg-surface-100 hover:bg-surface-200'
                              }`}
                          >
                            <Edit3 className="w-4 h-4 text-brand-400" />
                            <span className={`text-xs font-medium ${txt}`}>
                              Editar
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              Controller?.action.setNewProduct({ ...p });
                              Controller?.action.SetTitleCOnfirm("Excluir Produto");
                              Controller?.action.SetDescriptionConfirm("Tem certeza que deseja excluir este produto? Essa ação é permanente e não poderá ser desfeita.");
                              Controller?.action.SetButtonConfirm("Exluir Produto");
                              Controller?.action.setShowDeleteModal(true);
                            }}
                            className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ─── ORDERS ─── */}
          {tab === 'orders' && (
            <div className="space-y-5 w-full overflow-hidden">

              {/* HERO / HEADER */}
              <div
                className={`relative overflow-hidden rounded-[28px] border backdrop-blur-2xl ${card} `}
              >
                {/* Glow */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute -top-24 right-0 w-72 h-72 bg-brand-500/10 blur-3xl rounded-full" />
                  <div className="absolute bottom-0 left-0 w-52 h-52 bg-blue-500/10 blur-3xl rounded-full" />
                </div>

                <div className="relative z-10 p-4 md:p-6">

                  {/* TOP */}
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                    {/* TITLE */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center shadow-lg shadow-brand-500/10 flex-shrink-0">
                          <ShoppingBag className="w-5 h-5 text-brand-400" />
                        </div>

                        <div className="min-w-0">
                          <h2 className={`font-display font-black text-lg md:text-xl truncate ${txt}`}>
                            Pedidos
                          </h2>

                          <p className={`text-xs md:text-sm mt-1 ${sub}`}>
                            Acompanhe pedidos e atualize status em tempo real
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">

                      {/* SEARCH */}
                      <div className="relative flex-1 xl:w-[320px]">
                        <Search
                          className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`}
                        />

                        <input
                          value={orderSearch}
                          onChange={e => setOrderSearch(e.target.value)}
                          placeholder="Buscar pedido..."
                          className={`w-full h-12 pl-11 pr-4 rounded-2xl border text-sm outline-none transition-all backdrop-blur-xl ${inp}`}
                        />
                      </div>

                      {/* SELECT */}
                      <select
                        value={orderStatusFilter}
                        onChange={e => setOrderStatusFilter(e.target.value)}
                        className={`w-full sm:w-[220px] h-12 px-4 rounded-2xl border text-sm outline-none transition-all backdrop-blur-xl ${inp} `}
                      >
                        <option value="all">Todos os status</option>

                        {Object.entries(orderStatusLabels).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* FILTER CHIPS */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar mt-5 pb-1">

                    {[
                      {
                        v: 'all',
                        l: 'Todos',
                        n: ordersAdmin.length,
                        icon: ShoppingBag,
                      },
                      {
                        v: 'PENDENTE',
                        l: 'Pendentes',
                        n: ordersAdmin.filter(o => o.order_Status === 'PENDENTE').length,
                        icon: Clock,
                      },
                      {
                        v: 'CONFIRMADO',
                        l: 'Confirmados',
                        n: ordersAdmin.filter(o => o.order_Status === 'CONFIRMADO').length,
                        icon: CheckCircle2,
                      },

                      {
                        v: 'PREPARANDO',
                        l: 'Preparando',
                        n: ordersAdmin.filter(o => o.order_Status === 'PREPARANDO').length,
                        icon: Package,
                      },
                      {
                        v: 'SAIU_PARA_ENTREGA',
                        l: 'Em rota',
                        n: ordersAdmin.filter(o => o.order_Status === 'SAIU_PARA_ENTREGA').length,
                        icon: Truck,
                      },
                      {
                        v: 'ENTREGUE',
                        l: 'Entregues',
                        n: ordersAdmin.filter(o => o.order_Status === 'ENTREGUE').length,
                        icon: BadgeCheck,
                      },
                    ].map(s => {
                      const active = orderStatusFilter === s.v;
                      const Icon = s.icon;

                      return (
                        <button
                          key={s.v}
                          onClick={() => setOrderStatusFilter(s.v)}
                          className={`flex items-center gap-2 h-10 px-4 rounded-2xl whitespace-nowrap border transition-all duration-300 flex-shrink-0 ${active
                            ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                            : `${bord} ${txt2}
                        ${dk
                              ? 'bg-white/[0.04] hover:bg-white/[0.07]'
                              : 'bg-white hover:bg-surface-50'
                            }`
                            }`}
                        >
                          <Icon className="w-3.5 h-3.5" />

                          <span className="text-xs font-bold">
                            {s.l}
                          </span>

                          <span
                            className={` px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white/20' : dk ? 'bg-white/10' : 'bg-surface-100'} `}
                          >
                            {s.n}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* DESKTOP TABLE */}
              <div className={`hidden lg:block rounded-[30px] border overflow-hidden backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] ${card}`}>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col className="w-[15%]" />
                      <col className="w-[27%]" />
                      <col className="w-[10%]" />
                      <col className="w-[14%]" />
                      <col className="w-[13%]" />
                      <col className="w-[14%]" />
                      <col className="w-[7%]" />
                    </colgroup>

                    <thead>
                      <tr className={`border-b last:border-0 ${bord} ${rowH} transition-colors`}>
                        {['Pedido', 'Itens', 'Valor', 'Status', 'Data', 'Atualizar', 'Visualizar'].map(h => (
                          <th key={h} className={`px-4 xl:px-6 py-5 text-left text-[10px] xl:text-[11px] font-black uppercase tracking-[0.14em] xl:tracking-[0.18em] ${sub}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredOrders.map((o, index) => (
                        <tr key={`${o.id_Order}-${index}`} className={`border-b last:border-none ${bord} transition-all duration-300 hover:bg-brand-500/[0.03]`}>

                          {/* PEDIDO */}
                          <td className="px-4 xl:px-6 py-5">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                                <ShoppingBag className="w-4 h-4 text-brand-400" />
                              </div>
                              <div className="min-w-0">
                                <p className={`font-black text-sm truncate ${txt}`}>#{o.number_Order}</p>
                                <p className={`text-[11px] mt-1 truncate ${sub}`}>
                                  {o.products.reduce((s, i) => s + i.quantity, 0)} itens
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* ITENS — resumo compacto */}
                          <td className="px-4 xl:px-6 py-5">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex items-center -space-x-2 flex-shrink-0">
                                {o.products.slice(0, 3).map((item, i) => (
                                  <img
                                    key={i}
                                    src={`/Imagens/Produtos/${item.imagens?.[0]?.url_Imagem}`}
                                    alt={item.name}
                                    className={`w-9 h-9 xl:w-10 xl:h-10 rounded-xl object-cover border-2 shadow-lg ${dk ? 'border-[#111]' : 'border-white'}`}
                                  />
                                ))}
                                {o.products.length > 3 && (
                                  <div className={`w-9 h-9 xl:w-10 xl:h-10 rounded-xl border-2 flex items-center justify-center text-[10px] font-black flex-shrink-0 ${dk ? 'border-[#111] bg-white/10 text-white/70' : 'border-white bg-surface-100 text-surface-600'}`}>
                                    +{o.products.length - 3}
                                  </div>
                                )}
                              </div>
                              <p className={`text-xs font-medium truncate ${dk ? 'text-white/70' : 'text-slate-600'}`}>
                                {o.products[0]?.name}
                                {o.products.length > 1 && <span className={sub}> e mais {o.products.length - 1}</span>}
                              </p>
                            </div>
                          </td>

                          {/* VALOR */}
                          <td className="px-4 xl:px-6 py-5">
                            <p className="text-brand-400 font-black text-sm whitespace-nowrap">
                              {formatPrice(o.total_Value_Order)}
                            </p>
                          </td>

                          {/* STATUS */}
                          <td className="px-4 xl:px-6 py-5">
                            <span className={`inline-flex items-center text-[10px] xl:text-[11px] font-black px-2.5 xl:px-3 py-1.5 rounded-full border whitespace-nowrap ${orderStatusColors[o.order_Status]}`}>
                              {orderStatusLabels[o.order_Status]}
                            </span>
                          </td>

                          {/* DATA */}
                          <td className={`px-4 xl:px-6 py-5 text-xs font-medium ${sub}`}>
                            {new Date(o.insertDate).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          {/* UPDATE */}
                          <td className="px-4 xl:px-6 py-5">
                            <div className="space-y-2">





                              {loadingOrderId === o.id_Order ? (
                                <div
                                  className={`w-full h-10 xl:h-8 px-5 xl:px-4 rounded-2xl border flex items-center justify-center ${inp}`}
                                >
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                </div>
                              ) : (
                                <select
                                  value={editingStatus[o.id_Order] ?? o.order_Status}
                                  onChange={(e) =>
                                    setEditingStatus((prev) => ({
                                      ...prev,
                                      [o.id_Order]: e.target.value,
                                    }))
                                  }
                                  className={`w-full h-10 xl:h-8 px-5 xl:px-4 rounded-2xl border text-[11px] xl:text-xs font-bold outline-none transition-all ${inp}`}
                                >
                                  {Object.entries(orderStatusLabels).map(([k, v]) => (
                                    <option key={k} value={k}>
                                      {v}
                                    </option>
                                  ))}
                                </select>
                              )}
                              {(editingStatus[o.id_Order] ?? o.order_Status) !== o.order_Status && (
                                <>
                                  <div
                                    className={`rounded-xl border p-3 ${dk
                                      ? "bg-amber-500/10 border-amber-500/20"
                                      : "bg-amber-50 border-amber-200"
                                      }`}
                                  >
                                    <p
                                      className={`text-xs ${dk ? "text-amber-300" : "text-amber-700"
                                        }`}
                                    >
                                      O cliente será notificado automaticamente sobre essa alteração de
                                      status.
                                    </p>
                                  </div>

                                  <div className="flex gap-2">

                                    <button
                                      onClick={() =>
                                        setEditingStatus((prev) => {
                                          const copy = { ...prev };
                                          delete copy[o.id_Order];
                                          return copy;
                                        })
                                      }
                                      className={`flex-1 h-9 rounded-xl text-xs font-bold ${dk
                                        ? "bg-white/5 hover:bg-white/10 text-white"
                                        : "bg-surface-100 hover:bg-surface-200 text-surface-700"
                                        }`}
                                    >
                                      Cancelar
                                    </button>

                                    <button
                                      onClick={async () => {
                                        setLoadingOrderId(o.id_Order);

                                        try {
                                          await Controller?.action.UpdateStatusOrder(
                                            o.id_Order,
                                            editingStatus[o.id_Order]
                                          );

                                          setEditingStatus((prev) => {
                                            const copy = { ...prev };
                                            delete copy[o.id_Order];
                                            return copy;
                                          });
                                        } finally {
                                          setLoadingOrderId(null);
                                        }
                                      }}
                                      className="flex-1 h-9 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold"
                                    >
                                      Confirmar
                                    </button>

                                  </div>
                                </>
                              )}

                            </div>
                          </td>

                          {/* AÇÕES */}
                          <td className="px-2 xl:px-4 py-5">
                            <button
                              onClick={() => setQuickViewOrder(o)}
                              className={`p-2 rounded-xl transition-all ${txt2} hover:text-blue-400 ${dk ? 'hover:bg-blue-500/10' : 'hover:bg-blue-50'}`}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>



              {/* MOBILE CARDS */}
              <div className="lg:hidden space-y-4">

                {filteredOrders.map((o, index) => (
                  <div key={`${o.id_Order}-${index}`} className={` relative overflow-hidden rounded-[32px] border backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-300 ${card}`} >

                    {/* glow effects */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500/10 blur-3xl rounded-full" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-400/5 blur-3xl rounded-full" />

                    <div className="relative z-10 p-5">

                      {/* TOP */}
                      <div className="flex items-start justify-between gap-4">

                        <div className="flex items-center gap-3 min-w-0">

                          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-5 h-5 text-brand-400" />
                          </div>

                          <div className="min-w-0">

                            <div className="flex items-center gap-2 flex-wrap">

                              <h3 className={`font-black text-sm ${txt}`}>
                                #{o.number_Order}
                              </h3>

                              <span className={` text-[10px] font-black px-3 py-1 rounded-full border whitespace-nowrap ${orderStatusColors[o.order_Status]}`} >
                                {orderStatusLabels[o.order_Status]}
                              </span>

                            </div>

                            <p className={`text-[11px] mt-1 ${sub}`}>
                              {new Date(o.insertDate).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>

                          </div>

                        </div>

                        {/* TOTAL */}
                        <div className="text-right">

                          <p className="text-brand-400 font-black text-lg leading-none">
                            {formatPrice(o.total_Value_Order)}
                          </p>

                          <p className={`text-[11px] mt-1 ${sub}`}>
                            {o.products.length} itens
                          </p>

                        </div>

                      </div>

                      {/* PRODUCTS */}
                      <div className="mt-5 space-y-3">

                        {o.products.map((item, i) => (

                          <div key={i}
                            className={` flex items-center gap-3 rounded-3xl border p-3 transition-all ${dk
                              ? 'border-white/10 bg-white/[0.04]'
                              : 'border-surface-200 bg-surface-50'
                              }`}
                          >

                            {/* image */}
                            <div className="relative flex-shrink-0">

                              <img
                                src={`/Imagens/Produtos/${item.imagens?.[0]?.url_Imagem}`}
                                alt=""
                                className="w-16 h-16 rounded-2xl object-cover"
                              />

                              <div className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                                {item.quantity}
                              </div>

                            </div>

                            {/* info */}
                            <div className="flex-1 min-w-0">

                              <div className="flex items-start justify-between gap-3">

                                <div className="min-w-0">

                                  <h4 className={`font-black text-sm leading-tight ${txt}`}>
                                    {item.name}
                                  </h4>

                                  <p className={`text-[11px] mt-1 ${sub}`}>
                                    {item.category}
                                  </p>

                                </div>

                                <div className="text-right flex-shrink-0">

                                  <p className="text-brand-400 font-black text-sm">
                                    {formatPrice(item.price_Unic)}
                                  </p>

                                  {item.origin_Price && (
                                    <p className={`text-[10px] line-through mt-1 ${sub}`}>
                                      {formatPrice(item.origin_Price)}
                                    </p>
                                  )}

                                </div>

                              </div>

                              {/* tags */}
                              <div className="flex items-center gap-2 mt-3 flex-wrap">

                                {item.freeShipping && (
                                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Frete grátis
                                  </span>
                                )}

                                {item.badge && (
                                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                                    {item.badge}
                                  </span>
                                )}

                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${dk
                                  ? 'bg-white/5 border-white/10 text-white/70'
                                  : 'bg-surface-100 border-surface-200 text-surface-700'
                                  }`}>
                                  ⭐ {item.Count_Rating}
                                </span>

                              </div>

                            </div>

                          </div>

                        ))}

                      </div>

                      {/* DELIVERY INFO */}
                      <div
                        className={`
        mt-5 rounded-3xl border p-4
        ${dk
                            ? 'border-white/10 bg-white/[0.03]'
                            : 'border-surface-200 bg-surface-50'
                          }
      `}
                      >

                        <div className="flex items-start gap-3">

                          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-brand-400" />
                          </div>

                          <div className="min-w-0 flex-1">

                            <h4 className={`text-xs font-black ${txt}`}>
                              Endereço de entrega
                            </h4>

                            <p className={`text-[11px] mt-2 leading-relaxed ${sub}`}>
                              {o.address.road}, {o.address.number}
                              {o.address.supplement && ` • ${o.address.supplement}`}
                              <br />
                              {o.address.neighborhood} — {o.address.city}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* PAYMENT + TRACK */}
                      <div className="grid grid-cols-2 gap-3 mt-4">

                        <div
                          className={`
          rounded-3xl border p-4
          ${dk
                              ? 'border-white/10 bg-white/[0.03]'
                              : 'border-surface-200 bg-surface-50'
                            }
        `}
                        >

                          <p className={`text-[10px] font-bold uppercase tracking-wider ${sub}`}>
                            Pagamento
                          </p>

                          <p className={`text-xs font-black mt-2 ${txt}`}>
                            {o.payment_terms}
                          </p>

                        </div>

                        <div
                          className={`
          rounded-3xl border p-4
          ${dk
                              ? 'border-white/10 bg-white/[0.03]'
                              : 'border-surface-200 bg-surface-50'
                            }
        `}
                        >

                          <p className={`text-[10px] font-bold uppercase tracking-wider ${sub}`}>
                            Rastreamento
                          </p>

                          <p className={`text-xs font-black mt-2 truncate ${txt}`}>
                            {o.number_Order}
                          </p>

                        </div>

                      </div>

                      {/* SELECT */}
                      {/* STATUS */}
                      <div className="mt-5 space-y-3">

                        <div className="flex items-center gap-3">

                          <button
                            onClick={() => setQuickViewOrder(o)}
                            className={`
        h-13 w-13 rounded-3xl
        flex items-center justify-center
        transition-all flex-shrink-0
        ${dk
                                ? "bg-white/[0.05] border border-white/10 hover:bg-white/[0.08]"
                                : "bg-surface-100 border border-surface-200 hover:bg-surface-200"
                              }
      `}
                          >
                            <Eye className="w-5 h-5 text-blue-400" />
                          </button>

                          {loadingOrderId === o.id_Order ? (
                            <div
                              className={`w-full h-10 xl:h-8 px-5 xl:px-4 rounded-2xl border flex items-center justify-center ${inp}`}
                            >
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                          ) : (
                            <select
                              value={editingStatus[o.id_Order] ?? o.order_Status}
                              onChange={(e) =>
                                setEditingStatus(prev => ({
                                  ...prev,
                                  [o.id_Order]: e.target.value,
                                }))
                              }
                              className={` flex-1 h-13 rounded-3xl px-5 border text-sm font-black outline-none transition-all ${inp}`}
                            >
                              {Object.entries(orderStatusLabels).map(([k, v]) => (
                                <option key={k} value={k}>
                                  {v}
                                </option>
                              ))}
                            </select>
                          )}

                        </div>
                        {(editingStatus[o.id_Order] ?? o.order_Status) !== o.order_Status && (
                          <>
                            <div
                              className={`rounded-3xl border p-4 ${dk
                                ? "bg-amber-500/10 border-amber-500/20"
                                : "bg-amber-50 border-amber-200"
                                }`}
                            >
                              <div className="flex items-start gap-3">

                                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                                  <Bell className="w-5 h-5 text-amber-400" />
                                </div>

                                <div>
                                  <p
                                    className={`text-sm font-bold ${dk ? "text-amber-300" : "text-amber-700"
                                      }`}
                                  >
                                    Confirmar alteração
                                  </p>

                                  <p
                                    className={`text-xs mt-1 ${dk ? "text-amber-200/80" : "text-amber-700"
                                      }`}
                                  >
                                    O cliente será notificado automaticamente sobre a alteração do
                                    status do pedido.
                                  </p>
                                </div>

                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">

                              <button
                                onClick={() =>
                                  setEditingStatus(prev => {
                                    const copy = { ...prev };
                                    delete copy[o.id_Order];
                                    return copy;
                                  })
                                }
                                className={`
            h-12 rounded-2xl font-bold transition-all
            ${dk
                                    ? "bg-white/[0.05] hover:bg-white/[0.08] text-white border border-white/10"
                                    : "bg-surface-100 hover:bg-surface-200 text-surface-700 border border-surface-200"
                                  }
          `}
                              >
                                Cancelar
                              </button>

                              <button
                                onClick={async () => {
                                  setLoadingOrderId(o.id_Order);

                                  try {
                                    await Controller?.action.UpdateStatusOrder(
                                      o.id_Order,
                                      editingStatus[o.id_Order]
                                    );

                                    setEditingStatus((prev) => {
                                      const copy = { ...prev };
                                      delete copy[o.id_Order];
                                      return copy;
                                    });
                                  } finally {
                                    setLoadingOrderId(null);
                                  }
                                }}
                                className="h-12 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-brand transition-all"
                              >
                                Confirmar
                              </button>


                            </div>
                          </>
                        )}
                        {/* AÇÕES */}
                        {/* AÇÕES */}

                      </div>

                    </div>
                  </div>
                ))}

              </div>
            </div>
          )}

          {/* ─── PROMOTIONS ─── */}
          {/* ─── PROMOTIONS ─── */}
          {tab === 'promotions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`font-display font-bold text-lg ${txt}`}>Promoções & Cupons</h2>
                  <p className={`text-xs mt-0.5 ${sub}`}>{cupom.filter(p => p.active).length} ativas</p>
                </div>
                <button
                  onClick={() => { Controller?.action.setEditingCoupon(false); Controller?.action.setShowCouponModal(true); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold transition-all shadow-brand"
                >
                  <Plus className="w-4 h-4" /> Nova Promoção
                </button>
              </div>
              <div
                className={`relative overflow-hidden rounded-[28px] border backdrop-blur-2xl ${card} `}
              >
                {/* Glow */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute -top-24 right-0 w-72 h-72 bg-brand-500/10 blur-3xl rounded-full" />
                  <div className="absolute bottom-0 left-0 w-52 h-52 bg-blue-500/10 blur-3xl rounded-full" />
                </div>

                <div className="relative z-10 p-4 md:p-6">

                  {/* TOP */}
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                    {/* TITLE */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center shadow-lg shadow-brand-500/10 flex-shrink-0">
                          <ShoppingBag className="w-5 h-5 text-brand-400" />
                        </div>

                        <div className="min-w-0">
                          <h2 className={`font-display font-black text-lg md:text-xl truncate ${txt}`}>
                            Cupons
                          </h2>

                          <p className={`text-xs md:text-sm mt-1 ${sub}`}>
                            Acompanhe os cupons de desconto onde ver os resultados e o uso com clientes
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">

                      {/* SEARCH */}
                      <div className="relative flex-1 xl:w-[320px]">
                        <Search
                          className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`}
                        />

                        <input
                          value={cupomSearch}
                          onChange={e => setCupomSearch(e.target.value)}
                          placeholder="Buscar código do cupom..."
                          className={`w-full h-12 pl-11 pr-4 rounded-2xl border text-sm outline-none transition-all backdrop-blur-xl ${inp}`}
                        />
                      </div>

                      {/* SELECT */}
                      <select
                        value={cupomFilter}
                        onChange={(e) =>
                          setCupomFilter(e.target.value as "all" | "active" | "paused" | "expired")}
                        className={`w-full sm:w-[220px] h-12 px-4 rounded-2xl border text-sm outline-none transition-all backdrop-blur-xl ${inp}`}
                      >
                        {Object.entries(cupomStatusLabels).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* FILTER CHIPS */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar mt-5 pb-1">

                    {filtros.map(s => {
                      const active = cupomFilter === s.v;
                      const Icon = s.icon;

                      return (
                        <button
                          key={s.v}
                          onClick={() => setCupomFilter(s.v)}
                          className={`flex items-center gap-2 h-10 px-4 rounded-2xl whitespace-nowrap border transition-all duration-300 flex-shrink-0 ${active
                            ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                            : `${bord} ${txt2}
                        ${dk
                              ? 'bg-white/[0.04] hover:bg-white/[0.07]'
                              : 'bg-white hover:bg-surface-50'
                            }`
                            }`}
                        >
                          <Icon className="w-3.5 h-3.5" />

                          <span className="text-xs font-bold">
                            {s.l}
                          </span>

                          <span
                            className={` px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white/20' : dk ? 'bg-white/10' : 'bg-surface-100'} `}
                          >
                            {s.n}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCupom.map(promo => {
                  const linked = products.filter(product =>
                    promo.productIds?.some(cp => cp.id_Product === product.id)
                  );
                  const palettes = [
                    { grad: 'linear-gradient(155deg,#0f172a 0%,#1e2a4a 55%,#2b1f52 100%)', ring: 'ring-1 ring-white/10' },
                    { grad: 'linear-gradient(155deg,#0c2b2e 0%,#0e3b3f 55%,#0f4f4a 100%)', ring: 'ring-1 ring-white/10' },
                    { grad: 'linear-gradient(155deg,#2a140c 0%,#3d1f10 55%,#5a2a12 100%)', ring: 'ring-1 ring-white/10' },
                    { grad: 'linear-gradient(155deg,#1f1233 0%,#301a4d 55%,#452166 100%)', ring: 'ring-1 ring-white/10' },
                  ];
                  const pal = palettes[cupom.indexOf(promo) % palettes.length];

                  const isPercent = promo.discount_Type === 0;
                  const hasUsageLimit = !!promo.quantity_Uses;
                  const usagePct = hasUsageLimit ? Math.min(100, Math.round(((promo?.quantity_Used ?? 0) / promo.quantity_Uses!) * 100)) : 0;
                  const isSelected = selectedCoupon?.id === promo.id;

                  const fmtShort = (d?: string | null) =>
                    d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '--';
                  const fmtFull = (d?: string | null) =>
                    d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--';
                  const isExpired =
                    !!promo.date_End &&
                    new Date(promo.date_End).getTime() < Date.now();
                  return (
                    <div
                      key={promo.id}
                      className={`group relative overflow-hidden rounded-3xl ${pal.ring} shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${promo.active ? '' : 'opacity-55 grayscale-[0.3]'} ${isSelected ? 'ring-2 ring-brand-400' : ''}`}
                      style={{ background: pal.grad }}
                    >
                      {/* glow accents */}
                      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/[0.06] blur-2xl" />
                      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-brand-400/10 blur-2xl" />

                      {/* ticket cutout divider */}
                      <div className="absolute left-0 right-0 top-[96px] flex items-center px-1">
                        <div className="w-3 h-3 rounded-full bg-black/40 -ml-1.5" />
                        <div className="flex-1 border-t border-dashed border-white/15 mx-1" />
                        <div className="w-3 h-3 rounded-full bg-black/40 -mr-1.5" />
                      </div>

                      <div className="p-5 relative">
                        {/* code + status */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-1.5 inline-block">
                              <span className="text-white font-display font-bold text-base tracking-[0.15em]">{promo.cod_Cupom}</span>
                            </div>
                            {promo.name_Cupom && (
                              <p className="text-white/45 text-[10px] mt-1.5 ml-0.5 font-medium truncate max-w-[160px]">{promo.name_Cupom}</p>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm shrink-0 ${promo.active
                            ? 'bg-emerald-400/15 text-emerald-300 border-emerald-400/25'
                            : 'bg-white/[0.06] text-white/40 border-white/10'
                            }`}>
                            {promo.active ? '● Ativa' : 'Pausada'}
                          </span>
                        </div>

                        {/* discount */}
                        <div className="mb-1 flex items-baseline gap-2">
                          <p className="text-white font-display font-bold text-4xl leading-none tracking-tight">
                            {isPercent ? (
                              <>{promo.discount}<span className="text-2xl align-top ml-0.5">% OFF</span></>
                            ) : (
                              <>{formatPrice(promo.discount || 0)}<span className="text-2xl align-top ml-0.5"> OFF</span></>
                            )}
                          </p>
                          {isPercent && promo.maximum_Discount ? (
                            <span className="text-white/40 text-[11px] mb-1">até {formatPrice(promo.maximum_Discount)}</span>
                          ) : null}
                        </div>
                        <p className="text-white/60 text-sm mb-3 leading-snug">{promo.description}</p>

                        {/* rule badges */}
                        {(promo.first_Order_Only || promo.per_User_Limit) && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {promo.first_Order_Only && (
                              <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/20">
                                1ª compra
                              </span>
                            )}
                            {promo.per_User_Limit ? (
                              <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-white/10 text-white/60 border border-white/10">
                                Limite {promo.per_User_Limit}/cliente
                              </span>
                            ) : null}
                          </div>
                        )}

                        {/* min value + validity */}
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-3 text-xs">
                          {promo.minimum_Value ? (
                            <span className="text-white/45">Mín. <span className="text-white/70 font-medium">{formatPrice(promo.minimum_Value)}</span></span>
                          ) : null}
                          <span className="text-white/45">
                            Vigência{' '}
                            <span className="text-white/70 font-medium">
                              {fmtShort(promo.date_Start)} – {fmtFull(promo.date_End)}
                            </span>
                          </span>
                        </div>

                        {/* usage bar */}
                        {hasUsageLimit && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white/40 text-[10px] uppercase tracking-wider font-medium">Uso do cupom</span>
                              <span className="text-white/60 text-[10px] font-medium">{promo.quantity_Used} de {promo.quantity_Uses}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-500"
                                style={{ width: `${usagePct}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {linked.length > 0 ? (
                          <div className="mb-4">
                            <p className="text-white/40 text-[10px] mb-1.5 uppercase tracking-wider font-medium">
                              Produtos com desconto
                            </p>
                            <div className="flex gap-1.5 flex-wrap">
                              {linked.slice(0, 4).map(p => (
                                <div
                                  key={p.id}
                                  className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-lg pl-1 pr-2 py-1"
                                >
                                  <img
                                    src={`/Imagens/Produtos/${p.imagens[0].url_Imagem}`}
                                    alt=""
                                    className="w-5 h-5 rounded-md object-cover"
                                  />
                                  <span className="text-white/85 text-[10px] font-medium max-w-[80px] truncate">
                                    {p.name}
                                  </span>
                                </div>
                              ))}
                              {linked.length > 4 && (
                                <span className="text-white/45 text-[10px] self-center font-medium">
                                  +{linked.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (promo.categoryIds?.length ?? 0) > 0 ? (
                          <div className="mb-4">
                            <p className="text-white/40 text-[10px] mb-1.5 uppercase tracking-wider font-medium">
                              Categorias com desconto
                            </p>
                            <div className="flex gap-1.5 flex-wrap">
                              {promo.categoryIds!.slice(0, 4).map(category => (
                                <span
                                  key={category.id}
                                  className="px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-white/85 text-[10px]"
                                >
                                  {Category.find(c => c.id === category.id_Category)?.category || "Sem categoria"}
                                </span>
                              ))}
                              {promo.categoryIds!.length > 4 && (
                                <span className="text-white/45 text-[10px] self-center font-medium">
                                  +{promo.categoryIds!.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : null}

                        <div className="flex gap-2 pt-1">
                          <div className="relative flex-1 group">
                            <button
                              disabled={isExpired}
                              onClick={() => {
                                setIdCupom(promo.id || 0);
                                Controller?.action.SetTitleCOnfirm(`${promo.active ? "Pausar" : "Ativar"} Cupom`);
                                Controller?.action.SetDescriptionConfirm(
                                  `Tem certeza que deseja ${promo.active ? "Pausar" : "Ativar"} este cupom? ${promo.active
                                    ? "Ao pausá-lo, ele deixará de ficar disponível para os clientes até ser ativado novamente."
                                    : "Ao ativá-lo, ele ficará disponível para os clientes utilizarem nas compras, desde que atenda às regras de validade e uso."
                                  }`
                                );
                                Controller?.action.SetButtonConfirm(`${promo.active ? "Pausar" : "Ativar"} Cupom`);
                                Controller?.action.setShowCouponModalActive(true);
                              }

                              }
                              className={`w-full py-2 text-xs font-bold rounded-xl border transition-all ${isExpired
                                ? "bg-gray-500/20 border-gray-500/30 text-gray-400 cursor-not-allowed"
                                : "bg-white/10 hover:bg-white/20 border-white/10 text-white"
                                }`}
                            >
                              {promo.active ? "Pausar" : "Ativar"}
                            </button>

                            {isExpired && (
                              <div
                                className=" absolute bottom-full mb-2 left-full -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 w-72 max-w-[calc(100vw-2rem)]">
                                <div className="rounded-xl bg-slate-900 text-white text-xs p-3 shadow-2xl border border-slate-700 text-center">
                                  <p className="font-semibold mb-1">
                                    ⚠️ Cupom expirado
                                  </p>

                                  <p className="text-white/80 leading-relaxed">
                                    Este cupom já venceu e não pode mais ser ativado.
                                    Para utilizá-lo novamente, edite o cupom e altere a
                                    data de vencimento para uma data futura.
                                  </p>
                                </div>

                                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 rotate-45" />
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              Controller?.action.setEditingCoupon(true);
                              Controller?.action.setShowCouponModal(true);
                              Controller?.action.setOriginalProducts((promo?.productIds ?? []).map(x => x.id_Product));
                              Controller?.action.setOriginalCategories((promo.categoryIds ?? []).map(x => x.id_Category));
                              Controller?.action.setNewCoupon(promo);
                            }}
                            className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 transition-all"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              Controller?.action.SetTitleCOnfirm("Excluir Cupom");
                              Controller?.action.SetDescriptionConfirm("Tem certeza que deseja excluir este Cupom? Essa ação é Permanecerá no historico do sistema você pode cunsultar quando quiser!");
                              Controller?.action.SetButtonConfirm("Exluir Cupom");
                              Controller?.action.setshowDeleteModalCupom(true);
                              setIdCupom(promo.id || 0);
                            }}
                            className="px-3 py-2 bg-red-500/15 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-500/20 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => setSelectedCoupon(promo)}
                          className={`w-full mt-2 py-2 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl border transition-all ${isSelected
                            ? 'bg-brand-500/25 border-brand-400/40 text-brand-200'
                            : 'bg-white/[0.04] hover:bg-white/10 border-white/10 text-white/70'
                            }`}
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver produtos
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => { Controller?.action.setEditingCoupon(false); Controller?.action.setShowCouponModal(true); }}
                  className={`rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-2 min-h-[220px] transition-all ${dk
                    ? 'border-white/[0.10] text-white/30 hover:border-brand-400 hover:text-brand-400 hover:bg-white/[0.02]'
                    : 'border-surface-200 text-surface-300 hover:border-brand-400 hover:text-brand-500 hover:bg-surface-50'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${dk ? 'bg-white/5' : 'bg-surface-100'}`}>
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="font-display font-bold text-sm">Nova Promoção</span>
                </button>
              </div>

              {/* Products with promos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className={`font-display font-bold text-base ${txt}`}>Produtos em Promoção</h3>
                    {selectedCoupon ? (
                      <p className={`text-xs mt-0.5 ${sub}`}>
                        Cupom selecionado <span className="font-bold text-brand-400">{selectedCoupon.cod_Cupom}</span>
                        {' · '}{filteredPromotionProducts.length} produto{filteredPromotionProducts.length !== 1 ? 's' : ''} encontrado{filteredPromotionProducts.length !== 1 ? 's' : ''}
                      </p>
                    ) : (
                      <p className={`text-xs mt-0.5 ${sub}`}>Nenhum cupom selecionado</p>
                    )}
                  </div>
                  {selectedCoupon && (
                    <button
                      onClick={() => setSelectedCoupon(null)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${dk ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-surface-200 text-surface-400 hover:bg-surface-50'
                        }`}
                    >
                      Limpar seleção
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredPromotionProducts.map(p => {
                    const hasDiscount = p.origin_Price && p.origin_Price > p.price_Unic;
                    const d = hasDiscount ? Math.round(((p.origin_Price! - p.price_Unic) / p.origin_Price!) * 100) : 0;
                    return (
                      <div
                        key={p.id}
                        className={`rounded-2xl border p-4 flex items-center gap-3 transition-all ${card} ${cardH}`}
                      >
                        <img src={`/Imagens/Produtos/${p.imagens[0].url_Imagem}`} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${txt}`}>{p.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {hasDiscount && (
                              <span className={`text-[10px] line-through ${sub}`}>{formatPrice(p.origin_Price!)}</span>
                            )}
                            <span className="text-brand-400 font-display font-bold text-sm">{formatPrice(p.price_Unic)}</span>
                          </div>
                        </div>
                        {hasDiscount && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-2.5 py-1.5 text-center flex-shrink-0">
                            <p className="text-red-400 font-display font-bold text-base leading-none">-{d}%</p>
                            <p className={`text-[9px] mt-0.5 ${sub}`}>desconto</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filteredPromotionProducts.length === 0 && (
                    <div className={`col-span-3 rounded-2xl border border-dashed py-8 text-center ${dk ? 'border-white/10' : 'border-surface-200'}`}>
                      <p className={`text-sm ${sub}`}>
                        {selectedCoupon ? 'Nenhum produto encontrado para este cupom.' : 'Nenhum produto com promoção ativa ainda.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── PROFILE ─── */}
          {tab === 'profile' && (
            <div className="max-w-2xl space-y-5">
              <div className={`rounded-2xl border overflow-hidden ${card}`}>
                <div className="h-24 bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 relative">
                  <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                </div>
                <div className="px-6 pb-6">
                  <div className="flex items-end gap-4 -mt-10 mb-5 flex-wrap">
                    <div className="relative">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center border-4 shadow-xl ${dk ? 'border-[#0d0d14]' : 'border-white'}`}>
                        <span className="text-white font-display font-bold text-3xl">{user?.name?.[0] || 'A'}</span>
                      </div>
                      <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-500 hover:bg-brand-600 rounded-xl flex items-center justify-center shadow"><Camera className="w-3.5 h-3.5 text-white" /></button>
                    </div>
                    <div className="mb-1 flex-1 min-w-0">
                      <h2 className={`font-display font-bold text-xl ${txt}`}>{user?.name || 'Admin Master'}</h2>
                      <p className="text-brand-400 text-sm font-semibold">Administrador</p>
                    </div>
                    {/* <button onClick={() => editingProfile ? (updateUser({ name: profileForm.name, email: profileForm.email, phone: profileForm.phone, bio: profileForm.bio }), setEditingProfile(false), showNotification('Perfil atualizado!', 'success')) : setEditingProfile(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl transition-all mb-1">
                      {editingProfile ? <><Check className="w-4 h-4" /> Salvar</> : <><Edit3 className="w-4 h-4" /> Editar</>}
                    </button> */}
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[{ l: 'Pedidos', v: orders.length }, { l: 'Produtos', v: products.length }, { l: 'Promoções', v: cupom.filter(p => p.active).length }].map((s, i) => (
                      <div key={i} className={`rounded-xl p-3 text-center ${dk ? 'bg-white/[0.04]' : 'bg-surface-50'}`}>
                        <p className={`font-bold text-lg leading-none ${txt}`}>{s.v}</p>
                        <p className={`text-[10px] mt-1 ${sub}`}>{s.l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: <User className="w-4 h-4" />, label: 'Nome', key: 'name', val: user?.name || '' },
                      { icon: <Mail className="w-4 h-4" />, label: 'Email', key: 'email', val: user?.email || '' },
                      { icon: <Phone className="w-4 h-4" />, label: 'Telefone', key: 'phone', val: user?.phone || '' },
                      { icon: <MapPin className="w-4 h-4" />, label: 'Localização', key: '_loc', val: 'Craibas, AL' },
                    ].map(f => (
                      <div key={f.key} className={`rounded-xl p-3.5 flex items-center gap-3 ${dk ? 'bg-white/[0.04]' : 'bg-surface-50'}`}>
                        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 flex-shrink-0">{f.icon}</div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[10px] uppercase tracking-wider font-bold ${sub} mb-0.5`}>{f.label}</p>
                          {editingProfile && !f.key.startsWith('_') ? (
                            <input value={(profileForm as any)[f.key] || f.val} onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                              className={`w-full text-xs py-1 px-2 rounded-lg border focus:outline-none focus:border-brand-400 transition-colors ${inp}`} />
                          ) : (
                            <p className={`text-sm font-medium truncate ${txt}`}>{f.key.startsWith('_') ? f.val : (profileForm as any)[f.key] || f.val || '—'}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── SETTINGS ─── */}
          {tab === 'settings' && (
            <div className="max-w-2xl space-y-5">
              <div className={`rounded-2xl border p-6 ${card}`}>
                <h3 className={`font-display font-bold mb-5 flex items-center gap-2 ${txt}`}><Store className="w-4 h-4 text-brand-400" /> Aparência da Loja</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[{ label: 'Nome da Loja', key: 'storeName' }, { label: 'Slogan', key: 'slogan' }].map(f => (
                    <div key={f.key}>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>{f.label}</label>
                      <input value={(settingsForm as any)[f.key]} onChange={e => setSettingsForm(s => ({ ...s, [f.key]: e.target.value }))}
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${inp}`} />
                    </div>
                  ))}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Cor Primária</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settingsForm.primaryColor} onChange={e => setSettingsForm(s => ({ ...s, primaryColor: e.target.value }))} className="w-10 h-10 rounded-xl border-2 border-surface-200 cursor-pointer p-0.5" />
                      <span className={`text-sm font-mono ${txt}`}>{settingsForm.primaryColor}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div><p className={`text-sm font-medium ${txt}`}>Modo Escuro</p><p className={`text-xs ${sub}`}>Ativar tema escuro global</p></div>
                    <button onClick={toggleDarkMode}>{darkMode ? <ToggleRight className="w-9 h-9 text-brand-500" /> : <ToggleLeft className="w-9 h-9 text-surface-300" />}</button>
                  </div>
                </div>
              </div>
              <div className={`rounded-2xl border p-6 ${card}`}>
                <h3 className={`font-display font-bold mb-5 flex items-center gap-2 ${txt}`}><Package className="w-4 h-4 text-brand-400" /> Frete</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[{ label: 'Frete Grátis Acima (R$)', key: 'freeShippingAbove' }, { label: 'Taxa Base (R$)', key: 'baseShipping' }, { label: 'Prazo (dias úteis)', key: 'deliveryDays' }].map(f => (
                    <div key={f.key}>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>{f.label}</label>
                      <input value={(settingsForm as any)[f.key]} onChange={e => setSettingsForm(s => ({ ...s, [f.key]: e.target.value }))}
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${inp}`} />
                    </div>
                  ))}
                </div>
              </div>
              <div className={`rounded-2xl border p-6 ${card}`}>
                <h3 className={`font-display font-bold mb-5 flex items-center gap-2 ${txt}`}><Shield className="w-4 h-4 text-brand-400" /> Segurança</h3>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between p-4 rounded-xl ${dk ? 'bg-white/[0.04]' : 'bg-surface-50'}`}>
                    <div><p className={`font-medium text-sm ${txt}`}>2FA</p><p className={`text-xs ${sub}`}>Autenticação em 2 etapas</p></div>
                    <button onClick={() => setSettingsForm(s => ({ ...s, twoFactor: !s.twoFactor }))}>
                      {settingsForm.twoFactor ? <ToggleRight className="w-9 h-9 text-green-400" /> : <ToggleLeft className="w-9 h-9 text-surface-300" />}
                    </button>
                  </div>
                  <div className={`flex items-center justify-between p-4 rounded-xl ${dk ? 'bg-white/[0.04]' : 'bg-surface-50'}`}>
                    <div><p className={`font-medium text-sm ${txt}`}>Timeout de Sessão (min)</p><p className={`text-xs ${sub}`}>Deslogar após inatividade</p></div>
                    <input value={settingsForm.sessionTimeout} onChange={e => setSettingsForm(s => ({ ...s, sessionTimeout: e.target.value }))}
                      className={`w-20 px-3 py-1.5 border rounded-xl text-sm text-right outline-none ${inp}`} />
                  </div>
                </div>
              </div>
              <button onClick={() => showNotification('Configurações salvas!', 'success')}
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-brand">
                <Check className="w-4 h-4" /> Salvar Configurações
              </button>
            </div>
          )}

        </main>
      </div >

      {/* ─── PRODUCT MODAL ─── */}

      {Controller?.result.showProductModal && Controller?.result.modalStep === 1 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { Controller?.action.setShowProductModal(false), Controller.action.setNewProduct({}) }}>
          <div className={`rounded-2xl border p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl ${card}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`font-display font-bold text-lg ${txt}`}>
                {Controller?.result.editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button onClick={() => { Controller?.action.setShowProductModal(false), Controller.action.setNewProduct({}) }} className={`p-2 rounded-xl ${txt2} ${dk ? 'hover:bg-white/[0.08]' : 'hover:bg-surface-100'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>
                  Nome
                </label>

                <input
                  value={Controller?.result.newProduct.name || ""}
                  onChange={(e) => {
                    Controller?.action.setNewProduct(p => ({ ...p, name: e.target.value }));
                    Controller?.action.setErrors(prev => ({ ...prev, name: "" }));
                  }}
                  placeholder="Nome do produto"
                  className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${Controller?.result.errors.name ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : inp}`}
                />

                {Controller?.result.errors.name && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    ⚠ {Controller?.result.errors.name}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Preço (R$)', key: 'price_Unic', type: 'number' },
                  { label: 'Preço Original (R$)', key: 'origin_Price', type: 'number' },
                  { label: 'Estoque', key: 'total_Stock', type: 'number' }].map(f => (
                    <div key={f.key}>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>
                        {f.label}
                      </label>
                      <input type={f.type} value={(Controller?.result.newProduct as any)[f.key] || ''} onChange={e => Controller?.action.setNewProduct(p => ({ ...p, [f.key]: Number(e.target.value) }))} className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${inp}`} />
                      {Controller?.result.errors.price_Unic && f.key == 'price_Unic' && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          ⚠ {Controller?.result.errors.price_Unic}
                        </p>
                      )}

                      {Controller?.result.errors.origin_Price && f.key == 'origin_Price' && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          ⚠ {Controller?.result.errors.origin_Price}
                        </p>
                      )}
                      {Controller?.result.errors.total_Stock && f.key == 'total_Stock' && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          ⚠ {Controller?.result.errors.total_Stock}
                        </p>
                      )}


                    </div>
                  ))}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>
                    Categoria
                  </label>

                  <select
                    value={Controller?.result.newProduct.id_category ?? ""}
                    onChange={e =>
                      Controller?.action.setNewProduct(p => ({
                        ...p,
                        id_category: Number(e.target.value),
                      }))
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${inp}`}
                  >
                    <option value="" disabled>
                      Selecione uma categoria
                    </option>

                    {Category.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.category}
                      </option>
                    ))}
                  </select>
                  {Controller?.result.errors.id_category && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      ⚠ {Controller?.result.errors.id_category}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>
                  Tags
                </label>

                <input
                  value={Controller?.result.newProduct.tags || ""}
                  onChange={e =>
                    Controller?.action.setNewProduct(p => ({
                      ...p,
                      tags: e.target.value
                    }))
                  }
                  placeholder="Iphone, Apple, Smartphone, Celular..."
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${inp}`}
                />

                <p className={`mt-2 text-xs flex items-center gap-1 ${sub}`}>
                  <span>ℹ️</span>
                  Separe cada tag por vírgula. Exemplo:
                  <span className="font-medium">
                    {" "}Iphone, Apple, Smartphone, Celular
                  </span>
                </p>
                {Controller?.result.errors.tags && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    ⚠ {Controller?.result.errors.tags}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Distintivo */}
                <div className="md:col-span-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>
                    Distintivo
                  </label>

                  <select
                    value={Controller?.result.newProduct.badge || ""}
                    onChange={e =>
                      Controller?.action.setNewProduct(p => ({
                        ...p,
                        badge: e.target.value as any,
                      }))
                    }
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${inp}`}
                  >
                    <option value="" disabled>
                      Selecione um Distintivo
                    </option>
                    {Object.entries(badgeLabel).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                  {Controller?.result.errors.badge && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                      ⚠ {Controller?.result.errors.badge}
                    </p>
                  )}
                </div>

                {/* Parcelas */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>
                    Max Parcelas
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={Controller?.result.newProduct.installments ?? 1}
                    onChange={e =>
                      Controller?.action.setNewProduct(p => ({
                        ...p,
                        installments: Number(e.target.value),
                      }))
                    }
                    placeholder="Ex: 12"
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${inp}`}
                  />

                </div>

              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>
                  Imagens do produto
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={Controller?.action.handleImageSelect}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed rounded-xl text-sm font-medium transition-colors ${dk ? 'border-white/15 text-white/60 hover:border-brand-500/50 hover:bg-white/[0.04]' : 'border-surface-200 text-surface-500 hover:border-brand-400 hover:bg-surface-50'
                    }`}
                >
                  <ImagePlus className="w-4 h-4" />
                  Adicionar imagens (uma ou várias de uma vez)
                </button>

                {(Controller?.result.newProduct.imagens?.length ?? 0) > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {Controller?.result.newProduct.imagens!.map((src, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer" onClick={() => Controller?.action.setLightboxImage(src)}>
                        <img
                          src={
                            src.file
                              ? src.url_Imagem
                              : `/Imagens/Produtos/${src.url_Imagem}`
                          }
                          alt={`Imagem ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); Controller?.action.removeImage(i); }}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {Controller?.result.lightboxImage && (
                  <div
                    className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-6"
                    onClick={() => Controller?.action.setLightboxImage(null)}
                  >
                    <button
                      onClick={() => Controller?.action.setLightboxImage(null)}
                      className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <img
                      src={Controller?.result.lightboxImage ? `/Imagens/Produtos/${Controller?.result.lightboxImage?.url_Imagem}` : Controller?.result.lightboxImage?.url_Imagem}
                      alt="Visualização ampliada"
                      className="max-w-full max-h-full rounded-2xl object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        if (!Controller?.result.lightboxImage) return;

                        const index =
                          Controller.result.newProduct.imagens?.indexOf(
                            Controller.result.lightboxImage
                          ) ?? -1;

                        if (index >= 0) {
                          Controller.action.removeImage(index);
                        }
                      }}
                      className="absolute bottom-6 flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold"
                    >
                      <Trash2 className="w-4 h-4" /> Excluir esta imagem
                    </button>
                  </div>
                )}
                {Controller?.result.errors.imagens && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                    ⚠ {Controller?.result.errors.imagens}
                  </p>
                )}
                <p className={`mt-2 text-xs ${sub}`}>
                  Clique em uma imagem para ver em tamanho grande. Passe o mouse para excluir.
                </p>

              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>
                  Descrição
                </label>
                <textarea value={Controller?.result.newProduct.description || ''} onChange={e => Controller?.action.setNewProduct(p => ({ ...p, description: e.target.value }))} rows={3} className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors resize-none ${inp}`} />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${txt2}`}>
                  Em Destaque?
                </span>
                <button onClick={() => Controller?.action.setNewProduct(p => ({ ...p, featured: !p.featured }))}>
                  {Controller?.result.newProduct.featured ? <ToggleRight className="w-8 h-8 text-brand-500" /> : <ToggleLeft className="w-8 h-8 text-surface-300" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${txt2}`}>
                  Frete Grátis?
                </span>
                <button onClick={() => Controller?.action.setNewProduct(p => ({ ...p, freeShipping: !p.freeShipping }))}>
                  {Controller?.result.newProduct.freeShipping ? <ToggleRight className="w-8 h-8 text-green-500" /> : <ToggleLeft className="w-8 h-8 text-surface-300" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${txt2}`}>
                  Ativo?
                </span>
                <button onClick={() => Controller?.action.setNewProduct(p => ({ ...p, ativo: !p.ativo }))}>
                  {Controller?.result.newProduct.ativo ? <ToggleRight className="w-8 h-8 text-green-500" /> : <ToggleLeft className="w-8 h-8 text-surface-300" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${txt2}`}>
                  Mostrar Banner?
                </span>
                <button onClick={() => Controller?.action.setNewProduct(p => ({ ...p, showBanner: !p.showBanner }))}>
                  {Controller?.result.newProduct.showBanner ? <ToggleRight className="w-8 h-8 text-green-500" /> : <ToggleLeft className="w-8 h-8 text-surface-300" />}
                </button>
              </div>
              <div className={`pt-4 border-t flex gap-3 ${bord}`}>
                <button onClick={() => Controller?.action.setShowProductModal(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${dk ? 'bg-white/[0.06] text-white/60 hover:bg-white/[0.10]' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'}`}>
                  Cancelar
                </button>
                <button onClick={Controller?.action.handleNext} className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold shadow-brand flex items-center justify-center gap-2">
                  Próximo <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {/* <div className={`pt-4 border-t flex gap-3 ${bord}`}>
                  <button onClick={() => setShowProductModal(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${dk ? 'bg-white/[0.06] text-white/60 hover:bg-white/[0.10]' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'}`}>
                    Cancelar
                  </button>
                  <button onClick={handleSaveProduct} className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold shadow-brand flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> {editingProduct ? 'Salvar' : 'Criar'}
                  </button>
                </div> */}
            </div>
          </div>
        </div>
      )
      }
      {Controller?.result.showProductModal && Controller?.result.modalStep === 2 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => Controller?.action.setShowProductModal(false)}>
          <div className={`rounded-2xl border p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl ${card}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`font-display font-bold text-lg ${txt}`}>Variantes do produto</h3>
              <button onClick={() => { Controller?.action.setShowProductModal(false); Controller?.action.setModalStep(1) }} className={`p-2 rounded-xl ${txt2} ${dk ? 'hover:bg-white/[0.08]' : 'hover:bg-surface-100'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className={`text-xs mb-4 ${sub}`}>
              Adicione as variações disponíveis (cor, tamanho, tipo). Deixe em branco o que não se aplicar.
            </p>

            <div className="space-y-3">
              {(Controller?.result.newProduct.variations || []).map((variant, index) => (
                <div
                  key={variant.id}
                  className={`rounded-2xl border p-5 space-y-5 ${dk
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-surface-200 bg-surface-50"
                    }`}
                >
                  {/* Cabeçalho */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-semibold ${txt}`}>
                        Variante {index + 1}
                      </h4>
                      <p className={`text-xs ${sub}`}>
                        Configure os atributos desta variação.
                      </p>
                    </div>

                    <button
                      onClick={() => Controller?.action.removeVariant(variant.id)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-2 ${sub}`}>
                      Tipo da Variante
                    </label>

                    <input
                      value={variant.type || ""}
                      onChange={(e) => {
                        Controller?.action.updateVariant(variant.id, { type: e.target.value });

                        Controller?.action.setVariantErrors(prev => ({
                          ...prev,
                          [`${index}.type`]: ""
                        }));
                      }}
                      className={`w-full px-4 py-3 rounded-xl ${Controller?.result.variantErrors[`${index}.type `]
                        ? "border-red-500"
                        : inp
                        } border rounded-xl text-sm outline-none ${inp}`}
                    />

                    {Controller?.result.variantErrors[`${index}.type`] && (
                      <p className="mt-1 text-xs text-red-500">
                        ⚠ {Controller?.result.variantErrors[`${index}.type`]}
                      </p>
                    )}
                  </div>

                  {/* Nome + Valor */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase mb-2 ${sub}`}>
                        Nome
                      </label>

                      <input
                        value={variant.name || ""}
                        onChange={(e) =>
                          Controller?.action.updateVariant(variant.id, {
                            name: e.target.value,
                          })
                        }
                        placeholder="Ex.: Azul"
                        className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${inp}`}
                      />
                      {Controller?.result.variantErrors[`${index}.name`] && (
                        <p className="mt-1 text-xs text-red-500">
                          ⚠ {Controller?.result.variantErrors[`${index}.name`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase mb-2 ${sub}`}>
                        Valor
                      </label>

                      <input
                        value={variant.value || ""}
                        onChange={(e) =>
                          Controller?.action.updateVariant(variant.id, {
                            value: e.target.value,
                          })
                        }
                        placeholder="Ex.: 256GB"
                        className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${inp}`}
                      />
                      {Controller?.result.variantErrors[`${index}.value`] && (
                        <p className="mt-1 text-xs text-red-500">
                          ⚠ {Controller?.result.variantErrors[`${index}.value`]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Estoque + Preço */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase mb-2 ${sub}`}>
                        Estoque
                      </label>

                      <input
                        type="text"
                        aria-placeholder='123.45'
                        value={variant.stoke}
                        onChange={(e) =>
                          Controller?.action.updateVariant(variant.id, {
                            stoke: Number(e.target.value),
                          })
                        }
                        className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${inp}`}
                      />
                      {Controller?.result.variantErrors[`${index}.stoke`] && (
                        <p className="mt-1 text-xs text-red-500">
                          ⚠ {Controller?.result.variantErrors[`${index}.stoke`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase mb-2 ${sub}`}>
                        Modificador de Preço
                      </label>

                      <input
                        type="text"
                        aria-placeholder='123.45'
                        value={variant.price_Modifier}
                        onChange={(e) =>
                          Controller?.action.updateVariant(variant.id, {
                            price_Modifier: Number(e.target.value),
                          })
                        }
                        placeholder="+0,00"
                        className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${inp}`}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={Controller?.action.addVariant}
                className={`w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed rounded-xl text-sm font-medium ${dk ? 'border-white/15 text-white/60 hover:border-brand-500/50' : 'border-surface-200 text-surface-500 hover:border-brand-400'}`}
              >
                <Plus className="w-4 h-4" /> Adicionar variante
              </button>
            </div>

            <div className={`pt-4 mt-4 border-t flex gap-3 ${bord}`}>
              <button onClick={() => Controller?.action.setModalStep(1)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${dk ? 'bg-white/[0.06] text-white/60 hover:bg-white/[0.10]' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'}`}>
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              {Controller?.result.editingProduct ? (
                <button
                  onClick={Controller?.action.handleEditeProduct}
                  disabled={Controller?.result.SaveEditeLoading}
                  className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-brand flex items-center justify-center gap-2"
                >
                  {Controller?.result.SaveEditeLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Editar
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={Controller?.action.handleSaveProduct}
                  disabled={Controller?.result.SaveEditeLoading}
                  className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-brand flex items-center justify-center gap-2"
                >
                  {Controller?.result.SaveEditeLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Salvar
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ─── PROMO MODAL ─── */}
      {/*
  Modal adaptado: Promoção → Cupom de Desconto
  Mantido: mesmo layout, cores, tema claro/escuro, classes (card, txt, txt2, sub, inp, bord, dk),
  animações, backdrop, scroll, botões Cancelar/Salvar e preview de produtos.

  Renomeações necessárias no restante do arquivo (fora deste bloco), já que "Promoção" virou "Cupom":
    showPromoModal   -> showCouponModal
    setShowPromoModal-> setShowCouponModal
    editingPromo     -> editingCoupon
    newPromo         -> newCoupon
    setNewPromo      -> setNewCoupon
    handleSavePromo  -> handleSaveCoupon

  Novo estado local (não faz parte do objeto Coupon, é só controle de UI):
    const [applicationScope, setApplicationScope] = useState<'store' | 'categories' | 'products'>('store');

  Assumido um array `categories` já existente no componente, no formato { id: number; name: string }[].
  Caso os campos sejam diferentes (ex: name_Category), é só ajustar a linha `cat.name`.
*/}
      {Controller?.result.showCouponModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            Controller?.action.setShowCouponModal(false)
            Controller?.action.setEditingCoupon(false);
            Controller?.action.setNewCoupon({});
            setApplicationScope("store");
          }}>
          <div className={`rounded-2xl border p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto shadow-2xl ${card}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`font-display font-bold text-lg ${txt}`}>{Controller?.result.editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}</h3>
              <button
                onClick={() => {
                  Controller?.action.setShowCouponModal(false)
                  Controller?.action.setEditingCoupon(false);
                  Controller?.action.setNewCoupon({});
                  setApplicationScope("store");
                }}
                className={`p-2 rounded-xl ${txt2} ${dk ? 'hover:bg-white/[0.08]' : 'hover:bg-surface-100'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">

              {/* ===============================
             Informações Gerais
          ================================ */}
              <div className="space-y-4">
                <p className={`text-xs font-bold uppercase tracking-wider ${sub}`}>Informações Gerais</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2  ${sub}`}>Nome do Cupom</label>
                    <input
                      value={Controller?.result.newCoupon?.name_Cupom || ''}
                      onChange={e => Controller?.action.setNewCoupon(p => ({ ...p, name_Cupom: e.target.value }))}
                      placeholder="Ex: Semana Tech" className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none ${inp}`} />

                    {Controller?.result.cuponsErrors.name_Cupom && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        ⚠ {Controller?.result.cuponsErrors.name_Cupom}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Código</label>
                    <input value={Controller?.result.newCoupon?.cod_Cupom || ''}
                      onChange={e => Controller?.action.setNewCoupon(p => ({ ...p, cod_Cupom: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                      placeholder="EX: VERAO30" className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none uppercase ${inp}`} />

                    {Controller?.result.cuponsErrors.cod_Cupom && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        ⚠ {Controller?.result.cuponsErrors.cod_Cupom}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Tipo de Desconto</label>
                    <select
                      value={
                        typeof Controller?.result.newCoupon?.discount_Type === "string"
                          ? DiscountType[
                          Controller.result.newCoupon.discount_Type as keyof typeof DiscountType
                          ]
                          : (Controller?.result.newCoupon?.discount_Type ?? 0)
                      }
                      onChange={e =>
                        Controller?.action.setNewCoupon(p => ({
                          ...p,
                          discount_Type: Number(e.target.value)
                        }))
                      }
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none ${inp}`}>
                      <option value={DiscountType.Percentage}>Percentual</option>
                      <option value={DiscountType.FixedValue}>Valor Fixo</option>
                      <option value={DiscountType.FreeShipping}>Frete Grátis</option>
                    </select>
                    {Controller?.result.cuponsErrors.discount_Type && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        ⚠ {Controller?.result.cuponsErrors.discount_Type}
                      </p>
                    )}
                  </div>
                  {Controller?.result.newCoupon?.discount_Type !== 2 && (
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>
                        Valor do Desconto {Controller?.result.newCoupon?.discount_Type === 1 ? '(R$)' : '(%)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={Controller?.result.newCoupon?.discount_Type === 0 ? 100 : undefined}
                        value={Controller?.result.newCoupon?.discount || ''}
                        onChange={e => Controller?.action.setNewCoupon(p => ({ ...p, discount: Number(e.target.value) }))}
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none ${inp}`}
                      />
                      {Controller?.result.cuponsErrors.discount && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          ⚠ {Controller?.result.cuponsErrors.discount}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Descrição</label>
                    <input value={Controller?.result.newCoupon?.description || ''}
                      onChange={e => Controller?.action.setNewCoupon(p => ({ ...p, description: e.target.value }))}
                      placeholder="Ex: 30% OFF em eletrônicos" className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none ${inp}`} />
                    {Controller?.result.cuponsErrors.description && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        ⚠ {Controller?.result.cuponsErrors.description}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border ${Controller?.result.newCoupon?.active ? (dk ? 'bg-brand-500/15 border-brand-500/30' : 'bg-brand-50 border-brand-200') : (dk ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-surface-50 border-surface-100')}`}>
                      <input type="checkbox" checked={Controller?.result.newCoupon?.active ?? true} onChange={e => Controller?.action.setNewCoupon(p => ({ ...p, active: e.target.checked }))} className="accent-brand-500 w-4 h-4" />
                      <span className={`text-sm font-medium ${txt}`}>Cupom ativo</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ===============================
             Regras
          ================================ */}
              <div className={`space-y-4 pt-4 border-t ${bord}`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${sub}`}>Regras</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Compra Mínima (R$)</label>
                    <input type="number"
                      value={Controller?.result.newCoupon?.minimum_Value ?? ''}
                      onChange={e => Controller?.action.setNewCoupon(p => ({ ...p, minimum_Value: e.target.value === '' ? null : Number(e.target.value) }))}
                      placeholder="0" className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none ${inp}`} />

                    {Controller?.result.cuponsErrors.minimum_Value && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        ⚠ {Controller?.result.cuponsErrors.minimum_Value}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Desconto Máximo (R$)</label>
                    <input type="number"
                      value={Controller?.result.newCoupon?.maximum_Discount ?? ''}
                      onChange={e => Controller?.action.setNewCoupon(p => ({ ...p, maximum_Discount: e.target.value === '' ? null : Number(e.target.value) }))}
                      placeholder="Sem limite" className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none ${inp}`} />

                    {Controller?.result.cuponsErrors.maximum_Discount && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        ⚠ {Controller?.result.cuponsErrors.maximum_Discount}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Qtd. Máxima de Usos</label>
                    <input
                      type="number"
                      value={Controller?.result.newCoupon?.quantity_Uses ?? ''}
                      onChange={e => Controller?.action.setNewCoupon(p => ({ ...p, quantity_Uses: e.target.value === '' ? null : Number(e.target.value) }))}
                      placeholder="Ilimitado" className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none ${inp}`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Limite por Cliente</label>
                    <input
                      type="number"
                      value={Controller?.result.newCoupon?.per_User_Limit ?? ''}
                      onChange={e => Controller?.action.setNewCoupon(p => ({ ...p, per_User_Limit: e.target.value === '' ? null : Number(e.target.value) }))}
                      placeholder="Ilimitado" className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none ${inp}`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Data Inicial</label>
                    <input
                      type="date"
                      value={Controller?.result.newCoupon?.date_Start || ''}
                      onChange={e => Controller?.action.setNewCoupon(p => ({ ...p, date_Start: e.target.value || null }))}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none ${inp}`} />
                    {Controller?.result.cuponsErrors.date_Start && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        ⚠ {Controller?.result.cuponsErrors.date_Start}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Data Final</label>
                    <input
                      type="date"
                      value={Controller?.result.newCoupon?.date_End || ''}
                      onChange={e => Controller?.action.setNewCoupon(p => ({ ...p, date_End: e.target.value || '' }))}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none ${inp}`} />

                    {Controller?.result.cuponsErrors.date_End && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                        ⚠ {Controller?.result.cuponsErrors.date_End}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border ${Controller?.result.newCoupon?.first_Order_Only ? (dk ? 'bg-brand-500/15 border-brand-500/30' : 'bg-brand-50 border-brand-200') : (dk ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-surface-50 border-surface-100')}`}>
                      <input
                        type="checkbox"
                        checked={Controller?.result.newCoupon?.first_Order_Only ?? false}
                        onChange={e => Controller?.action.setNewCoupon(p => ({ ...p, first_Order_Only: e.target.checked }))}
                        className="accent-brand-500 w-4 h-4" />
                      <span className={`text-sm font-medium ${txt}`}>Válido apenas na primeira compra</span>
                    </label>
                  </div>
                  <button
                    onClick={() => {
                      Controller?.action.setEditingCoupon(false);
                      Controller?.action.setNewCoupon({});
                      setApplicationScope("store");
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-600 hover:bg-slate-700 text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Limpar
                  </button>
                </div>
              </div>

              {/* ===============================
             Aplicação
          ================================ */}
              <div className={`space-y-4 pt-4 border-t ${bord}`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${sub}`}>Aplicação</p>
                <div className="grid grid-cols-3 gap-2">
                  {options.map(opt => (
                    <label
                      key={opt.key}
                      className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer border text-sm font-medium justify-center ${txt} ${applicationScope === opt.key
                        ? (dk ? 'bg-brand-500/15 border-brand-500/30' : 'bg-brand-50 border-brand-200')
                        : (dk ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06]' : 'bg-surface-50 hover:bg-surface-100 border-surface-100')
                        }`}
                    >
                      <input
                        type="radio"
                        name="applicationScope"
                        checked={applicationScope === opt.key}
                        onChange={() => {
                          setApplicationScope(opt.key);
                          Controller?.action.setNewCoupon(p => ({ ...p, application: opt.key }))
                          if (opt.key === 'store') Controller?.action.setNewCoupon(p => ({ ...p, categoryIds: [], productIds: [] }));
                          if (opt.key === 'categories') Controller?.action.setNewCoupon(p => ({ ...p, productIds: [] }));
                          if (opt.key === 'products') Controller?.action.setNewCoupon(p => ({ ...p, categoryIds: [] }));
                        }}
                        className="accent-brand-500 w-4 h-4"
                      />
                      {opt.label}
                    </label>
                  ))}
                  {Controller?.result.cuponsErrors.Application && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      ⚠ {Controller?.result.cuponsErrors.Application}
                    </p>
                  )}
                </div>

                {applicationScope === 'categories' && (
                  <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                    {Category.map(cat => {
                      const sel = (Controller?.result.newCoupon.categoryIds ?? []).some(c => Number(c.id_Category) === Number(cat.id)
                      );
                      return (
                        <label key={cat.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${sel ? (dk ? 'bg-brand-500/15 border-brand-500/30' : 'bg-brand-50 border-brand-200') : (dk ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06]' : 'bg-surface-50 hover:bg-surface-100 border-surface-100')}`}>
                          <input
                            type="checkbox"
                            checked={sel}
                            onChange={e => {
                              const current = Controller?.result.newCoupon.categoryIds ?? [];

                              const categories = e.target.checked
                                ? [
                                  ...current,
                                  {
                                    id: 0,
                                    id_Cupom: Controller?.result.newCoupon.id ?? 0,
                                    id_Category: cat.id,
                                  }
                                ]
                                : current.filter(c => c.id_Category !== cat.id);

                              Controller?.action.setNewCoupon(prev => ({
                                ...prev,
                                categoryIds: categories
                              }));
                            }}
                            className="accent-brand-500 w-4 h-4 flex-shrink-0"
                          />
                          <span className={`flex-1 text-xs font-medium truncate ${txt}`}>{cat.category}</span>
                        </label>
                      );
                    })}
                    {(Controller?.result.newCoupon.categoryIds || []).length > 0 && (
                      <p className="mt-2 text-brand-400 text-xs font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {(Controller?.result.newCoupon.categoryIds || []).length} categoria{(Controller?.result.newCoupon.categoryIds || []).length > 1 ? 's' : ''} selecionada{(Controller?.result.newCoupon.categoryIds || []).length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}

                {applicationScope === 'products' && (
                  <>
                    <p className={`text-xs ${sub}`}>Produtos selecionados terão o cupom aplicado no checkout.</p>
                    <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                      {products.map(p => {
                        const sel = (Controller?.result.newCoupon.productIds ?? []).some(prod => Number(prod.id_Product) === Number(p.id));

                        return (
                          <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${sel ? (dk ? 'bg-brand-500/15 border-brand-500/30' : 'bg-brand-50 border-brand-200') : (dk ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06]' : 'bg-surface-50 hover:bg-surface-100 border-surface-100')}`}>
                            <input
                              type="checkbox"
                              checked={sel}
                              onChange={e => {
                                const current = Controller?.result.newCoupon.productIds ?? [];

                                const products = e.target.checked
                                  ? [
                                    ...current,
                                    {
                                      id: 0,
                                      id_Cupom: Controller?.result.newCoupon.id ?? 0,
                                      id_Product: p.id,
                                    }
                                  ]
                                  : current.filter(prod => prod.id_Product !== p.id);

                                Controller?.action.setNewCoupon(prev => ({
                                  ...prev,
                                  productIds: products,
                                }));
                              }}
                              className="accent-brand-500 w-4 h-4 flex-shrink-0" />
                            <img src={`/Imagens/Produtos/${p?.imagens[0]?.url_Imagem}`} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate ${txt}`}>{p.name}</p>
                              <p className={`text-[10px] ${sub}`}>{formatPrice(p.price_Unic)} · {p.id_category}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    {(Controller?.result.newCoupon.productIds || []).length > 0 && (
                      <p className="mt-2 text-brand-400 text-xs font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {(Controller?.result.newCoupon.productIds || []).length} produto{(Controller?.result.newCoupon.productIds || []).length > 1 ? 's' : ''} selecionado{(Controller?.result.newCoupon.productIds || []).length > 1 ? 's' : ''}
                      </p>
                    )}
                  </>
                )}
              </div>

            </div>
            {/* ===============================
             Resumo
          ================================ */}
            <div className={`pt-4 border-t ${bord}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${sub}`}>Resumo do Cupom</p>
              <div className={`rounded-xl border p-4 space-y-2 ${dk ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-surface-50 border-surface-100'}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-xs ${sub}`}>Código</span>
                  <span className={`text-xs font-bold ${txt}`}>{Controller?.result.newCoupon.cod_Cupom || '—'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-xs ${sub}`}>Nome</span>
                  <span className={`text-xs font-medium truncate max-w-[60%] text-right ${txt}`}>{Controller?.result.newCoupon.name_Cupom || '—'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-xs ${sub}`}>Desconto</span>
                  <span className="text-xs font-bold text-brand-400">
                    {Controller?.result.newCoupon.discount_Type === 2
                      ? 'Frete Grátis'
                      : Controller?.result.newCoupon.discount_Type === 1
                        ? formatPrice(Controller?.result.newCoupon.discount || 0)
                        : `${Controller?.result.newCoupon.discount || 0}%`}
                  </span>
                </div>
                {!!Controller?.result.newCoupon.minimum_Value && (
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-xs ${sub}`}>Compra mínima</span>
                    <span className={`text-xs font-medium ${txt}`}>{formatPrice(Controller?.result.newCoupon.minimum_Value)}</span>
                  </div>
                )}
                {!!Controller?.result.newCoupon.maximum_Discount && (
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-xs ${sub}`}>Desconto máximo</span>
                    <span className={`text-xs font-medium ${txt}`}>{formatPrice(Controller?.result.newCoupon.maximum_Discount)}</span>
                  </div>
                )}
                {!!Controller?.result.newCoupon.quantity_Uses && (
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-xs ${sub}`}>Usos totais</span>
                    <span className={`text-xs font-medium ${txt}`}>{Controller?.result.newCoupon.quantity_Uses}</span>
                  </div>
                )}
                {!!Controller?.result.newCoupon.per_User_Limit && (
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-xs ${sub}`}>Limite por cliente</span>
                    <span className={`text-xs font-medium ${txt}`}>{Controller?.result.newCoupon.per_User_Limit}</span>
                  </div>
                )}
                {Controller?.result.newCoupon.first_Order_Only && (
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-xs ${sub}`}>Restrição</span>
                    <span className={`text-xs font-medium ${txt}`}>Apenas primeira compra</span>
                  </div>
                )}
                {(Controller?.result.newCoupon.date_Start || Controller?.result.newCoupon.date_End) && (
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-xs ${sub}`}>Vigência</span>
                    <span className={`text-xs font-medium ${txt}`}>
                      {Controller?.result.newCoupon.date_Start || '...'} até {Controller?.result.newCoupon.date_End || '...'}
                    </span>
                  </div>
                )}
                {/* Aplicação */}
                <div className="space-y-3">

                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-xs ${sub}`}>Aplicação</span>

                    <span className={`text-xs font-semibold ${txt}`}>
                      {applicationScope === "store" && "Toda a Loja"}

                      {applicationScope === "categories" &&
                        `${Controller?.result.newCoupon.categoryIds?.length || 0} categoria(s)`}

                      {applicationScope === "products" &&
                        `${Controller?.result.newCoupon.productIds?.length || 0} produto(s)`}
                    </span>
                  </div>

                  {/* Categorias */}
                  {applicationScope === "categories" &&
                    (Controller?.result.newCoupon.categoryIds?.length ?? 0) > 0 && (

                      <div className="flex flex-wrap gap-2">

                        {Category.filter(c => Controller?.result.newCoupon.categoryIds?.some(cat => cat.id === c.id)
                        ).map(category => (

                          <span key={category.id} className={`px-3 py-1 rounded-full text-[11px] font-semibold${dk
                            ? "bg-brand-500/15 text-brand-300 border border-brand-500/30"
                            : "bg-brand-50 text-brand-600 border border-brand-200"
                            }`}
                          >
                            {category.category}
                          </span>

                        ))}

                      </div>

                    )}

                  {/* Produtos */}
                  {applicationScope === "products" &&
                    (Controller?.result.newCoupon.productIds?.length ?? 0) > 0 && (

                      <div className="space-y-2 max-h-52 overflow-y-auto">

                        {products.filter(p => Controller?.result.newCoupon.productIds?.some(Pro => Pro.id === p.id))
                          .map(product => (

                            <div
                              key={product.id}
                              className={`flex items-center gap-3 rounded-xl p-2 border ${dk
                                ? "bg-white/[0.03] border-white/[0.06]"
                                : "bg-white border-surface-100"
                                }`}
                            >

                              <img
                                src={`/Imagens/Produtos/${product?.imagens[0]?.url_Imagem}`}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold truncate ${txt}`}>
                                  {product.name}
                                </p>

                                <p className={`text-[10px] ${sub}`}>
                                  {formatPrice(product.price_Unic)}
                                </p>

                              </div>
                              {Controller?.result.newCoupon.discount_Type !== 2 && (
                                <div className="text-right">

                                  <p className="text-[10px] text-red-400 font-bold">

                                    {Controller?.result.newCoupon.discount_Type === 0
                                      ? `-${Controller?.result.newCoupon.discount}%`
                                      : `-${formatPrice(Controller?.result.newCoupon.discount || 0)}`}

                                  </p>

                                  {Controller?.result.newCoupon.discount_Type === 0 && (

                                    <p className="text-[10px] text-green-400">

                                      {formatPrice(
                                        product.price_Unic *
                                        (1 - (Controller?.result.newCoupon.discount || 0) / 100)
                                      )}

                                    </p>

                                  )}

                                </div>
                              )}

                            </div>

                          ))}

                      </div>

                    )}

                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-xs ${sub}`}>Status</span>
                  <span className={`text-xs font-bold ${Controller?.result.newCoupon.active ?? true ? 'text-green-400' : 'text-red-400'}`}>
                    {Controller?.result.newCoupon.active ?? true ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
            <div className={`pt-4 mt-2 border-t flex gap-3 ${bord}`}>
              <button
                onClick={() => {
                  Controller?.action.setShowCouponModal(false)
                  Controller?.action.setEditingCoupon(false);
                  Controller?.action.setNewCoupon({});
                  setApplicationScope("store");
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${dk ? 'bg-white/[0.06] text-white/60 hover:bg-white/[0.10]' : 'bg-surface-100 text-surface-500 hover:bg-surface-200'}`}>
                Cancelar
              </button>
              <button
                onClick={Controller?.result.editingCoupon ? Controller?.action.handleUpdateCoupon : Controller?.action.handleSaveCoupon}
                disabled={Controller?.result.Loading}
                className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-brand flex items-center justify-center gap-2"
              >
                {Controller?.result.Loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> {Controller?.result.editingCoupon ? 'Salvar' : 'Criar Cupom'}
                  </>
                )}

              </button>
            </div>
          </div>
        </div>
      )
      }

      <AdminPageLoading
        loading={Controller?.result.LoadingPageAll || false && user?.role === 'ADMIN'}
        message="Carregando painel"
        subMessage="Buscando pedidos, produtos e estatísticas..."
      />
      <ConfirmAdminPopup
        open={Controller?.result.showDeleteModal ?? false}
        title={Controller?.result.TitleCOnfirm}
        description={Controller?.result.DescriptionConfirm}
        confirmText={Controller?.result.ButtonConfirm}
        cancelText="Cancelar"
        confirmColor="red"
        loading={Controller?.result.Loading}
        onConfirm={Controller!.action.handleDeleteProduct}
        onCancel={() => {
          Controller?.action.setShowDeleteModal(false),
            Controller?.action.setNewProduct({});
        }}
      />

      <ConfirmAdminPopup
        open={Controller?.result.showDeleteModalCupom ?? false}
        title={Controller?.result.TitleCOnfirm}
        description={Controller?.result.DescriptionConfirm}
        confirmText={Controller?.result.ButtonConfirm}
        cancelText="Cancelar"
        confirmColor="red"
        loading={Controller?.result.Loading}
        onConfirm={() => Controller?.action.handleDeleteCoupon(idCupom)}
        onCancel={() => {
          Controller?.action.setshowDeleteModalCupom(false)
        }}
      />

      <ConfirmAdminPopup
        open={Controller?.result.showCouponModalActive ?? false}
        title={Controller?.result.TitleCOnfirm}
        description={Controller?.result.DescriptionConfirm}
        confirmText={Controller?.result.ButtonConfirm}
        cancelText="Cancelar"
        confirmColor="red"
        loading={Controller?.result.Loading}
        onConfirm={() => Controller?.action.handleUpdateActiveCoupon(idCupom)}
        onCancel={() => {
          Controller?.action.setShowCouponModalActive(false)
        }}
      />

      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )};
      {quickViewOrder && (
        <OrderQuickView order={quickViewOrder} onClose={() => setQuickViewOrder(null)} />
      )}
    </div >
  );
}
