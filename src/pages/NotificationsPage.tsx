import { useMemo, useState } from 'react';
import { Bell, CalendarDays, Check, CheckCheck, ChevronRight, CircleCheck, CircleX, Clock, Clock3, CreditCard, History, Package, PackageCheck, Search, ShoppingCart, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buildClientNotifications, ClientNotificationKind } from '../models/ClientNotification';
import { UseOrderStore } from '../store/UseOrderStore';
import { UseUserStore } from '../store/UseUserStore';
import { getColorConfig } from '../types/Colors';
import { UseNotificationAdmin } from '../storeAdmin/UseNotificationAdmin';
import { useNotificationsController } from '../controller/useNotificationsController';
import { NotificationModel } from '../models/NotificationModel';

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const dayTitle = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (dateKey(date) === dateKey(today)) return 'Hoje';
  if (dateKey(date) === dateKey(yesterday)) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
};
const relativeTime = (date: Date) => {
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return 'Agora'; if (minutes < 60) return `Há ${minutes} min`;
  const hours = Math.floor(minutes / 60); if (hours < 24) return `Há ${hours}h`;
  const days = Math.floor(hours / 24); return days === 1 ? 'Ontem' : `Há ${days} dias`;
};

const kindConfig = {
  ORDER: { label: 'Pedido', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
  DELIVERY: { label: 'Entrega', icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  PAYMENT: { label: 'Pagamento', icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
};
function getNotificationKind(
  item: NotificationModel
): keyof typeof kindConfig {
  const value = `${item.referenceType} ${item.kind}`.toLowerCase();

  if (value.includes('ORDER') || value.includes('pedido')) {
    return 'ORDER';
  }

  if (value.includes('DELIVERY') || value.includes('delivery')) {
    return 'DELIVERY';
  }

  return 'PAYMENT';

}
export default function NotificationsPage() {
  const navigate = useNavigate();
  const Controller = useNotificationsController();
  const { Notification, UpdateReadNotify, UpdateReadNotifyAll } = UseNotificationAdmin();
  console.log("NotificationCliente", Notification)
  const { orders } = UseOrderStore();
  const { user, NameColorGlobal } = UseUserStore();
  const [view, setView] = useState<'week' | 'history'>('week');
  const [selectedDay, setSelectedDay] = useState(dateKey(new Date()));
  console.log("selectedDay", selectedDay)
  const [historyDate, setHistoryDate] = useState('');
  console.log("historyDate", historyDate)
  const [filter, setFilter] = useState<'all' | 'unread' | ClientNotificationKind>('unread');
  const [search, setSearch] = useState('');
  const color = getColorConfig(NameColorGlobal);
  const notifications = Notification;


  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - index); return date; }), []);
  const notificationIcons = { CircleCheck, Package, Truck, PackageCheck, CircleX, Bell, ShoppingCart, Clock };

  const filtered = useMemo(() => notifications.filter(item => {
    const date = new Date(item.insertDate);
    const term = search.trim().toLowerCase();
    const weekStart = weekDays[6];
    const matchesPeriod = view === 'history' ? (!historyDate || dateKey(date) === historyDate) : (date >= weekStart && (selectedDay === 'all' || dateKey(date) === selectedDay));
    const matchesType = filter === 'READ' ? (item.isRead === true) : filter === 'all' ? (item) : (filter === 'unread' || item.referenceType === filter) && item.isRead === false;
    return matchesPeriod && matchesType && (!term || `${item.title} ${item.description} ${item.referenceType}`.toLowerCase().includes(term));
  }), [filter, historyDate, notifications, search, selectedDay, view, weekDays]);
  console.log("filtered", filtered)
  const groups = useMemo(() =>
    filtered
      .reduce<Array<{
        key: string;
        date: Date;
        items: typeof filtered;
      }>>((all, item) => {
        const date = new Date(item.insertDate);
        const key = dateKey(date);

        const group = all.find(entry => entry.key === key);

        if (group) {
          group.items.push(item);
        } else {
          all.push({
            key,
            date: new Date(item.insertDate),
            items: [item]
          });
        }

        return all;
      }, [])
      .sort((a, b) => b.date.getTime() - a.date.getTime()),
    [filtered]
  );
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
  const unreadPayment = Notification.filter(item => item.isRead === false && item.referenceType === "PAYMENT" && matchesSelectedPeriod(item.insertDate)).length;
  const unreadDelivery = Notification.filter(item => item.isRead === false && item.referenceType === "DELIVERY" && matchesSelectedPeriod(item.insertDate)).length;
  const unreadAssessment = Notification.filter(item => item.isRead === false && item.referenceType === "ASSESSMENT" && matchesSelectedPeriod(item.insertDate)).length;
  const unreadAllRead = notifications.filter(item => item.isRead === true && matchesSelectedPeriod(item.insertDate)).length;
  // const unreadOrder = Notification.filter(item => item.isRead === false && item.referenceType === "ORDER" && (dateKey(new Date(item.insertDate)) === selectedDay || (dateKey(new Date(item.insertDate)) === historyDate))).length;
  // const unreadPayment = Notification.filter(item => item.isRead === false && item.referenceType === "PAYMENT" && (dateKey(new Date(item.insertDate)) === selectedDay || (dateKey(new Date(item.insertDate)) === historyDate))).length;
  // const unreadDelivery = Notification.filter(item => item.isRead === false && item.referenceType === "DELIVERY" && (dateKey(new Date(item.insertDate)) === selectedDay || (dateKey(new Date(item.insertDate)) === historyDate))).length;
  // const unreadAllRead = notifications.filter(item => item.isRead === true && (dateKey(new Date(item.insertDate)) === selectedDay || (dateKey(new Date(item.insertDate)) === historyDate))).length;
  return <main className="min-h-screen bg-surface-50 pb-12">
    <div className="mx-auto w-full max-w-6xl space-y-4 px-3 py-5 sm:space-y-5 sm:px-6 sm:py-8">
      <section className="relative overflow-hidden rounded-3xl border border-surface-200 bg-white p-5 shadow-soft sm:p-7">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: color.hex }} />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl sm:h-12 sm:w-12 ${color.class}`}>
              <Bell className="h-5 w-5 text-white" />
              {unread > 0 && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-red-500" />}
            </div>
            <div className="min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${color.class_text}`}>
                Central do cliente
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold text-surface-900 sm:text-3xl">
                Notificações
              </h1>
              <p className="mt-1 text-sm text-surface-500">
                Acompanhe seus pedidos, pagamentos e entregas.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 sm:justify-start">
            <div>
              <p className={`text-2xl font-black leading-none ${color.class_text}`}>
                {unread}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase text-surface-400">
                não lidas
              </p>
            </div>
            <button
              onClick={() => UpdateReadNotifyAll()}
              disabled={!unread}
              className={` flex items-center gap-2 border-l border-surface-200 rounded-r-lg pl-3 pr-2 py-1.5 text-xs font-bold transition-all duration-200 hover:bg-surface-300 hover:scale-[1.03] active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:scale-100 ${color.class_text}`}
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 rounded-2xl border border-surface-200 bg-white p-2">
        <button
          onClick={() => {
            setView('week');
            setHistoryDate('');
            setSelectedDay(dateKey(new Date()));
          }}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-bold sm:text-sm ${view === 'week' ? `${color.class} text-white` : 'bg-surface-50 text-surface-500'}`}>
          <CalendarDays className="h-4 w-4" /> Esta semana
        </button>
        <button
          onClick={() => { setView('history'); setSelectedDay('all'); }}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-bold sm:text-sm ${view === 'history' ? `${color.class} text-white` : 'bg-surface-50 text-surface-500'}`}>
          <History className="h-4 w-4" /> Histórico
        </button>
      </section>

      {view === 'week' ?
        <section className="rounded-2xl border border-surface-200 bg-white p-3 sm:p-4">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-surface-900">
              Filtrar por dia
            </h2>
            <p className="text-xs text-surface-400">
              Últimos sete dias
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">

            {weekDays.map(day => {
              const key = dateKey(day); const count = notifications.filter(item => dateKey(new Date(item.insertDate)) === key).length;
              return <button
                key={key}
                onClick={() => setSelectedDay(key)}
                className={`min-w-[92px] rounded-xl px-3 py-2 text-left ${selectedDay === key ? `${color.class} text-white` : 'bg-surface-100 text-surface-500'}`}>
                <span className="block text-[10px] font-bold uppercase">
                  {key === dateKey(new Date()) ? 'Hoje' : day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </span>
                <span className="text-xs font-semibold">{day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} · {count}
                </span>
              </button>;
            })}
            <button
              onClick={() => setSelectedDay('all')}
              className={`min-w-fit rounded-xl px-3 py-2 text-xs font-bold ${selectedDay === 'all' ? `${color.class} text-white` : 'bg-surface-100 text-surface-500'}`}>
              Todos
            </button>
          </div>
        </section>
        : <section className="rounded-2xl border border-surface-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-surface-900">
                Histórico por data
              </h2>
              <p className="text-xs text-surface-400">
                Escolha um dia ou veja todo o período.
              </p>
            </div>
            <input
              type="date"
              max={dateKey(new Date())}
              value={historyDate}
              onChange={event => setHistoryDate(event.target.value)}
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5 text-sm outline-none sm:w-auto" />
          </div>
        </section>}

      <section className="rounded-2xl border border-surface-200 bg-white p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {([{ id: 'all', label: 'Todas' },
            { id: 'unread', label: `Não lidas (${unread})` },
            { id: 'ORDER', label: `Pedidos(${unreadOrder})` },
            { id: 'DELIVERY', label: `Entregas(${unreadDelivery})` },
            { id: 'ASSESSMENT', label: `Avaliação(${unreadAssessment})` },
            { id: 'PAYMENT', label: `Pagamentos(${unreadPayment})` },
            { id: 'READ', label: `Lidas(${unreadAllRead})` },] as const).map(item =>
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold ${filter === item.id ? `${color.class} text-white` : 'bg-surface-100 text-surface-500'}`}>
                {item.label}
              </button>)}
          </div>
          <label className="flex min-w-0 items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5 lg:w-72">
            <Search className="h-4 w-4 shrink-0 text-surface-400" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Buscar notificações..."
              className="w-full bg-transparent text-sm outline-none" />
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-surface-200 bg-white">
        <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3 sm:px-5">
          <div>
            <h2 className="text-sm font-bold text-surface-900">
              {view === 'history' ? 'Histórico de notificações' : 'Notificações da semana'}
            </h2>
            <p className="text-xs text-surface-400">
              {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
            </p>
          </div>
          <Clock3 className="h-4 w-4 text-surface-400" />
        </div>
        {!filtered.length ? <div className="flex flex-col items-center px-5 py-14 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
            <CheckCheck className="h-6 w-6 text-green-500" />
          </div>
          <h3 className="font-bold text-surface-900">
            Tudo em dia por aqui
          </h3>
          <p className="mt-1 text-sm text-surface-400">
            Nenhuma notificação corresponde aos filtros.
          </p>
        </div>
          : groups.map(group => <div key={group.key}>
            <div className="flex items-center justify-between border-y border-surface-100 bg-surface-50 px-4 py-2.5 sm:px-5">
              <h3 className="text-xs font-bold capitalize text-surface-700">
                {dayTitle(group.date)}
              </h3>
              <span className="text-[10px] text-surface-400">
                {group.items.length} itens
              </span>
            </div>
            <div className="divide-y divide-surface-100">
              {group.items.map(item => {
                const notificationKind = getNotificationKind(item);
                const config = kindConfig[notificationKind];
                const isRead = item.isRead;
                const Icon =
                  notificationIcons[item.icone as keyof typeof notificationIcons] ?? Bell;
                return <article key={item.idNotificationUser} className={`relative flex gap-3 p-4 sm:gap-4 sm:p-5 ${!isRead ? 'bg-brand-50/50' : ''}`}>
                  {!isRead && <span className={`absolute inset-y-0 left-0 w-0.5 ${color.class}`} />}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg} ${config.color}`}>
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg} ${config.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <h4 className={`text-sm text-surface-900 ${isRead ? 'font-semibold' : 'font-bold'}`}>{item.title}
                      </h4>
                      <div className="flex shrink-0 items-center gap-2">
                        {isRead && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
                            <CheckCheck className="h-3.5 w-3.5" />
                            Lida
                          </span>
                        )}

                        <time className="text-[11px] text-surface-400">
                          {relativeTime(new Date(item.insertDate))}
                        </time>
                      </div>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-surface-500 sm:text-sm">
                      {item.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`rounded-lg px-2 py-1 text-[10px] font-bold ${config.bg} ${config.color}`}>{config.label}
                      </span>
                      <span className="text-[10px] font-semibold text-surface-400">
                        Pedido #{orders.find(o => o.id_Order === item.referenceId)?.number_Order}


                      </span>
                      <div className="ml-auto flex items-center gap-1.5">
                        {!isRead && (
                          <button
                            onClick={() => UpdateReadNotify(item.idNotificationUser)}
                            title="Marcar como lida"
                            className=" flex items-center gap-1 rounded-lg border border-surface-200 bg-surface-50 px-2 py-1.5 text-[11px] font-semibold text-surface-500 transition-all hover:border-green-300 hover:bg-green-50 hover:text-green-600 active:scale-95">
                            <Check className="h-3.5 w-3.5" />
                            Lida
                          </button>
                        )}

                        <button
                          onClick={() => {
                            navigate('/orders');
                          }}
                          className={` flex items-center gap-1 rounded-lg border border-surface-200 bg-surface-50 px-2 py-1.5 text-[11px] font-bold transition-all hover:bg-surface-100 active:scale-95 ${color.class_text}`}>
                          Ver pedido
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>;
              })}
            </div>
          </div>)}
      </section>
    </div>
  </main>;
}
