// import { useState } from 'react';
// import {
//   MapPin, Package, Check, Truck, ArrowLeft, Phone, Navigation,
//   Star, TrendingUp, User, Camera, Mail, Shield, Edit3,
//   ChevronRight, AlertCircle, LogOut, BarChart2, Calendar,
//   Bell, Settings, DollarSign, CheckCircle2, Clock, Sun, Moon
// } from 'lucide-react';
// import { useStore } from '../context/store';
// import { formatPrice, orderStatusLabels, orderStatusColors } from '../utils';
// import { OrderStatus } from '../types';

// type DeliveryTab = 'collecting' | 'enroute' | 'delivered' | 'earnings' | 'profile';

// // Helper: format date as "Hoje", "Ontem" or DD/MM
// function relativeDate(date: Date): string {
//   const now   = new Date();
//   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//   const d     = new Date(date.getFullYear(), date.getMonth(), date.getDate());
//   const diff  = Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
//   if (diff === 0) return 'Hoje';
//   if (diff === 1) return 'Ontem';
//   if (diff <= 6)  return `Há ${diff} dias`;
//   return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
// }

// function sameDay(a: Date, b: Date) {
//   return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
// }

// function groupByDay<T extends { updatedAt: Date }>(items: T[]): { label: string; date: Date; items: T[] }[] {
//   const groups: Map<string, { label: string; date: Date; items: T[] }> = new Map();
//   for (const item of items) {
//     const key = item.updatedAt.toDateString();
//     if (!groups.has(key)) groups.set(key, { label: relativeDate(item.updatedAt), date: item.updatedAt, items: [] });
//     groups.get(key)!.items.push(item);
//   }
//   return Array.from(groups.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
// }

// export default function DeliveryPage() {
//   const { orders, updateOrderStatus, navigateTo, user, logout, updateUser, darkMode, toggleDarkMode } = useStore();
//   const [tab, setTab] = useState<DeliveryTab>('collecting');
//   const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
//   const [editingProfile, setEditingProfile] = useState(false);
//   const [profileForm, setProfileForm] = useState({
//     name: user?.name || '', phone: user?.phone || '', vehicle: user?.vehicle || '', region: user?.region || '', bio: user?.bio || '',
//   });
//   const [notifEnabled, setNotifEnabled] = useState(user?.preferences?.notifications ?? true);

//   const today = new Date();
//   const collectingOrders = orders.filter(o => ['confirmado', 'preparando'].includes(o.status));
//   const enrouteOrders    = orders.filter(o => o.status === 'saiu_entrega');
//   const deliveredOrders  = orders.filter(o => o.status === 'entregue');

//   // For earnings
//   const totalEarnings    = deliveredOrders.reduce((s, o) => s + (o.deliveryCommission || +(o.total * 0.05).toFixed(2)), 0);
//   const todayEarnings    = deliveredOrders.filter(o => sameDay(o.updatedAt, today)).reduce((s, o) => s + (o.deliveryCommission || +(o.total * 0.05).toFixed(2)), 0);

//   // History grouped by day
//   const historyGroups = groupByDay(deliveredOrders);

//   const fakeAddresses = [
//     { street: 'Rua das Flores', number: '123', neighborhood: 'Centro', city: 'Craibas', state: 'AL', zipCode: '57465-000' },
//     { street: 'Av. Principal', number: '456', neighborhood: 'Vila Nova', city: 'Craibas', state: 'AL', zipCode: '57465-100' },
//     { street: 'Rua das Pedras', number: '78', neighborhood: 'Jardim', city: 'Craibas', state: 'AL', zipCode: '57465-200' },
//     { street: 'Travessa do Sol', number: '12', neighborhood: 'Alto da Boa Vista', city: 'Craibas', state: 'AL', zipCode: '57465-300' },
//     { street: 'Rua do Comércio', number: '330', neighborhood: 'Centro', city: 'Arapiraca', state: 'AL', zipCode: '57300-000' },
//   ];

