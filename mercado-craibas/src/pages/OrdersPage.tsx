import { Package, MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/store';
import { formatPrice, orderStatusLabels, orderStatusColors, orderStatusSteps } from '../utils';
import { useNavigate } from 'react-router-dom';
import { UseUserStore } from '../store/UseUserStore';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { orders } = useStore();
  const { user } = UseUserStore();

  const userOrders = orders.filter(o => o.userId === user?.id);

  return (
    <div className="min-h-screen bg-surface-50 pb-10">
      <div className="bg-white border-b border-surface-100">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-surface-400 hover:text-surface-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display font-bold text-surface-900 text-xl">Meus Pedidos</h1>
            <p className="text-surface-400 font-body text-xs">{userOrders.length} pedidos realizados</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {userOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-surface-200 mx-auto mb-4" />
            <h2 className="font-display font-bold text-surface-700 text-xl mb-2">Nenhum pedido ainda</h2>
            <p className="text-surface-400 font-body text-sm mb-6">Explore nossos produtos incríveis</p>
            <button onClick={() => navigate('/')} className="px-6 py-3 bg-brand-500 text-white font-display font-bold rounded-xl shadow-brand hover:shadow-brand-lg transition-all">
              Explorar Produtos
            </button>
          </div>) : (
          userOrders.map(order => {
            const statusIdx = orderStatusSteps.indexOf(order.status);
            return (
              <div key={order.id} className="bg-white rounded-3xl shadow-soft overflow-hidden">
                {/* Header */}n
                <div className="flex items-center justify-between p-4 border-b border-surface-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-surface-900 text-sm">#{order.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-display font-bold ${orderStatusColors[order.status]}`}>
                        {orderStatusLabels[order.status]}
                      </span>
                    </div>
                    <p className="text-xs text-surface-400 font-body mt-0.5">
                      {order.createdAt.toLocaleDateString('pt-BR')} · {order.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-surface-900">{formatPrice(order.total)}</p>
                    <p className="text-xs text-surface-400 font-body">{order.items.reduce((s, i) => s + i.quantity, 0)} itens</p>
                  </div>
                </div>

                {/* Progress */}
                {order.status !== 'cancelado' && order.status !== 'pendente' && (
                  <div className="px-4 py-3 bg-surface-50 border-b border-surface-100">
                    <div className="flex items-center justify-between relative">
                      <div className="absolute left-0 right-0 h-0.5 bg-surface-200 top-3.5 mx-7" />
                      <div
                        className="absolute left-7 h-0.5 bg-brand-400 top-3.5 transition-all duration-500"
                        style={{ width: `${(statusIdx / (orderStatusSteps.length - 1)) * (100 - 14)}%` }}
                      />
                      {orderStatusSteps.map((s, i) => {
                        const done = i <= statusIdx;
                        return (
                          <div key={s} className="flex flex-col items-center gap-1 relative z-10">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-[9px] font-bold transition-all ${done ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-surface-200 text-surface-300'}`}>
                              {done ? '✓' : i + 1}
                            </div>
                            <span className={`text-[8px] font-body text-center max-w-[50px] leading-tight hidden sm:block ${done ? 'text-brand-600' : 'text-surface-300'}`}>
                              {orderStatusLabels[s]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="p-4 space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-3 cursor-pointer group" onClick={() => navigate(`/product/${item.product.id}`)}>
                      <img src={item.product.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-surface-700 line-clamp-1 group-hover:text-brand-600 transition-colors">{item.product.name}</p>
                        <p className="text-xs text-surface-400 font-body">Qtd: {item.quantity} · {formatPrice(item.product.price)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-surface-300 shrink-0 self-center group-hover:text-brand-400 transition-colors" />
                    </div>
                  ))}
                </div>

                {/* Footer */}
                {(order.trackingCode || order.address) && (
                  <div className="px-4 pb-4 pt-0 flex items-center justify-between text-xs text-surface-400 font-body border-t border-surface-50 pt-3">
                    {order.address && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{order.address.road}, {order.address.number} · {order.address.city}</span>
                      </div>
                    )}
                    {order.trackingCode && (
                      <span className="font-display font-semibold text-brand-500">{order.trackingCode}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
