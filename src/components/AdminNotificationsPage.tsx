import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  History,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  X,
  Lock
} from 'lucide-react';
import { useAdminController } from '../controller/useAdminController';
import { UseNotificationAdmin } from '../storeAdmin/UseNotificationAdmin';
import { useNotification } from '../utils/NotificationCard';
import { NotificationModel } from '../models/NotificationModel';
import { AdminTab } from '../models/OrderSave';

export type AdminNotificationKind = 'ORDER' | 'stock' | 'promotion' | 'Read' | 'PASSWORD_CHANGE';;

export type AdminNotificationItem = {
  id: string;
  kind: AdminNotificationKind;
  title: string;
  description: string;
  date: Date;
  target: 'orders' | 'products' | 'promotions' | 'movements';
  priority?: 'normal' | 'high';
  meta?: string;
};

type Props = {
  darkMode: boolean;
  notifications: NotificationModel[];
  onNavigate: (Tab: AdminTab) => void;
};

const kindConfig = {
  ORDER: {
    label: 'Pedidos',
    icon: ShoppingBag,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    ring: 'ring-blue-500/40'
  },

  stock: {
    label: 'Estoque',
    icon: Package,
    color: 'text-rose-400',
    bg: 'bg-rose-500/20',
    ring: 'ring-rose-500/40'
  },

  promotion: {
    label: 'Promoções',
    icon: Tag,
    color: 'text-violet-400',
    bg: 'bg-violet-500/20',
    ring: 'ring-violet-500/40'
  },

  system: {
    label: 'Sistema',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    ring: 'ring-emerald-500/40'
  },

  security: {
    label: 'Segurança',
    icon: Lock,
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    ring: 'ring-amber-500/40'
  },

} as const;
function getNotificationKind(
  item: NotificationModel
): keyof typeof kindConfig {
  const value = `${item.referenceType} ${item.kind}`.toLowerCase();

  if (value.includes('ORDER') || value.includes('pedido')) {
    return 'ORDER';
  }

  if (value.includes('stock') || value.includes('estoque') || value.includes('product') || value.includes('produto')) {
    return 'stock';
  }

  if (value.includes('promotion') || value.includes('promoç') || value.includes('cupom')
  ) {
    return 'promotion';
  }

  return 'system';
}
function relativeTime(date: Date) {
  const timestamp = date.getTime();
  if (!Number.isFinite(timestamp)) return 'Agora';
  const diff = Date.now() - timestamp;
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `Há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ontem';
  if (days < 7) return `Há ${days} dias`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dayTitle(date: Date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dateKey(date) === dateKey(today)) return 'Hoje';
  if (dateKey(date) === dateKey(yesterday)) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
}

export default function AdminNotificationsPage({ darkMode, notifications, onNavigate }: Props) {
  const Controller = useAdminController();
  const { Notification, UpdateReadNotify, UpdateReadNotifyAll } = UseNotificationAdmin();

  const [filter, setFilter] = useState<'all' | 'unread' | AdminNotificationKind>('all');
  const historyDateInputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<'week' | 'history'>('week');
  const [selectedDay, setSelectedDay] = useState('all');
  const [historyDate, setHistoryDate] = useState('');
  const showCalendar = false;
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [search, setSearch] = useState('');
  const notify = useNotification();
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);
    return date;
  }), []);

  const filtered = useMemo(() => notifications.filter(item => {
    const date = new Date(item.insertDate);
    const term = search.trim().toLowerCase();
    const weekStart = weekDays[6];
    const matchesPeriod = view === 'history' ? (!historyDate || dateKey(date) === historyDate) : (date >= weekStart && (selectedDay === 'all' || dateKey(date) === selectedDay));
    const matchesType = filter === 'Read' ? (item.isRead === true) : filter === 'all' ? (item) : (filter === 'unread' || item.referenceType === filter) && item.isRead === false;
    return matchesPeriod && matchesType && (!term || `${item.title} ${item.description} ${item.referenceType}`.toLowerCase().includes(term));
  }), [filter, historyDate, notifications, search, selectedDay, view, weekDays]);

  const groupedNotifications = useMemo(() => {
    return filtered.reduce<Array<{ key: string; date: Date; items: NotificationModel[] }>>((groups, item) => {
      const key = dateKey(new Date(item.insertDate));
      const currentGroup = groups.find(group => group.key === key);
      if (currentGroup) currentGroup.items.push(item);
      else groups.push({ key, date: new Date(item.insertDate), items: [item] });
      return groups;
    }, []).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filtered]);

  const calendarDays: Array<{ date: Date; key: string; currentMonth: boolean; count: number }> = [];


  const card = darkMode ? 'border-white/[0.12] bg-[#0d0d14]' : 'border-surface-300 bg-white';
  const text = darkMode ? 'text-white' : 'text-surface-900';
  const muted = darkMode ? 'text-white/55' : 'text-surface-600';
  const subtle = darkMode ? 'bg-white/[0.07]' : 'bg-surface-100';

  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  const oitoDiasAtras = new Date(); oitoDiasAtras.setDate(oitoDiasAtras.getDate() - 7); oitoDiasAtras.setHours(0, 0, 0, 0);

  const unread = Notification.filter(item => {
    if (item.isRead) return false;

    const itemDate = new Date(item.insertDate);
    const itemDateKey = dateKey(itemDate);

    if (historyDate) {
      return itemDateKey === historyDate;
    }

    if (selectedDay === 'all') {
      return itemDate >= oitoDiasAtras && itemDate <= hoje;
    }

    return itemDateKey === selectedDay;
  }).length;

  const matchesSelectedPeriod = (insertDate: Date | string) => {
    const itemDate = new Date(insertDate);
    const itemKey = dateKey(itemDate);

    if (historyDate) { return itemKey === historyDate; }

    if (selectedDay === 'all') { return itemDate >= oitoDiasAtras && itemDate <= hoje; }

    return itemKey === selectedDay;
  };
  const unreadOrder = Notification.filter(item => item.isRead === false && item.referenceType === "ORDER" && matchesSelectedPeriod(item.insertDate)).length;
  const unreadAllRead = notifications.filter(item => item.isRead === true && matchesSelectedPeriod(item.insertDate)).length;
  const unreadSegurancy = Notification.filter(item => item.isRead === false && item.referenceType === "PASSWORD_CHANGE" && matchesSelectedPeriod(item.insertDate)).length;


  const filters: Array<{ id: typeof filter; label: string }> = [
    { id: 'all', label: 'Todas' },
    { id: 'unread', label: `Não lidas${unread ? ` (${unread})` : ''}` },
    { id: 'ORDER', label: `Pedidos(${unreadOrder})` },
    { id: 'stock', label: `Estoque(Colocar)` },
    { id: 'promotion', label: 'Promoções(Colocar)' },
    { id: 'PASSWORD_CHANGE', label: `Segurança(${unreadSegurancy})` },
    //  { id: 'system', label: 'Sistema(Colocar)' },
    { id: 'Read', label: `Lidas(${unreadAllRead})` },

  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <section className={`relative overflow-hidden rounded-3xl border p-5 shadow-xl sm:p-7 ${darkMode ? 'border-white/[0.1] bg-[#0d0d14] shadow-black/30' : 'border-surface-200 bg-white shadow-surface-300/40'}`}>
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center shadow-lg shadow-brand-500/10 flex-shrink-0">
              <Bell className="h-6 w-6 text-brand-400" />
              {unread > 0 && <span className={`absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 bg-red-500 ${darkMode ? 'border-[#0d0d14]' : 'border-white'}`} />}
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-400">
                <Sparkles className="h-3.5 w-3.5" /> Central do administrador
              </div>
              <h2 className={`font-display text-2xl font-bold sm:text-3xl ${text}`}>Suas notificações</h2>
              <p className={`mt-1 max-w-xl text-sm ${muted}`}>Acompanhe o que precisa da sua atenção em um só lugar.</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${darkMode ? 'border-brand-500/25 bg-brand-500/10' : 'border-brand-200 bg-brand-50'}`}>
            <div><p className="text-2xl font-black leading-none text-brand-400">{unread}</p><p className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${muted}`}>
              não lidas
            </p>
            </div>
            <div className={`h-9 w-px ${darkMode ? 'bg-white/15' : 'bg-brand-200'}`} />
            <button
              onClick={() => UpdateReadNotifyAll()}
              disabled={!unread}
              className={`flex items-center gap-2 rounded-xl px-2 py-2 text-xs font-bold text-brand-400 transition disabled:cursor-default disabled:opacity-40 ${darkMode ? 'hover:bg-white/[0.06]' : 'hover:bg-brand-100'}`}>
              <CheckCheck className="h-4 w-4" /> Marcar todas como lidas
            </button>
          </div>
        </div>
      </section>

      <section className={`rounded-2xl border p-2 ${card}`}>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setView('week'); setSelectedDay(dateKey(new Date())); setHistoryDate('') }}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${view === 'week' ? 'bg-brand-500 text-white shadow-brand' : `${subtle} ${muted} hover:text-brand-400`}`}>
            <CalendarDays className="h-4 w-4" /> Esta semana
          </button>
          <button
            onClick={() => { setView('history'); setSelectedDay('all'); }}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${view === 'history' ? 'bg-brand-500 text-white shadow-brand' : `${subtle} ${muted} hover:text-brand-400`}`}>
            <History className="h-4 w-4" /> Histórico
          </button>
        </div>
      </section>

      {view === 'history' && (
        <section className={`rounded-2xl border p-4 sm:p-5 ${card}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${text}`}>Calendário do histórico</h3>
                <p className={`mt-0.5 text-xs ${muted}`}>Escolha visualmente o dia desejado.
                </p>
              </div>
            </div>
            <div className={`flex min-h-11 items-center gap-1 rounded-xl border px-2 ${darkMode ? 'border-white/[0.1] bg-black/20' : 'border-surface-200 bg-surface-50'}`}>
              <button
                type="button"
                onClick={() => {
                  const input = historyDateInputRef.current;
                  if (!input) return;
                  input.focus();
                  if (typeof input.showPicker === 'function') input.showPicker();
                }}
                className="rounded-lg p-2 text-brand-400 transition hover:bg-brand-500/10"
                aria-label="Abrir calendário"
              >
                <CalendarDays className="h-4 w-4" />
              </button>
              <input
                ref={historyDateInputRef}
                type="date"
                value={historyDate}
                max={dateKey(new Date())}
                onChange={event => setHistoryDate(event.target.value)}
                className={`min-w-0 bg-transparent py-2.5 pr-2 text-sm font-semibold outline-none [color-scheme:light] ${darkMode ? 'text-white [color-scheme:dark]' : text}`} aria-label="Filtrar histórico por data" />
            </div>
          </div>

          {showCalendar && (
            <div className={`mt-4 overflow-hidden rounded-2xl border ${darkMode ? 'border-white/[0.08] bg-black/15' : 'border-surface-200 bg-surface-50/60'}`}>
              <div className={`flex items-center justify-between border-b px-3 py-3 sm:px-4 ${darkMode ? 'border-white/[0.07]' : 'border-surface-200'}`}>
                <button
                  onClick={() => setCalendarMonth(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                  aria-label="Mês anterior"
                  className={`rounded-xl p-2 transition ${muted} ${darkMode ? 'hover:bg-white/[0.06]' : 'hover:bg-white'}`}>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h4 className={`text-sm font-bold capitalize ${text}`}>
                  {calendarMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h4>
                <button
                  onClick={() => setCalendarMonth(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                  aria-label="Próximo mês"
                  className={`rounded-xl p-2 transition ${muted} ${darkMode ? 'hover:bg-white/[0.06]' : 'hover:bg-white'}`}>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 px-2 pt-3 sm:px-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day}
                  className={`pb-2 text-center text-[9px] font-bold uppercase tracking-wide ${muted}`}>
                  {day}
                </div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 p-2 pt-0 sm:gap-2 sm:p-4 sm:pt-0">
                {calendarDays.map(day => {
                  const selected = historyDate === day.key;
                  const today = day.key === dateKey(new Date());
                  return (
                    <button
                      key={day.key} onClick={() => setHistoryDate(selected ? '' : day.key)}
                      className={`relative flex min-h-12 flex-col items-center justify-center rounded-xl text-xs font-bold transition sm:min-h-14 ${selected ? 'bg-brand-500 text-white shadow-brand' : day.currentMonth ? `${text} ${darkMode ? 'hover:bg-white/[0.06]' : 'hover:bg-white hover:shadow-sm'}` : `${muted} opacity-35`} ${today && !selected ? 'ring-1 ring-brand-400' : ''}`}>
                      <span>{day.date.getDate()}</span>
                      {day.count > 0 &&
                        <span className={`mt-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[8px] ${selected ? 'bg-white/20 text-white' : 'bg-brand-500/15 text-brand-400'}`}>
                          {day.count}
                        </span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className={`mt-4 flex flex-col gap-2 rounded-xl px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between ${darkMode ? 'bg-brand-500/[0.08]' : 'bg-brand-50'}`}>
            <p className={`text-xs ${muted}`}>{historyDate ? <>Exibindo notificações de <strong className={text}>{new Date(`${historyDate}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </strong></> : 'Selecione um dia no calendário ou consulte todo o histórico.'}</p>
            <div className="flex items-center gap-2">
              {historyDate &&
                <button
                  onClick={() => setHistoryDate('')}
                  className="flex items-center gap-1 text-[10px] font-bold text-rose-500">
                  <X className="h-3.5 w-3.5" /> Limpar
                </button>}
              <span
                className="rounded-lg bg-brand-500/15 px-2 py-1 text-[10px] font-bold text-brand-400">{filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
              </span>
            </div>
          </div>
        </section>
      )}

      {view === 'week' && (
        <section className={`rounded-2xl border p-3 sm:p-4 ${card}`}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-bold ${text}`}>
                Filtrar por dia
              </h3>
              <p className={`mt-0.5 text-xs ${muted}`}>Últimos sete dias</p>
            </div>
            <CalendarDays className={`h-4 w-4 ${muted}`} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">

            {weekDays.map(day => {
              const key = dateKey(day);
              const count = notifications.filter(item => dateKey(new Date(item.insertDate)) === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(key)}
                  className={`min-w-[92px] rounded-xl px-3 py-2 text-left transition ${selectedDay === key ? 'bg-brand-500 text-white shadow-brand' : `${subtle} ${muted} hover:text-brand-400`}`}>
                  <span className="block text-[10px] font-bold uppercase">
                    {key === dateKey(new Date()) ? 'Hoje' : day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                  </span>
                  <span
                    className="mt-0.5 block text-xs font-semibold">
                    {day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} · {count}
                  </span>
                </button>
              );
            })}
            <button
              onClick={() => setSelectedDay('all')}
              className={`min-w-fit rounded-xl px-3 py-2 text-xs font-bold transition ${selectedDay === 'all' ? 'bg-brand-500 text-white' : `${subtle} ${muted}`}`}>
              Todos os dias
            </button>
          </div>
        </section>
      )}

      <section className={`rounded-2xl border p-3 sm:p-4 ${card}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {filters.map(item => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition ${filter === item.id ? 'bg-brand-500 text-white shadow-brand' : `${subtle} ${muted} hover:text-brand-400`}`}>
                {item.label}
              </button>
            ))}
          </div>
          <label className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2.5 lg:w-72 ${darkMode ? 'border-white/[0.08] bg-black/20' : 'border-surface-200 bg-surface-50'}`}>
            <Search className={`h-4 w-4 shrink-0 ${muted}`} />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Buscar notificações..."
              className={`w-full bg-transparent text-sm outline-none placeholder:opacity-50 ${text}`} />
          </label>
        </div>
      </section>

      <section className={`overflow-hidden rounded-2xl border ${card}`}>
        <div className={`flex items-center justify-between border-b px-4 py-3 sm:px-5 ${darkMode ? 'border-white/[0.06]' : 'border-surface-100'}`}>
          <div>
            <h3 className={`text-sm font-bold ${text}`}>
              {view === 'history' ? 'Histórico de notificações' : filter === 'unread' ? 'Pendentes de leitura' : 'Notificações da semana'}
            </h3>
            <p className={`mt-0.5 text-xs ${muted}`}>
              {filtered.length} {filtered.length === 1 ? 'notificação encontrada' : 'notificações encontradas'}
            </p>
          </div>
          <Clock3 className={`h-4 w-4 ${muted}`} />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${subtle}`}>
              <CheckCheck className="h-7 w-7 text-emerald-500" /></div>
            <h3 className={`font-display text-lg font-bold ${text}`}>
              Tudo em dia por aqui
            </h3>
            <p className={`mt-1 max-w-sm text-sm ${muted}`}>
              Nenhuma notificação corresponde aos filtros selecionados.
            </p>
          </div>
        ) : (
          <div>
            {groupedNotifications.map(group => (
              <section key={group.key}>
                <div className={`sticky top-0 z-10 flex items-center justify-between border-y px-4 py-2.5 backdrop-blur-xl sm:px-5 ${darkMode ? 'border-white/[0.06] bg-[#0d0d14]/95' : 'border-surface-100 bg-surface-50/95'}`}>
                  <div className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-brand-400" />
                    <h4 className={`text-xs font-bold capitalize ${text}`}>{dayTitle(group.date)}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-semibold ${muted}`}>{group.items.length} {group.items.length === 1 ? 'item' : 'itens'}</span>
                </div>
                <div className={darkMode ? 'divide-y divide-white/[0.06]' : 'divide-y divide-surface-100'}>
                  {group.items.map(item => {
                    const notificationKind = getNotificationKind(item);
                    const config = kindConfig[notificationKind];
                    const Icon = config.icon;
                    const isRead = item.isRead;
                    return (
                      <article key={item.idNotificationUser} className={`group relative flex gap-3 p-4 transition sm:gap-4 sm:p-5 ${!isRead ? (darkMode ? 'bg-brand-500/[0.055]' : 'bg-brand-50/60') : ''} ${darkMode ? 'hover:bg-white/[0.025]' : 'hover:bg-surface-50/70'}`}>
                        {!isRead && <span className="absolute left-0 top-0 h-full w-0.5 bg-brand-500" />}
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 sm:h-11 sm:w-11 ${config.bg} ${config.color} ${config.ring}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 items-center gap-2">
                              <h4 className={`truncate text-sm ${isRead ? 'font-semibold' : 'font-bold'} ${text}`}>
                                {item.title}
                              </h4>
                              {!isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                            </div>
                            <time className={`shrink-0 text-[11px] ${muted}`}>
                              {relativeTime(new Date(item.insertDate))}
                            </time>
                          </div>
                          <p className={`mt-1 text-xs leading-5 sm:text-sm ${muted}`}>{item.description}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className={`rounded-lg px-2 py-1 text-[10px] font-bold ${config.bg} ${config.color}`}>
                              {config.label}
                            </span>
                            {item.kind && <span className={`text-[10px] font-semibold ${muted}`}>
                              {item.kind}
                            </span>}
                            <div className="ml-auto flex items-center gap-1">
                              {!isRead &&
                                <button
                                  onClick={() => UpdateReadNotify(item.idNotificationUser)}
                                  title="Marcar como lida"
                                  className={`flex items-center gap-1.5 rounded-lg px-2 py-2 transition ${muted} ${darkMode
                                    ? 'hover:bg-white/[0.06]'
                                    : 'hover:bg-surface-100'
                                    }`}
                                >

                                  <Check className="h-4 w-4" />
                                  <span className="text-xs font-medium">
                                    Lida
                                  </span>

                                </button>}
                              <button
                                onClick={() => {
                                  //onRead(item.id);
                                  onNavigate(item.actionUrl as AdminTab);
                                }}
                                className="flex items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-bold text-brand-400 transition hover:bg-brand-500/10">
                                Ver detalhes <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