//   const tabs: { id: DeliveryTab; label: string; icon: React.ReactNode; count?: number; color: string }[] = [
//     { id: 'collecting', label: 'Coletar',   icon: <Package className="w-4 h-4"/>,      count: collectingOrders.length, color: 'text-blue-400' },
//     { id: 'enroute',    label: 'A Caminho', icon: <Truck className="w-4 h-4"/>,         count: enrouteOrders.length,    color: 'text-brand-400' },
//     { id: 'delivered',  label: 'Histórico', icon: <CheckCircle2 className="w-4 h-4"/>,  count: deliveredOrders.length,  color: 'text-green-400' },
//     { id: 'earnings',   label: 'Comissões', icon: <DollarSign className="w-4 h-4"/>,    color: 'text-amber-400' },
//     { id: 'profile',    label: 'Perfil',    icon: <User className="w-4 h-4"/>,           color: 'text-purple-400' },
//   ];

//   const dk = darkMode;
//   const bg     = dk ? 'bg-[#0a0a0f]'  : 'bg-[#f5f5f7]';
//   const card   = dk ? 'bg-[#0d0d14] border-white/[0.06]' : 'bg-white border-surface-100';
//   const header = dk ? 'bg-[#0d0d14] border-white/[0.06]' : 'bg-white border-surface-100';
//   const txt    = dk ? 'text-white'    : 'text-surface-900';
//   const sub    = dk ? 'text-white/40' : 'text-surface-400';
//   const inp    = dk ? 'bg-[#0a0a0f] border-white/[0.08] text-white placeholder:text-white/20' : 'bg-surface-50 border-surface-200 text-surface-800';
//   const bord   = dk ? 'border-white/[0.06]' : 'border-surface-100';

//   const nextStatus  = (s: string): OrderStatus | null => ({ confirmado:'preparando', preparando:'saiu_entrega', saiu_entrega:'entregue' } as any)[s] || null;
//   const nextLabel   = (s: string) => ({ confirmado:'Confirmar Coleta', preparando:'Saiu p/ Entrega', saiu_entrega:'Confirmar Entrega' } as any)[s] || '';
//   const nextColor   = (s: string) => ({ confirmado:'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20', preparando:'bg-brand-500 hover:bg-brand-600 shadow-brand-500/20', saiu_entrega:'bg-green-500 hover:bg-green-600 shadow-green-500/20' } as any)[s] || '';

//   const OrderCard = ({ order, idx, showAction = true }: { order: any; idx: number; showAction?: boolean }) => {
//     const addr     = fakeAddresses[idx % fakeAddresses.length];
//     const isExp    = expandedOrder === order.id;
//     const commission = order.deliveryCommission || +(order.total * 0.05).toFixed(2);
//     const dateLabel  = relativeDate(order.createdAt);
//     const ns = nextStatus(order.status);

//     return (
//       <div className={`rounded-2xl border overflow-hidden transition-all ${card} hover:border-brand-400/20`}>
//         <button onClick={() => setExpandedOrder(isExp ? null : order.id)} className={`w-full flex items-center gap-3 p-4 text-left ${isExp ? (dk?'bg-white/[0.03]':'bg-surface-50/80') : ''}`}>
//           <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${order.status==='saiu_entrega'?'bg-brand-500/15':order.status==='preparando'?'bg-blue-500/15':order.status==='entregue'?'bg-green-500/15':dk?'bg-white/[0.06]':'bg-surface-100'}`}>
//             {order.status==='saiu_entrega'?<Truck className="w-5 h-5 text-brand-400"/>:order.status==='entregue'?<CheckCircle2 className="w-5 h-5 text-green-400"/>:<Package className="w-5 h-5 text-blue-400"/>}
//           </div>
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2 flex-wrap">
//               <span className={`font-display font-bold text-sm ${txt}`}>#{order.id}</span>
//               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${orderStatusColors[order.status]}`}>{orderStatusLabels[order.status]}</span>
//             </div>
//             <p className={`text-xs mt-0.5 truncate ${sub}`}>{addr.street}, {addr.number} · {addr.neighborhood}</p>
//             <p className={`text-[10px] mt-0.5 ${sub}`}>{dateLabel} · {order.createdAt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</p>
//           </div>
//           <div className="text-right flex-shrink-0 mr-1">
//             <p className="text-green-400 font-display font-bold text-sm">+{formatPrice(commission)}</p>
//             <p className={`text-[10px] ${sub}`}>comissão</p>
//           </div>
//           <ChevronRight className={`w-4 h-4 ${sub} transition-transform flex-shrink-0 ${isExp?'rotate-90':''}`}/>
//         </button>

