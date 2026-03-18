import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, Package, ShoppingBag, Tag, Settings, LogOut,
  TrendingUp, TrendingDown, DollarSign, Bell, Search, Plus, Edit3,
  Trash2, Eye, X, Check, ChevronRight, BarChart2, ArrowUpRight,
  Zap, Shield, Store, User, Camera, Mail, Phone, MapPin,
  RefreshCw, AlertTriangle, Moon, Sun, ToggleLeft, ToggleRight, Menu
} from 'lucide-react';
import { useStore } from '../context/store';
import { formatPrice, orderStatusLabels, orderStatusColors, categoryLabels, badgeLabels } from '../utils';
import { Product, OrderStatus, Promotion } from '../types';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'promotions' | 'profile' | 'settings';

function MiniBarChart({ data, color = '#f97316' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const w = 280, h = 72, pad = 3;
  const bw = (w - pad * (data.length + 1)) / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      {data.map((v, i) => {
        const bh = Math.max(3, (v / max) * (h - 6));
        return <rect key={i} x={pad + i * (bw + pad)} y={h - bh} width={bw} height={bh} rx="3" fill={color} opacity={i === data.length - 1 ? 1 : 0.4} />;
      })}
    </svg>
  );
}

function MiniLineChart({ data, color = '#f97316' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const w = 280, h = 72;
  if (data.length < 2) return null;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min + 1)) * (h - 10) - 5;
    return `${x},${y}`;
  });
  const fillD = `M ${pts[0]} L ${pts.join(' L ')} L ${w},${h} L 0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      <path d={fillD} fill={color} opacity="0.12" />
      <path d={`M ${pts.join(' L ')}`} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        if (i !== data.length - 1) return null;
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / (max - min + 1)) * (h - 10) - 5;
        return <circle key={i} cx={x} cy={y} r="4" fill={color} />;
      })}
    </svg>
  );
}

function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const r = 46, cx = 58, cy = 58, strokeW = 14;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 116 116" width={116} height={116}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeW} />
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circumference;
        const gap = circumference - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={strokeW}
            strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset} strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
        );
        offset += dash; return el;
      })}
      <text x={cx} y={cy + 4} textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">{total}</text>
      <text x={cx} y={cy + 15} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8">pedidos</text>
    </svg>
  );
}

export default function AdminPage() {
  const {
    products, orders, promotions, user, darkMode, toggleDarkMode,
    updateOrderStatus, deleteProduct, addProduct, updateProduct,
    addPromotion, updatePromotion, deletePromotion, togglePromotion,
    applyPromoToProduct, navigateTo, logout, updateUser, showNotification
  } = useStore();

  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', bio: user?.bio || '' });
  const [settingsForm, setSettingsForm] = useState({
    storeName: 'Mercado Craibas', slogan: 'O melhor marketplace de Craibas',
    primaryColor: '#f97316', freeShippingAbove: '299', baseShipping: '19.90', deliveryDays: '3-5',
    twoFactor: false, sessionTimeout: '30',
  });

  const blankProduct: Partial<Product> = {
    name: '', price: 0, originalPrice: undefined, category: 'eletronicos', stock: 0,
    images: ['https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=600'],
    description: '', rating: 4.5, reviewCount: 0, sold: 0, freeShipping: false, variations: [], tags: [], featured: false,
  };
  const [newProduct, setNewProduct] = useState<Partial<Product>>(blankProduct);

  const blankPromo: Partial<Promotion> = {
    title: '', description: '', discount: 10, code: '', minValue: 0,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), active: true, productIds: [], type: 'percent',
  };
  const [newPromo, setNewPromo] = useState<Partial<Promotion>>(blankPromo);

  const totalRevenue = orders.filter(o => o.status !== 'cancelado').reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => ['confirmado', 'preparando', 'saiu_entrega'].includes(o.status)).length;
  const deliveredOrders = orders.filter(o => o.status === 'entregue').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelado').length;
  const lowStock = products.filter(p => p.stock < 20).length;

  const revenueData = [3200, 4100, 3800, 5200, 4800, 6100, Math.max(1000, Math.round(totalRevenue / 10))];
  const ordersData = [8, 12, 10, 15, 13, 17, Math.max(1, orders.length)];
  const viewsData = [120, 180, 150, 220, 195, 260, 310];
  const orderDonut = [
    { value: deliveredOrders, color: '#22c55e', label: 'Entregues' },
    { value: pendingOrders, color: '#f97316', label: 'Ativos' },
    { value: cancelledOrders, color: '#ef4444', label: 'Cancelados' },
  ];
  const catCounts = Object.entries(categoryLabels).map(([k, v]) => ({ name: v, count: products.filter(p => p.category === k).length, key: k }));

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase())
  );
  const filteredOrders = orders.filter(o => {
    const ms = o.id.toLowerCase().includes(orderSearch.toLowerCase());
    const mst = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return ms && mst;
  });

  const handleSaveProduct = () => {
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...newProduct } as Product);
      showNotification('Produto atualizado! Já visível na loja.', 'success');
    } else {
      addProduct({ ...blankProduct, ...newProduct, id: `p${Date.now()}` } as Product);
      showNotification('Produto criado! Já aparece para clientes.', 'success');
    }
    setShowProductModal(false); setEditingProduct(null); setNewProduct(blankProduct);
  };

  const handleSavePromo = () => {
    const promo: Promotion = {
      ...blankPromo, ...newPromo,
      id: editingPromo ? editingPromo.id : `promo-${Date.now()}`,
      validUntil: newPromo.validUntil instanceof Date ? newPromo.validUntil : new Date(newPromo.validUntil as any),
    } as Promotion;
    if (editingPromo) { updatePromotion(promo); if (promo.productIds?.length) promo.productIds.forEach(pid => applyPromoToProduct(pid, promo.discount)); showNotification('Promoção atualizada!', 'success'); }
    else addPromotion(promo);
    setShowPromoModal(false); setEditingPromo(null); setNewPromo(blankPromo);
  };

  const openEditProduct = (p: Product) => { setEditingProduct(p); setNewProduct({ ...p }); setShowProductModal(true); };
  const openEditPromo = (pr: Promotion) => { setEditingPromo(pr); setNewPromo({ ...pr }); setShowPromoModal(true); };

  const dk = darkMode;
  const bg     = dk ? 'bg-[#0a0a0f]' : 'bg-[#f0f0f5]';
  const sidebar = dk ? 'bg-[#0d0d14] border-white/[0.06]' : 'bg-white border-surface-200';
  const card   = dk ? 'bg-[#0d0d14] border-white/[0.06]' : 'bg-white border-surface-200';
  const cardH  = dk ? 'hover:border-white/[0.12]' : 'hover:border-brand-200';
  const topb   = dk ? 'bg-[#0d0d14] border-white/[0.06]' : 'bg-white border-surface-200';
  const txt    = dk ? 'text-white' : 'text-surface-900';
  const txt2   = dk ? 'text-white/60' : 'text-surface-500';
  const sub    = dk ? 'text-white/35' : 'text-surface-400';
  const inp    = dk ? 'bg-[#0a0a0f] border-white/[0.08] text-white placeholder:text-white/20 focus:border-brand-400' : 'bg-surface-50 border-surface-200 text-surface-800 focus:border-brand-400';
  const div_   = dk ? 'divide-white/[0.06]' : 'divide-surface-100';
  const bord   = dk ? 'border-white/[0.06]' : 'border-surface-100';
  const rowH   = dk ? 'hover:bg-white/[0.02]' : 'hover:bg-surface-50';

  const navGroups = [
    { label: 'Principal', items: [
      { id: 'dashboard',  label: 'Dashboard',    icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'products',   label: 'Produtos',     icon: <Package className="w-4 h-4" />, badge: lowStock > 0 ? `${lowStock} baixo` : undefined, badgeRed: true },
      { id: 'orders',     label: 'Pedidos',      icon: <ShoppingBag className="w-4 h-4" />, badge: pendingOrders > 0 ? String(pendingOrders) : undefined, badgeRed: false },
      { id: 'promotions', label: 'Promoções',    icon: <Tag className="w-4 h-4" /> },
    ]},
    { label: 'Conta', items: [
      { id: 'profile',  label: 'Perfil',        icon: <User className="w-4 h-4" /> },
      { id: 'settings', label: 'Configurações', icon: <Settings className="w-4 h-4" /> },
    ]},
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                  tab === item.id ? 'bg-brand-500 text-white shadow-brand' : `${txt2} ${dk ? 'hover:bg-white/[0.06]' : 'hover:bg-surface-50'} hover:${txt}`
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
        <button onClick={() => { setSidebarOpen(false); navigateTo('home'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${txt2} ${dk ? 'hover:bg-white/[0.06]' : 'hover:bg-surface-50'}`}>
          <Store className="w-4 h-4" /> Ver Loja
        </button>
        <button onClick={() => { logout(); navigateTo('home'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-red-400 hover:bg-red-500/10">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </>
  );

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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: 'Receita Total', value: formatPrice(totalRevenue), icon: <DollarSign className="w-5 h-5"/>, change: '+12.5%', up: true, color: '#22c55e', data: revenueData },
                  { label: 'Total Pedidos', value: orders.length, icon: <ShoppingBag className="w-5 h-5"/>, change: '+8.2%', up: true, color: '#3b82f6', data: ordersData },
                  { label: 'Pedidos Ativos', value: pendingOrders, icon: <RefreshCw className="w-5 h-5"/>, change: '-3.1%', up: false, color: '#f59e0b', data: viewsData },
                  { label: 'Produtos', value: products.length, icon: <Package className="w-5 h-5"/>, change: '+2.4%', up: true, color: '#a855f7', data: [5,8,10,12,14,15,products.length] },
                ].map((m, i) => (
                  <div key={i} className={`rounded-2xl border p-4 md:p-5 transition-all ${card} ${cardH} overflow-hidden`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: m.color, boxShadow: `0 4px 12px ${m.color}40` }}>{m.icon}</div>
                      <span className={`flex items-center gap-1 text-xs font-bold ${m.up ? 'text-green-400' : 'text-red-400'}`}>
                        {m.up ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>} {m.change}
                      </span>
                    </div>
                    <p className={`font-display font-bold text-xl md:text-2xl leading-none ${txt}`}>{m.value}</p>
                    <p className={`text-xs mt-1.5 ${sub}`}>{m.label}</p>
                    <div className="mt-3 opacity-60"><MiniBarChart data={m.data} color={m.color} /></div>
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
                    <span className="text-green-400 text-xs font-bold flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12.5%</span>
                  </div>
                  <MiniLineChart data={revenueData} color="#f97316" />
                  <div className={`flex justify-between mt-2 text-[10px] ${sub}`}>
                    {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d => <span key={d}>{d}</span>)}
                  </div>
                </div>
                <div className={`rounded-2xl border p-4 md:p-5 ${card} flex flex-col`}>
                  <h3 className={`font-display font-bold text-sm ${txt} mb-4`}>Status dos Pedidos</h3>
                  <div className="flex items-center gap-3 flex-1">
                    <DonutChart segments={orderDonut} />
                    <div className="space-y-2 flex-1">
                      {orderDonut.map((seg, i) => (
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
                <div className={`rounded-2xl border p-4 md:p-5 ${card}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-display font-bold text-sm ${txt}`}>Pedidos por Dia</h3>
                    <span className="text-blue-400 text-xs font-bold">{orders.length} total</span>
                  </div>
                  <MiniBarChart data={ordersData} color="#3b82f6" />
                  <div className={`flex justify-between mt-2 text-[10px] ${sub}`}>
                    {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d => <span key={d}>{d}</span>)}
                  </div>
                </div>
                <div className={`rounded-2xl border p-4 md:p-5 ${card}`}>
                  <h3 className={`font-display font-bold text-sm ${txt} mb-4`}>Distribuição por Categoria</h3>
                  <div className="space-y-2.5">
                    {catCounts.map((c, i) => {
                      const pct = products.length > 0 ? Math.round((c.count / products.length) * 100) : 0;
                      const colors = ['#f97316', '#3b82f6', '#a855f7', '#ef4444'];
                      return (
                        <div key={i}>
                          <div className="flex justify-between mb-1">
                            <span className={`text-xs ${txt2}`}>{c.name}</span>
                            <span className={`text-xs font-bold ${txt}`}>{c.count} · {pct}%</span>
                          </div>
                          <div className={`h-1.5 rounded-full ${dk ? 'bg-white/[0.06]' : 'bg-surface-100'} overflow-hidden`}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[i] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
                <div className={`rounded-2xl border overflow-hidden ${card}`}>
                  <div className={`flex items-center justify-between p-4 border-b ${bord}`}>
                    <div className="flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-brand-400"/><h3 className={`font-display font-bold text-sm ${txt}`}>Pedidos Recentes</h3></div>
                    <button onClick={() => setTab('orders')} className="text-brand-400 text-xs font-medium flex items-center gap-1">Ver todos <ArrowUpRight className="w-3 h-3"/></button>
                  </div>
                  <div className={`divide-y ${div_}`}>
                    {orders.slice(0, 5).map(o => (
                      <div key={o.id} className={`flex items-center gap-3 px-4 py-3 ${rowH} transition-colors`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${dk ? 'bg-white/[0.06]' : 'bg-surface-100'}`}>
                          <ShoppingBag className={`w-3.5 h-3.5 ${sub}`}/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${txt}`}>#{o.id}</p>
                          <p className={`text-[10px] ${sub}`}>{o.items.reduce((s, i) => s + i.quantity, 0)} itens · {o.createdAt.toLocaleDateString('pt-BR')}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${orderStatusColors[o.status]}`}>{orderStatusLabels[o.status]}</span>
                        <p className="text-brand-400 text-xs font-bold ml-1 flex-shrink-0">{formatPrice(o.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`rounded-2xl border overflow-hidden ${card}`}>
                  <div className={`flex items-center justify-between p-4 border-b ${bord}`}>
                    <div className="flex items-center gap-2"><BarChart2 className="w-4 h-4 text-brand-400"/><h3 className={`font-display font-bold text-sm ${txt}`}>Top Produtos</h3></div>
                    <button onClick={() => setTab('products')} className="text-brand-400 text-xs font-medium flex items-center gap-1">Ver todos <ArrowUpRight className="w-3 h-3"/></button>
                  </div>
                  <div className="p-4 space-y-3">
                    {[...products].sort((a, b) => b.sold - a.sold).slice(0, 5).map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className={`w-5 text-center text-xs font-bold ${sub}`}>#{i+1}</span>
                        <img src={p.images[0]} alt="" className={`w-9 h-9 rounded-xl object-cover flex-shrink-0 border ${dk ? 'border-white/10' : 'border-surface-200'}`}/>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${txt}`}>{p.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className={`flex-1 h-1 rounded-full ${dk ? 'bg-white/[0.06]' : 'bg-surface-100'} overflow-hidden`}>
                              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(100, (p.sold/20000)*100)}%` }}/>
                            </div>
                            <span className={`text-[10px] flex-shrink-0 ${sub}`}>{p.sold.toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                        <p className="text-brand-400 text-xs font-bold flex-shrink-0">{formatPrice(p.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {lowStock > 0 && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-5 h-5 text-red-400"/></div>
                  <div className="flex-1">
                    <p className="text-red-400 font-bold text-sm">{lowStock} produto{lowStock>1?'s':''} com estoque crítico (&lt;20 unid.)</p>
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
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`}/>
                  <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Buscar produtos..."
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${inp}`}/>
                </div>
                <button onClick={() => { setEditingProduct(null); setNewProduct(blankProduct); setShowProductModal(true); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold transition-all shadow-brand">
                  <Plus className="w-4 h-4"/> Novo
                </button>
              </div>
              <div className={`rounded-2xl border overflow-hidden ${card}`}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead><tr className={`border-b ${bord}`}>
                      {['Produto','Cat.','Preço','Promoção','Estoque','Vendidos','Ações'].map(h => (
                        <th key={h} className={`px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${sub}`}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {filteredProducts.map(p => {
                        const hasPromo = p.originalPrice && p.originalPrice > p.price;
                        const discPct = hasPromo ? Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100) : 0;
                        return (
                          <tr key={p.id} className={`border-b ${bord} ${rowH} transition-colors`}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img src={p.images[0]} alt="" className={`w-10 h-10 rounded-xl object-cover flex-shrink-0 border ${dk ? 'border-white/10' : 'border-surface-200'}`}/>
                                <div className="min-w-0">
                                  <p className={`text-sm font-medium truncate max-w-[140px] ${txt}`}>{p.name}</p>
                                  {p.badge && <span className="text-[10px] font-bold text-brand-400">{badgeLabels[p.badge]}</span>}
                                </div>
                              </div>
                            </td>
                            <td className={`px-4 py-3 text-xs capitalize ${sub}`}>{p.category}</td>
                            <td className="px-4 py-3">
                              <p className="text-brand-400 font-bold text-sm">{formatPrice(p.price)}</p>
                              {hasPromo && <p className={`text-[10px] line-through ${sub}`}>{formatPrice(p.originalPrice!)}</p>}
                            </td>
                            <td className="px-4 py-3">
                              {hasPromo ? (
                                <div>
                                  <span className="bg-red-500/15 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">-{discPct}%</span>
                                  <p className={`text-[10px] mt-0.5 ${sub}`}>-{formatPrice(p.originalPrice! - p.price)}</p>
                                </div>
                              ) : <span className={`text-[10px] ${sub}`}>—</span>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-sm font-bold ${p.stock < 20 ? 'text-red-400' : p.stock < 50 ? 'text-amber-400' : 'text-green-400'}`}>{p.stock}</span>
                              {p.stock < 20 && <span className="ml-1 text-[10px] text-red-400/60">⚠</span>}
                            </td>
                            <td className={`px-4 py-3 text-sm ${txt2}`}>{p.sold.toLocaleString('pt-BR')}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button onClick={() => navigateTo('product', p.id)} className={`p-1.5 rounded-lg transition-all ${txt2} hover:text-blue-400 ${dk ? 'hover:bg-blue-500/10' : 'hover:bg-blue-50'}`}><Eye className="w-3.5 h-3.5"/></button>
                                <button onClick={() => openEditProduct(p)} className={`p-1.5 rounded-lg transition-all ${txt2} hover:text-brand-400 ${dk ? 'hover:bg-brand-500/10' : 'hover:bg-brand-50'}`}><Edit3 className="w-3.5 h-3.5"/></button>
                                <button onClick={() => deleteProduct(p.id)} className={`p-1.5 rounded-lg transition-all ${txt2} hover:text-red-400 ${dk ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}><Trash2 className="w-3.5 h-3.5"/></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ─── ORDERS ─── */}
          {tab === 'orders' && (
            <>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`}/>
                  <input value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="Buscar por ID..."
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${inp}`}/>
                </div>
                <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}
                  className={`px-4 py-2.5 border rounded-xl text-sm outline-none ${inp}`}>
                  <option value="all">Todos</option>
                  {Object.entries(orderStatusLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[{v:'all',l:'Todos',n:orders.length},{v:'confirmado',l:'Confirmados',n:orders.filter(o=>o.status==='confirmado').length},{v:'preparando',l:'Preparando',n:orders.filter(o=>o.status==='preparando').length},{v:'saiu_entrega',l:'Em Rota',n:orders.filter(o=>o.status==='saiu_entrega').length},{v:'entregue',l:'Entregues',n:orders.filter(o=>o.status==='entregue').length}].map(s => (
                  <button key={s.v} onClick={() => setOrderStatusFilter(s.v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${orderStatusFilter===s.v ? 'bg-brand-500 text-white shadow-brand' : `${txt2} border ${bord} ${dk?'bg-white/[0.04] hover:bg-white/[0.08]':'bg-white hover:bg-surface-50'}`}`}>
                    {s.l} <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${orderStatusFilter===s.v?'bg-white/25':dk?'bg-white/10':'bg-surface-100'}`}>{s.n}</span>
                  </button>
                ))}
              </div>
              <div className={`rounded-2xl border overflow-hidden ${card}`}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead><tr className={`border-b ${bord}`}>
                      {['Pedido','Itens','Total','Status','Data','Atualizar'].map(h => (
                        <th key={h} className={`px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${sub}`}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {filteredOrders.map(o => (
                        <tr key={o.id} className={`border-b ${bord} ${rowH} transition-colors`}>
                          <td className={`px-4 py-3 font-bold text-sm ${txt}`}>#{o.id}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {o.items.slice(0,3).map((item,i) => (
                                <img key={i} src={item.product.images[0]} alt="" className={`w-7 h-7 rounded-lg object-cover border ${dk?'border-white/10':'border-surface-200'}`}/>
                              ))}
                              {o.items.length > 3 && <span className={`text-[10px] ${sub}`}>+{o.items.length-3}</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-brand-400 font-bold text-sm">{formatPrice(o.total)}</td>
                          <td className="px-4 py-3"><span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${orderStatusColors[o.status]}`}>{orderStatusLabels[o.status]}</span></td>
                          <td className={`px-4 py-3 text-xs ${sub}`}>{o.createdAt.toLocaleDateString('pt-BR')}</td>
                          <td className="px-4 py-3">
                            <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                              className={`text-xs rounded-lg px-2.5 py-1.5 outline-none border transition-colors ${inp}`}>
                              {Object.entries(orderStatusLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ─── PROMOTIONS ─── */}
          {tab === 'promotions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`font-display font-bold text-lg ${txt}`}>Promoções & Cupons</h2>
                  <p className={`text-xs mt-0.5 ${sub}`}>{promotions.filter(p=>p.active).length} ativas</p>
                </div>
                <button onClick={() => { setEditingPromo(null); setNewPromo(blankPromo); setShowPromoModal(true); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold transition-all shadow-brand">
                  <Plus className="w-4 h-4"/> Nova Promoção
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promotions.map(promo => {
                  const linked = products.filter(p => promo.productIds?.includes(p.id));
                  const grads = ['linear-gradient(145deg,#1e3a8a,#3730a3)','linear-gradient(145deg,#0e7490,#0f766e)','linear-gradient(145deg,#9a3412,#c2410c)','linear-gradient(145deg,#6d28d9,#7c3aed)'];
                  return (
                    <div key={promo.id} className={`relative overflow-hidden rounded-2xl ${promo.active?'':'opacity-60'}`} style={{ background: grads[promotions.indexOf(promo) % grads.length] }}>
                      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10"/>
                      <div className="p-5 relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className="bg-white/15 border border-white/20 rounded-xl px-3 py-1.5">
                            <span className="text-white font-display font-bold text-lg tracking-widest">{promo.code}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${promo.active?'bg-green-400/20 text-green-300 border-green-400/30':'bg-red-400/20 text-red-300 border-red-400/30'}`}>
                            {promo.active?'Ativa':'Pausada'}
                          </span>
                        </div>
                        <p className="text-white font-display font-bold text-3xl leading-none mb-1">{promo.discount}% OFF</p>
                        <p className="text-white/75 text-sm mb-3">{promo.description}</p>
                        {promo.minValue ? <p className="text-white/50 text-xs mb-2">Mín. {formatPrice(promo.minValue)}</p> : null}
                        <p className="text-white/40 text-xs mb-3">Vence: {(promo.validUntil instanceof Date ? promo.validUntil : new Date(promo.validUntil)).toLocaleDateString('pt-BR')}</p>
                        {linked.length > 0 && (
                          <div className="mb-3">
                            <p className="text-white/50 text-[10px] mb-1.5 uppercase tracking-wider">Produtos com desconto</p>
                            <div className="flex gap-1.5 flex-wrap">
                              {linked.slice(0,4).map(p => (
                                <div key={p.id} className="flex items-center gap-1 bg-white/15 rounded-lg px-2 py-1">
                                  <img src={p.images[0]} alt="" className="w-5 h-5 rounded object-cover"/>
                                  <span className="text-white text-[10px] font-medium max-w-[80px] truncate">{p.name}</span>
                                </div>
                              ))}
                              {linked.length > 4 && <span className="text-white/50 text-[10px] self-center">+{linked.length-4}</span>}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button onClick={() => togglePromotion(promo.id)} className="flex-1 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-lg border border-white/20 transition-all">{promo.active?'Pausar':'Ativar'}</button>
                          <button onClick={() => openEditPromo(promo)} className="flex-1 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-lg border border-white/20 transition-all">Editar</button>
                          <button onClick={() => deletePromotion(promo.id)} className="px-3 py-1.5 bg-red-500/30 hover:bg-red-500/50 text-white text-xs font-bold rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => { setEditingPromo(null); setNewPromo(blankPromo); setShowPromoModal(true); }}
                  className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 min-h-[180px] transition-all ${dk?'border-white/[0.10] text-white/30 hover:border-brand-400 hover:text-brand-400':'border-surface-200 text-surface-300 hover:border-brand-400 hover:text-brand-500'}`}>
                  <Plus className="w-8 h-8"/><span className="font-display font-bold text-sm">Nova Promoção</span>
                </button>
              </div>
              {/* Products with promos */}
              <div>
                <h3 className={`font-display font-bold text-base mb-3 ${txt}`}>Produtos em Promoção</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {products.filter(p => p.originalPrice && p.originalPrice > p.price).map(p => {
                    const d = Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100);
                    return (
                      <div key={p.id} className={`rounded-2xl border p-4 flex items-center gap-3 ${card} ${cardH}`}>
                        <img src={p.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0"/>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${txt}`}>{p.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] line-through ${sub}`}>{formatPrice(p.originalPrice!)}</span>
                            <span className="text-brand-400 font-bold text-sm">{formatPrice(p.price)}</span>
                          </div>
                        </div>
                        <div className="bg-red-500/15 border border-red-500/20 rounded-xl px-2.5 py-1.5 text-center flex-shrink-0">
                          <p className="text-red-400 font-display font-bold text-base leading-none">-{d}%</p>
                          <p className={`text-[9px] ${sub}`}>desconto</p>
                        </div>
                      </div>
                    );
                  })}
                  {products.filter(p => p.originalPrice && p.originalPrice > p.price).length === 0 && (
                    <p className={`text-sm ${sub} py-4 col-span-3`}>Nenhum produto com promoção ativa ainda.</p>
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
                  <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}/>
                </div>
                <div className="px-6 pb-6">
                  <div className="flex items-end gap-4 -mt-10 mb-5 flex-wrap">
                    <div className="relative">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center border-4 shadow-xl ${dk?'border-[#0d0d14]':'border-white'}`}>
                        <span className="text-white font-display font-bold text-3xl">{user?.name?.[0]||'A'}</span>
                      </div>
                      <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-500 hover:bg-brand-600 rounded-xl flex items-center justify-center shadow"><Camera className="w-3.5 h-3.5 text-white"/></button>
                    </div>
                    <div className="mb-1 flex-1 min-w-0">
                      <h2 className={`font-display font-bold text-xl ${txt}`}>{user?.name||'Admin Master'}</h2>
                      <p className="text-brand-400 text-sm font-semibold">Administrador</p>
                    </div>
                    <button onClick={() => editingProfile ? (updateUser({ name: profileForm.name, email: profileForm.email, phone: profileForm.phone, bio: profileForm.bio }), setEditingProfile(false), showNotification('Perfil atualizado!','success')) : setEditingProfile(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl transition-all mb-1">
                      {editingProfile ? <><Check className="w-4 h-4"/> Salvar</> : <><Edit3 className="w-4 h-4"/> Editar</>}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[{l:'Pedidos',v:orders.length},{l:'Produtos',v:products.length},{l:'Promoções',v:promotions.filter(p=>p.active).length}].map((s,i) => (
                      <div key={i} className={`rounded-xl p-3 text-center ${dk?'bg-white/[0.04]':'bg-surface-50'}`}>
                        <p className={`font-bold text-lg leading-none ${txt}`}>{s.v}</p>
                        <p className={`text-[10px] mt-1 ${sub}`}>{s.l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {icon:<User className="w-4 h-4"/>,label:'Nome',key:'name',val:user?.name||''},
                      {icon:<Mail className="w-4 h-4"/>,label:'Email',key:'email',val:user?.email||''},
                      {icon:<Phone className="w-4 h-4"/>,label:'Telefone',key:'phone',val:user?.phone||''},
                      {icon:<MapPin className="w-4 h-4"/>,label:'Localização',key:'_loc',val:'Craibas, AL'},
                    ].map(f => (
                      <div key={f.key} className={`rounded-xl p-3.5 flex items-center gap-3 ${dk?'bg-white/[0.04]':'bg-surface-50'}`}>
                        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 flex-shrink-0">{f.icon}</div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[10px] uppercase tracking-wider font-bold ${sub} mb-0.5`}>{f.label}</p>
                          {editingProfile && !f.key.startsWith('_') ? (
                            <input value={(profileForm as any)[f.key]||f.val} onChange={e => setProfileForm(p=>({...p,[f.key]:e.target.value}))}
                              className={`w-full text-xs py-1 px-2 rounded-lg border focus:outline-none focus:border-brand-400 transition-colors ${inp}`}/>
                          ) : (
                            <p className={`text-sm font-medium truncate ${txt}`}>{f.key.startsWith('_') ? f.val : (profileForm as any)[f.key]||f.val||'—'}</p>
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
                <h3 className={`font-display font-bold mb-5 flex items-center gap-2 ${txt}`}><Store className="w-4 h-4 text-brand-400"/> Aparência da Loja</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[{label:'Nome da Loja',key:'storeName'},{label:'Slogan',key:'slogan'}].map(f => (
                    <div key={f.key}>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>{f.label}</label>
                      <input value={(settingsForm as any)[f.key]} onChange={e => setSettingsForm(s=>({...s,[f.key]:e.target.value}))}
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${inp}`}/>
                    </div>
                  ))}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Cor Primária</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settingsForm.primaryColor} onChange={e => setSettingsForm(s=>({...s,primaryColor:e.target.value}))} className="w-10 h-10 rounded-xl border-2 border-surface-200 cursor-pointer p-0.5"/>
                      <span className={`text-sm font-mono ${txt}`}>{settingsForm.primaryColor}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div><p className={`text-sm font-medium ${txt}`}>Modo Escuro</p><p className={`text-xs ${sub}`}>Ativar tema escuro global</p></div>
                    <button onClick={toggleDarkMode}>{darkMode ? <ToggleRight className="w-9 h-9 text-brand-500"/> : <ToggleLeft className="w-9 h-9 text-surface-300"/>}</button>
                  </div>
                </div>
              </div>
              <div className={`rounded-2xl border p-6 ${card}`}>
                <h3 className={`font-display font-bold mb-5 flex items-center gap-2 ${txt}`}><Package className="w-4 h-4 text-brand-400"/> Frete</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[{label:'Frete Grátis Acima (R$)',key:'freeShippingAbove'},{label:'Taxa Base (R$)',key:'baseShipping'},{label:'Prazo (dias úteis)',key:'deliveryDays'}].map(f => (
                    <div key={f.key}>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>{f.label}</label>
                      <input value={(settingsForm as any)[f.key]} onChange={e => setSettingsForm(s=>({...s,[f.key]:e.target.value}))}
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${inp}`}/>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`rounded-2xl border p-6 ${card}`}>
                <h3 className={`font-display font-bold mb-5 flex items-center gap-2 ${txt}`}><Shield className="w-4 h-4 text-brand-400"/> Segurança</h3>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between p-4 rounded-xl ${dk?'bg-white/[0.04]':'bg-surface-50'}`}>
                    <div><p className={`font-medium text-sm ${txt}`}>2FA</p><p className={`text-xs ${sub}`}>Autenticação em 2 etapas</p></div>
                    <button onClick={() => setSettingsForm(s=>({...s,twoFactor:!s.twoFactor}))}>
                      {settingsForm.twoFactor ? <ToggleRight className="w-9 h-9 text-green-400"/> : <ToggleLeft className="w-9 h-9 text-surface-300"/>}
                    </button>
                  </div>
                  <div className={`flex items-center justify-between p-4 rounded-xl ${dk?'bg-white/[0.04]':'bg-surface-50'}`}>
                    <div><p className={`font-medium text-sm ${txt}`}>Timeout de Sessão (min)</p><p className={`text-xs ${sub}`}>Deslogar após inatividade</p></div>
                    <input value={settingsForm.sessionTimeout} onChange={e => setSettingsForm(s=>({...s,sessionTimeout:e.target.value}))}
                      className={`w-20 px-3 py-1.5 border rounded-xl text-sm text-right outline-none ${inp}`}/>
                  </div>
                </div>
              </div>
              <button onClick={() => showNotification('Configurações salvas!','success')}
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-brand">
                <Check className="w-4 h-4"/> Salvar Configurações
              </button>
            </div>
          )}

        </main>
      </div>

      {/* ─── PRODUCT MODAL ─── */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowProductModal(false)}>
          <div className={`rounded-2xl border p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl ${card}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`font-display font-bold text-lg ${txt}`}>{editingProduct?'Editar Produto':'Novo Produto'}</h3>
              <button onClick={() => setShowProductModal(false)} className={`p-2 rounded-xl ${txt2} ${dk?'hover:bg-white/[0.08]':'hover:bg-surface-100'}`}><X className="w-4 h-4"/></button>
            </div>
            <div className="space-y-4">
              <div><label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Nome</label><input value={newProduct.name||''} onChange={e => setNewProduct(p=>({...p,name:e.target.value}))} placeholder="Nome do produto" className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${inp}`}/></div>
              <div className="grid grid-cols-2 gap-3">
                {[{label:'Preço (R$)',key:'price',type:'number'},{label:'Preço Original (R$)',key:'originalPrice',type:'number'},{label:'Estoque',key:'stock',type:'number'}].map(f => (
                  <div key={f.key}><label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>{f.label}</label><input type={f.type} value={(newProduct as any)[f.key]||''} onChange={e => setNewProduct(p=>({...p,[f.key]:Number(e.target.value)}))} className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${inp}`}/></div>
                ))}
                <div><label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Categoria</label>
                  <select value={newProduct.category||'eletronicos'} onChange={e => setNewProduct(p=>({...p,category:e.target.value as any}))} className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${inp}`}>
                    {Object.entries(categoryLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div><label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Descrição</label><textarea value={newProduct.description||''} onChange={e => setNewProduct(p=>({...p,description:e.target.value}))} rows={3} className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors resize-none ${inp}`}/></div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${txt2}`}>Em Destaque?</span>
                <button onClick={() => setNewProduct(p=>({...p,featured:!p.featured}))}>{newProduct.featured?<ToggleRight className="w-8 h-8 text-brand-500"/>:<ToggleLeft className="w-8 h-8 text-surface-300"/>}</button>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${txt2}`}>Frete Grátis?</span>
                <button onClick={() => setNewProduct(p=>({...p,freeShipping:!p.freeShipping}))}>{newProduct.freeShipping?<ToggleRight className="w-8 h-8 text-green-500"/>:<ToggleLeft className="w-8 h-8 text-surface-300"/>}</button>
              </div>
              <div className={`pt-4 border-t flex gap-3 ${bord}`}>
                <button onClick={() => setShowProductModal(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${dk?'bg-white/[0.06] text-white/60 hover:bg-white/[0.10]':'bg-surface-100 text-surface-500 hover:bg-surface-200'}`}>Cancelar</button>
                <button onClick={handleSaveProduct} className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold shadow-brand flex items-center justify-center gap-2">
                  <Check className="w-4 h-4"/> {editingProduct?'Salvar':'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── PROMO MODAL ─── */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPromoModal(false)}>
          <div className={`rounded-2xl border p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl ${card}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`font-display font-bold text-lg ${txt}`}>{editingPromo?'Editar Promoção':'Nova Promoção'}</h3>
              <button onClick={() => setShowPromoModal(false)} className={`p-2 rounded-xl ${txt2} ${dk?'hover:bg-white/[0.08]':'hover:bg-surface-100'}`}><X className="w-4 h-4"/></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Código</label><input value={newPromo.code||''} onChange={e => setNewPromo(p=>({...p,code:e.target.value.toUpperCase().replace(/\s/g,'')}))} placeholder="EX: VERAO30" className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none uppercase ${inp}`}/></div>
                <div><label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Desconto (%)</label><input type="number" min="1" max="100" value={newPromo.discount||''} onChange={e => setNewPromo(p=>({...p,discount:Number(e.target.value)}))} className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none ${inp}`}/></div>
                <div><label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Título</label><input value={newPromo.title||''} onChange={e => setNewPromo(p=>({...p,title:e.target.value}))} placeholder="Semana Tech" className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none ${inp}`}/></div>
                <div><label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Valor Mínimo (R$)</label><input type="number" value={newPromo.minValue||''} onChange={e => setNewPromo(p=>({...p,minValue:Number(e.target.value)}))} placeholder="0" className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none ${inp}`}/></div>
              </div>
              <div><label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Descrição</label><input value={newPromo.description||''} onChange={e => setNewPromo(p=>({...p,description:e.target.value}))} placeholder="Ex: 30% OFF em eletrônicos" className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none ${inp}`}/></div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}>Aplicar em Produtos</label>
                <p className={`text-xs mb-3 ${sub}`}>Produtos selecionados terão o desconto aplicado automaticamente no preço.</p>
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                  {products.map(p => {
                    const sel = (newPromo.productIds||[]).includes(p.id);
                    return (
                      <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${sel ? (dk?'bg-brand-500/15 border-brand-500/30':'bg-brand-50 border-brand-200') : (dk?'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06]':'bg-surface-50 hover:bg-surface-100 border-surface-100')}`}>
                        <input type="checkbox" checked={sel} onChange={e => {
                          const ids = e.target.checked ? [...(newPromo.productIds||[]),p.id] : (newPromo.productIds||[]).filter(id => id!==p.id);
                          setNewPromo(pr=>({...pr,productIds:ids}));
                        }} className="accent-brand-500 w-4 h-4 flex-shrink-0"/>
                        <img src={p.images[0]} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0"/>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${txt}`}>{p.name}</p>
                          <p className={`text-[10px] ${sub}`}>{formatPrice(p.price)} · {p.category}</p>
                        </div>
                        {sel && newPromo.discount && (
                          <div className="flex-shrink-0 text-right">
                            <p className="text-red-400 text-[10px] font-bold">-{newPromo.discount}%</p>
                            <p className="text-green-400 text-[10px]">{formatPrice(p.price * (1-(newPromo.discount||0)/100))}</p>
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
                {(newPromo.productIds||[]).length > 0 && (
                  <p className="mt-2 text-brand-400 text-xs font-semibold flex items-center gap-1"><Check className="w-3.5 h-3.5"/> {(newPromo.productIds||[]).length} produto{(newPromo.productIds||[]).length>1?'s':''} selecionado{(newPromo.productIds||[]).length>1?'s':''}</p>
                )}
              </div>
              <div className={`pt-4 border-t flex gap-3 ${bord}`}>
                <button onClick={() => setShowPromoModal(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${dk?'bg-white/[0.06] text-white/60 hover:bg-white/[0.10]':'bg-surface-100 text-surface-500 hover:bg-surface-200'}`}>Cancelar</button>
                <button onClick={handleSavePromo} disabled={!newPromo.code || !newPromo.discount}
                  className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-brand flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4"/> {editingPromo?'Salvar':'Criar Promoção'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