//         {isExp && (
//           <div className={`border-t ${bord} p-4 space-y-3 animate-fade-in`}>
//             <div className={`flex items-start gap-3 p-3 rounded-xl ${dk?'bg-white/[0.04]':'bg-surface-50'}`}>
//               <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5"/>
//               <div>
//                 <p className={`text-sm font-semibold ${txt}`}>{addr.street}, {addr.number}</p>
//                 <p className={`text-xs ${sub}`}>{addr.neighborhood} · {addr.city}/{addr.state}</p>
//                 <p className={`text-[11px] font-mono ${dk?'text-white/25':'text-surface-300'}`}>{addr.zipCode}</p>
//               </div>
//             </div>
//             <div className="grid grid-cols-3 gap-2">
//               {[
//                 { label:'Código',    value:`#${order.id.slice(-4)}` },
//                 { label:'Peso',      value:`${(order.items.reduce((s:number,i:any)=>s+i.quantity,0)*0.8).toFixed(1)}kg` },
//                 { label:'Comissão',  value:formatPrice(commission), green:true },
//               ].map((info,i) => (
//                 <div key={i} className={`rounded-xl p-3 text-center ${dk?'bg-white/[0.04]':'bg-surface-50'}`}>
//                   <p className={`font-display font-bold text-sm ${info.green?'text-green-400':txt}`}>{info.value}</p>
//                   <p className={`text-[10px] mt-0.5 ${sub}`}>{info.label}</p>
//                 </div>
//               ))}
//             </div>
//             <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
//               <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5"/>
//               <p className="text-amber-400/80 text-xs">Acesso restrito — apenas código, peso e endereço. Conteúdo é confidencial.</p>
//             </div>
//             {showAction && ns && (
//               <div className="flex gap-2 flex-wrap">
//                 <button className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${dk?'border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.06]':'border-surface-200 text-surface-400 hover:bg-surface-50 hover:text-surface-700'}`}>
//                   <Phone className="w-3.5 h-3.5"/> Ligar
//                 </button>
//                 <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-all">
//                   <Navigation className="w-3.5 h-3.5"/> Navegar
//                 </button>
//                 <button onClick={() => { updateOrderStatus(order.id, ns); setExpandedOrder(null); }}
//                   className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${nextColor(order.status)}`}>
//                   {ns==='entregue'?<Check className="w-3.5 h-3.5"/>:<Truck className="w-3.5 h-3.5"/>}
//                   {nextLabel(order.status)}
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     );
//   };

//   const EmptyCard = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) => (
//     <div className={`rounded-2xl border p-12 text-center ${card}`}>
//       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${dk?'bg-white/[0.04] text-white/20':'bg-surface-100 text-surface-300'}`}>{icon}</div>
//       <p className={`font-display font-bold text-base mb-1 ${dk?'text-white/40':'text-surface-500'}`}>{title}</p>
//       <p className={`text-sm ${sub}`}>{subtitle}</p>
//     </div>
//   );

//   return (
//     <div className={`min-h-screen flex flex-col ${bg}`}>
//       {/* Header */}
//       <header className={`sticky top-0 z-30 border-b ${header}`}>
//         <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
//           <button onClick={() => navigateTo('home')} className={`p-2 rounded-xl ${sub} transition-all ${dk?'hover:bg-white/[0.08]':'hover:bg-surface-100'}`}><ArrowLeft className="w-5 h-5"/></button>
//           <div className="flex items-center gap-3 flex-1 min-w-0">
//             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-brand flex-shrink-0">
//               <span className="text-white font-bold text-base">{user?.name?.[0]||'C'}</span>
//             </div>
//             <div className="min-w-0">
//               <p className={`font-display font-bold text-sm leading-none truncate ${txt}`}>{user?.name||'Entregador'}</p>
//               <div className="flex items-center gap-1.5 mt-0.5">
//                 <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
//                 <span className="text-green-400 text-[11px] font-medium">Online</span>
//               </div>
//             </div>
//           </div>
//           <button onClick={toggleDarkMode} className={`p-2 rounded-xl ${sub} ${dk?'hover:bg-white/[0.08]':'hover:bg-surface-100'} transition-all`}>
//             {dk?<Sun className="w-5 h-5"/>:<Moon className="w-5 h-5"/>}
//           </button>
//           <button onClick={() => setTab('profile')} className={`p-2 rounded-xl ${sub} ${dk?'hover:bg-white/[0.08]':'hover:bg-surface-100'} transition-all`}>
//             <Settings className="w-5 h-5"/>
//           </button>
//         </div>
//       </header>

//       {/* Stats strip */}
//       <div className={`border-b ${header}`}>
//         <div className="max-w-2xl mx-auto px-4 py-3 grid grid-cols-4 gap-3">
//           {[
//             { label:'Coletar',   value:collectingOrders.length, icon:<Package className="w-3.5 h-3.5"/>,  color:'text-blue-400',  bg:dk?'bg-blue-500/10':'bg-blue-50'  },
//             { label:'A Caminho', value:enrouteOrders.length,    icon:<Truck className="w-3.5 h-3.5"/>,    color:'text-brand-400', bg:dk?'bg-brand-500/10':'bg-brand-50' },
//             { label:'Entregues', value:deliveredOrders.length,  icon:<Check className="w-3.5 h-3.5"/>,    color:'text-green-400', bg:dk?'bg-green-500/10':'bg-green-50' },
//             { label:'Hoje',      value:formatPrice(todayEarnings), icon:<DollarSign className="w-3.5 h-3.5"/>, color:'text-amber-400', bg:dk?'bg-amber-500/10':'bg-amber-50' },
//           ].map((s,i) => (
//             <div key={i} className="text-center">
//               <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center ${s.color} mx-auto mb-1`}>{s.icon}</div>
//               <p className={`font-display font-bold text-xs ${s.color} leading-none`}>{s.value}</p>
//               <p className={`text-[10px] mt-0.5 ${sub}`}>{s.label}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Tab bar */}
//       <div className={`border-b sticky top-[73px] z-20 ${header}`}>
//         <div className="max-w-2xl mx-auto px-3 flex gap-1 py-2 overflow-x-auto">
//           {tabs.map(t => (
//             <button key={t.id} onClick={() => setTab(t.id)}
//               className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-display font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
//                 tab===t.id ? 'bg-brand-500 text-white shadow-brand' : `${sub} ${dk?'hover:bg-white/[0.06]':'hover:bg-surface-50'}`
//               }`}>
//               {t.icon} {t.label}
//               {t.count !== undefined && t.count > 0 && (
//                 <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab===t.id?'bg-white/25':'bg-brand-500/20 text-brand-400'}`}>{t.count}</span>
//               )}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Content */}
//       <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 space-y-3">

//         {/* ── COLLECTING ── */}
//         {tab==='collecting' && (
//           collectingOrders.length === 0
//             ? <EmptyCard icon={<Package className="w-8 h-8"/>} title="Nenhuma coleta pendente" subtitle="Novos pedidos aparecem aqui para você coletar"/>
//             : <>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
//                   <Package className="w-4 h-4 text-blue-400"/><span className="text-blue-400 text-xs font-bold">{collectingOrders.length} pedido{collectingOrders.length>1?'s':''} aguardando coleta</span>
//                   <span className={`ml-auto text-[10px] ${sub}`}>{relativeDate(today)}</span>
//                 </div>
//                 {collectingOrders.map((o,i) => <OrderCard key={o.id} order={o} idx={i}/>)}
//               </>
//         )}

//         {/* ── EN ROUTE ── */}
//         {tab==='enroute' && (
//           enrouteOrders.length === 0
//             ? <EmptyCard icon={<Truck className="w-8 h-8"/>} title="Nenhuma entrega em rota" subtitle="Pedidos coletados aparecem aqui ao saírem para entrega"/>
//             : <>
//                 <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20">
//                   <Truck className="w-4 h-4 text-brand-400"/><span className="text-brand-400 text-xs font-bold">{enrouteOrders.length} entrega{enrouteOrders.length>1?'s':''} em andamento</span>
//                 </div>
//                 {enrouteOrders.map((o,i) => <OrderCard key={o.id} order={o} idx={i+10}/>)}
//               </>
//         )}

//         {/* ── HISTORY (grouped by day) ── */}
//         {tab==='delivered' && (
//           deliveredOrders.length === 0
//             ? <EmptyCard icon={<CheckCircle2 className="w-8 h-8"/>} title="Nenhuma entrega concluída" subtitle="Seus histórico de entregas aparecerá aqui"/>
//             : <>
//                 <div className="flex items-center justify-between px-1">
//                   <span className={`text-xs font-bold uppercase tracking-wider ${sub}`}>Histórico de Entregas</span>
//                   <span className="text-green-400 text-xs font-bold">{formatPrice(totalEarnings)} total</span>
//                 </div>
//                 {historyGroups.map((group) => (
//                   <div key={group.date.toDateString()}>
//                     {/* Day separator */}
//                     <div className="flex items-center gap-3 py-2">
//                       <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${
//                         relativeDate(group.date) === 'Hoje' ? 'bg-brand-500/15 text-brand-400' :
//                         relativeDate(group.date) === 'Ontem' ? 'bg-blue-500/15 text-blue-400' :
//                         dk ? 'bg-white/[0.06] text-white/40' : 'bg-surface-100 text-surface-400'
//                       }`}>
//                         <Calendar className="w-3 h-3"/>
//                         {group.label} — {group.date.toLocaleDateString('pt-BR', { weekday:'short', day:'numeric', month:'short' })}
//                       </div>
//                       <div className={`flex-1 h-px ${dk?'bg-white/[0.06]':'bg-surface-200'}`}/>
//                       <span className="text-green-400 text-xs font-bold">
//                         +{formatPrice(group.items.reduce((s, o: any) => s + (o.deliveryCommission || +(o.total * 0.05).toFixed(2)), 0))}
//                       </span>
//                     </div>
//                     {/* Orders in this group */}
//                     {group.items.map((o: any, i) => (
//                       <div key={o.id} className={`rounded-2xl border p-4 flex items-center gap-3 mb-2 ${card}`}>
//                         <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
//                           <CheckCircle2 className="w-5 h-5 text-green-400"/>
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className={`font-display font-bold text-sm ${txt}`}>#{o.id}</p>
//                           <p className={`text-xs ${sub}`}>{fakeAddresses[i % fakeAddresses.length].street} · {o.items.reduce((s: number, it: any) => s + it.quantity, 0)} iten{o.items.reduce((s: number, it: any) => s + it.quantity, 0)!==1?'s':''}</p>
//                           <p className={`text-[10px] ${sub}`}>{o.updatedAt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</p>
//                         </div>
//                         <div className="text-right flex-shrink-0">
//                           <p className="text-green-400 font-display font-bold">+{formatPrice(o.deliveryCommission || +(o.total * 0.05).toFixed(2))}</p>
//                           <p className={`text-[10px] ${sub}`}>5% de {formatPrice(o.total)}</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ))}
//               </>
//         )}

//         {/* ── EARNINGS ── */}
//         {tab==='earnings' && (
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-3">
//               {[
//                 {label:'Total Ganho',    value:formatPrice(totalEarnings),    from:'from-green-500',  to:'to-emerald-600', glow:'shadow-green-500/20',  icon:<TrendingUp className="w-5 h-5"/>},
//                 {label:'Entregas',       value:deliveredOrders.length,        from:'from-brand-500',  to:'to-orange-600',  glow:'shadow-brand-500/20',  icon:<Package className="w-5 h-5"/>},
//                 {label:'Média/Entrega',  value:deliveredOrders.length>0?formatPrice(totalEarnings/deliveredOrders.length):'R$ 0,00', from:'from-blue-500', to:'to-indigo-600', glow:'shadow-blue-500/20', icon:<BarChart2 className="w-5 h-5"/>},
//                 {label:'Avaliação',      value:'4.9 ★',                        from:'from-amber-500',  to:'to-yellow-600',  glow:'shadow-amber-500/20',  icon:<Star className="w-5 h-5"/>},
//               ].map((s,i) => (
//                 <div key={i} className={`rounded-2xl border p-5 ${card}`}>
//                   <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.from} ${s.to} flex items-center justify-center text-white mb-3 shadow-lg ${s.glow}`}>{s.icon}</div>
//                   <p className={`font-display font-bold text-xl leading-none ${txt}`}>{s.value}</p>
//                   <p className={`text-xs mt-1.5 ${sub}`}>{s.label}</p>
//                 </div>
//               ))}
//             </div>

//             {/* Per delivery breakdown grouped by day */}
//             <div className={`rounded-2xl border overflow-hidden ${card}`}>
//               <div className={`px-4 py-3 border-b ${bord} flex items-center gap-2`}>
//                 <DollarSign className="w-4 h-4 text-green-400"/>
//                 <h3 className={`font-display font-bold text-sm ${txt}`}>Comissão por Entrega</h3>
//               </div>
//               {deliveredOrders.length === 0
//                 ? <p className={`p-6 text-center text-sm ${sub}`}>Nenhuma entrega concluída</p>
//                 : <>
//                     {historyGroups.map(group => (
//                       <div key={group.date.toDateString()}>
//                         <div className={`px-4 py-2 flex items-center justify-between ${dk?'bg-white/[0.02]':'bg-surface-50'}`}>
//                           <span className={`text-xs font-bold ${sub}`}>{group.label} · {group.date.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}</span>
//                           <span className="text-green-400 text-xs font-bold">+{formatPrice(group.items.reduce((s,o:any)=>s+(o.deliveryCommission||+(o.total*0.05).toFixed(2)),0))}</span>
//                         </div>
//                         {group.items.map((o:any) => {
//                           const comm = o.deliveryCommission || +(o.total * 0.05).toFixed(2);
//                           return (
//                             <div key={o.id} className={`flex items-center gap-3 px-4 py-3 border-t ${bord}`}>
//                               <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0"/>
//                               <div className="flex-1 min-w-0">
//                                 <p className={`text-sm font-semibold ${txt}`}>#{o.id}</p>
//                                 <p className={`text-[11px] ${sub}`}>{o.items.reduce((s:number,it:any)=>s+it.quantity,0)} itens · {o.updatedAt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</p>
//                               </div>
//                               <div className="text-right flex-shrink-0">
//                                 <p className="text-green-400 font-display font-bold text-sm">+{formatPrice(comm)}</p>
//                                 <p className={`text-[10px] ${sub}`}>5% de {formatPrice(o.total)}</p>
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     ))}
//                     <div className={`flex items-center justify-between px-4 py-3 border-t ${bord} ${dk?'bg-green-500/5':'bg-green-50'}`}>
//                       <span className={`font-display font-bold text-sm ${txt}`}>Total Geral</span>
//                       <span className="font-display font-bold text-lg text-green-400">{formatPrice(totalEarnings)}</span>
//                     </div>
//                   </>
//               }
//             </div>
//           </div>
//         )}

//         {/* ── PROFILE ── */}
//         {tab==='profile' && (
//           <div className="space-y-4">
//             <div className={`rounded-2xl border overflow-hidden ${card}`}>
//               <div className="h-20 bg-gradient-to-r from-brand-500 to-amber-500 relative">
//                 <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)',backgroundSize:'24px 24px'}}/>
//               </div>
//               <div className="px-5 pb-5">
//                 <div className="flex items-end gap-3 -mt-8 mb-4 flex-wrap">
//                   <div className="relative">
//                     <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center border-4 shadow-medium ${dk?'border-[#0d0d14]':'border-white'}`}>
//                       <span className="text-white font-display font-bold text-2xl">{user?.name?.[0]}</span>
//                     </div>
//                     <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-500 rounded-xl flex items-center justify-center shadow"><Camera className="w-3 h-3 text-white"/></button>
//                   </div>
//                   <div className="mb-0.5 flex-1 min-w-0">
//                     <p className={`font-display font-bold text-base leading-none ${txt}`}>{user?.name}</p>
//                     <p className="text-brand-500 text-xs font-semibold mt-0.5">Entregador Parceiro · desde {user?.joinDate||'2022'}</p>
//                   </div>
//                   <button onClick={() => editingProfile ? (updateUser({...profileForm}), setEditingProfile(false)) : setEditingProfile(true)}
//                     className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all mb-1">
//                     {editingProfile ? <><Check className="w-3.5 h-3.5"/> Salvar</> : <><Edit3 className="w-3.5 h-3.5"/> Editar</>}
//                   </button>
//                 </div>

//                 <div className="grid grid-cols-3 gap-2 mb-4">
//                   {[{l:'Entregues',v:deliveredOrders.length},{l:'Avaliação',v:'4.9 ★'},{l:'Comissões',v:formatPrice(totalEarnings)}].map((s,i)=>(
//                     <div key={i} className={`rounded-xl p-2.5 text-center ${dk?'bg-white/[0.04]':'bg-surface-50'}`}>
//                       <p className={`font-display font-bold text-sm ${txt}`}>{s.v}</p>
//                       <p className={`text-[10px] ${sub}`}>{s.l}</p>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="grid grid-cols-2 gap-2">
//                   {[
//                     {icon:<Phone className="w-3.5 h-3.5"/>,  label:'Telefone', key:'phone',   val:user?.phone||'—'},
//                     {icon:<Truck className="w-3.5 h-3.5"/>,  label:'Veículo',  key:'vehicle', val:user?.vehicle||'—'},
//                     {icon:<MapPin className="w-3.5 h-3.5"/>, label:'Região',   key:'region',  val:user?.region||'—'},
//                     {icon:<Mail className="w-3.5 h-3.5"/>,   label:'Email',    key:'_email',  val:user?.email||'—'},
//                   ].map(f => (
//                     <div key={f.key} className={`rounded-xl p-3 ${dk?'bg-white/[0.04]':'bg-surface-50'}`}>
//                       <div className={`flex items-center gap-1.5 mb-1 text-brand-400`}>{f.icon}<span className={`text-[9px] uppercase tracking-wider font-bold ${sub}`}>{f.label}</span></div>
//                       {editingProfile && !f.key.startsWith('_') ? (
//                         <input value={(profileForm as any)[f.key]||''} onChange={e => setProfileForm(p=>({...p,[f.key]:e.target.value}))}
//                           className={`w-full text-xs py-1 px-2 rounded-lg border focus:outline-none focus:border-brand-400 transition-colors ${inp}`}/>
//                       ) : (
//                         <p className={`text-xs font-medium truncate ${txt}`}>{f.key.startsWith('_')?f.val:(profileForm as any)[f.key]||f.val}</p>
//                       )}
//                     </div>
//                   ))}
//                 </div>

//                 {editingProfile && (
//                   <div className={`mt-2 rounded-xl p-3 ${dk?'bg-white/[0.04]':'bg-surface-50'}`}>
//                     <p className={`text-[9px] uppercase tracking-wider font-bold ${sub} mb-1.5`}>Bio</p>
//                     <textarea value={profileForm.bio} onChange={e => setProfileForm(p=>({...p,bio:e.target.value}))} rows={2}
//                       className={`w-full text-xs py-1.5 px-2 rounded-lg border focus:outline-none focus:border-brand-400 transition-colors resize-none ${inp}`}/>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Notifications toggle */}
//             <div className={`rounded-2xl border p-4 flex items-center justify-between ${card}`}>
//               <div className="flex items-center gap-3">
//                 <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dk?'bg-white/[0.06]':'bg-surface-100'}`}><Bell className="w-4 h-4 text-brand-400"/></div>
//                 <div><p className={`text-sm font-medium ${txt}`}>Notificações de Entrega</p><p className={`text-xs ${sub}`}>Alertas de novos pedidos</p></div>
//               </div>
//               <button onClick={() => setNotifEnabled(!notifEnabled)}>
//                 {notifEnabled ? <span className="text-2xl text-green-400">✓</span> : <span className={`text-2xl ${sub}`}>○</span>}
//               </button>
//             </div>

//             {/* Theme toggle */}
//             <div className={`rounded-2xl border p-4 flex items-center justify-between ${card}`}>
//               <div className="flex items-center gap-3">
//                 <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dk?'bg-white/[0.06]':'bg-surface-100'}`}>{dk?<Sun className="w-4 h-4 text-amber-400"/>:<Moon className="w-4 h-4 text-blue-400"/>}</div>
//                 <div><p className={`text-sm font-medium ${txt}`}>{dk?'Modo Claro':'Modo Escuro'}</p><p className={`text-xs ${sub}`}>Alterar tema da interface</p></div>
//               </div>
//               <button onClick={toggleDarkMode} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all">Alternar</button>
//             </div>

//             {/* Logout */}
//             <button onClick={() => { logout(); navigateTo('home'); }}
//               className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2">
//               <LogOut className="w-4 h-4"/> Sair da Conta
//             </button>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }
