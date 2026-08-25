import { Package, MapPin, ChevronRight, ArrowLeft, Hash, Calendar, CreditCard, BadgePercent, ShoppingCart, X, Ticket, TicketPercent, ShoppingBag, Star, Loader2 } from 'lucide-react';
import { useStore } from '../context/store';
import { formatPrice, orderStatusLabels, orderStatusColors, orderStatusSteps } from '../utils';
import { useNavigate } from 'react-router-dom';
import { UseUserStore } from '../store/UseUserStore';
import { UseOrderStore } from '../store/UseOrderStore';
import { useOrdersController } from '../controller/useOrdersController';
import { getColorConfig } from '../types/Colors';
import Headerpages from '../components/Headerpages';
import { useState } from 'react';
import { Order } from '../models/OrderSave';
import { Cupom } from '../models/Cupom';
import Loading from '../components/Loading';
import ProductReviewModal from '../components/ProductReviewModal';
import ProductReviewDetailsModal from '../components/ProductReviewDetailsModal';
import { ProductSaveOrder } from '../models/Product';

export default function OrdersPage() {
  const Controller = useOrdersController();
  console.log("testeteste", Controller?.result.assessmentResponse);
  const navigate = useNavigate();
  const { orders } = UseOrderStore();
  const { Cupons } = UseOrderStore();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCupom, setSelectedCupom] = useState<Cupom | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ product: ProductSaveOrder; order: Order } | null>(null);

  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const { NameColorGlobal, ColorGlobalHoverText, ColorGlobalTema } = UseUserStore();
  const colorConfig = getColorConfig(NameColorGlobal);
  console.log('orders:', orders);
  console.log('selectedCupom:', selectedCupom);

  const userOrders = orders;
  const getTotalOriginalOrder = (idOrder: number) => {
    const order = orders.find(o => o.id_Order === idOrder);

    if (!order) return 0;

    return order.products.reduce((total, produto) => {
      return total + (Number(produto.origin_Price) * Number(produto.quantity));
    }, 0);
  };
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const filteredOrders = statusFilter === "TODOS" ? orders : orders.filter(o => o.order_Status === statusFilter);

  const filters = [
    { label: "Todos", value: "TODOS" },
    { label: "Pendente", value: "PENDENTE" },
    { label: "Confirmado", value: "CONFIRMADO" },
    { label: "Preparando", value: "PREPARANDO" },
    { label: "Saiu p/ entrega", value: "SAIU_PARA_ENTREGA" },
    { label: "Entregue", value: "ENTREGUE" },
    { label: "Cancelado", value: "CANCELADO" },
  ];
  return (
    <div className="min-h-screen bg-surface-50 pb-10">

      <Headerpages title="Meus Pedidos" showSecure={false} />
      <div className="bg-white border-b border-surface-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">

          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>
              <h1 className="font-display font-bold text-surface-900 text-2xl">
                Meus Pedidos
              </h1>

              <p className="text-sm text-surface-400 mt-1">
                {orders.length} {orders.length === 1 ? "pedido realizado" : "pedidos realizados"}
              </p>
            </div>

            {/* Estatística */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface-50 border border-surface-100 w-fit">
              <Package className={`w-5 h-5 ${colorConfig.class_text}`} />
              <div>
                <p className="text-xs text-surface-400">Total</p>
                <p className="font-bold text-surface-900">
                  {filteredOrders.length}
                </p>
              </div>
            </div>

          </div>

          {/* Filtros */}
          <div className="mt-5 -mx-4 sm:mx-0">
            <div className="flex gap-2 overflow-x-auto px-4 sm:px-0 pb-2 scrollbar-hide">

              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`shrink-0 px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200
              ${statusFilter === filter.value
                      ? `${ColorGlobalTema} text-white shadow-lg scale-105`
                      : "bg-surface-100 text-surface-500 hover:bg-surface-200 hover:text-surface-700"
                    }`}>
                  {filter.label}
                </button>
              ))}

            </div>
          </div>

        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-surface-200 mx-auto mb-4" />
            <h2 className="font-display font-bold text-surface-700 text-xl mb-2">Nenhum pedido ainda</h2>
            <p className="text-surface-400 font-body text-sm mb-6">Explore nossos produtos incríveis</p>
            <button onClick={() => navigate('/')} className={`px-6 py-3 ${ColorGlobalTema} text-white font-display font-bold rounded-xl shadow-brand hover:shadow-brand-lg transition-all`}>
              Explorar Produtos
            </button>
          </div>) : (
          filteredOrders.map(order => {
            const statusIdx = orderStatusSteps.indexOf(order.order_Status);
            const itemsCount = order.products.reduce((s, i) => s + i.quantity, 0);
            const isPending = order.status_Pay === "PENDENTE";
            const cupomSelecionado = Cupons.find(c => c.id === order.id_Cupom) ?? null;

            return (
              <div
                key={order.id_Order}
                className="group relative bg-white rounded-3xl shadow-soft overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Barra lateral */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${colorConfig.class} scale-y-0 group-hover:scale-y-100 transition-transform rounded-r-full`}
                />

                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-surface-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 min-w-0">
                      <div className="flex -space-x-2 shrink-0">
                        {order.products.slice(0, 3).map((item, i) => (
                          <img
                            key={i}
                            src={`/Imagens/Produtos/${item.imagens?.[0]?.url_Imagem}`}
                            className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl border-2 border-white shadow object-cover"
                          />
                        ))}

                        {order.products.length > 3 && (
                          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-surface-100 border-2 border-white flex items-center justify-center text-xs font-bold shrink-0">
                            +{order.products.length - 3}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-surface-900 text-sm truncate">
                          Pedido #{order.number_Order}
                        </h3>

                        <p className="text-xs text-surface-400 mt-0.5">
                          {new Date(order.insertDate).toLocaleDateString("pt-BR")} •{" "}
                          {itemsCount} {itemsCount === 1 ? "item" : "itens"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="font-display font-bold text-base sm:text-xl text-surface-900">
                        {formatPrice(order.total_Value_Order)}
                      </p>

                      <button
                        onClick={() => {
                          setSelectedOrder(order),
                            setSelectedCupom(Cupons.find(c => c.id === order.id_Cupom) ?? null)

                        }}
                        className={`flex items-center gap-0.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${colorConfig.class_text} bg-surface-50 hover:bg-surface-100 transition-all whitespace-nowrap`}
                      >
                        Detalhes
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Badges: agora fora da coluna do título, com a largura total do card */}
                  <div className="flex flex-wrap items-center gap-0.5 mt-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${orderStatusColors[order.order_Status]}`}
                    >
                      {orderStatusLabels[order.order_Status]}
                    </span>

                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Pagamento pendente
                      </span>
                    )}

                    {order.couponApplied && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
                        <Ticket className="w-3 h-3 text-green-600 shrink-0" />
                        <span className="text-[10px] font-semibold text-green-700 truncate max-w-[110px]">
                          Cupom: {cupomSelecionado?.cod_Cupom}
                        </span>
                      </span>
                    )}
                  </div>
                  <Loading
                    loading={Controller?.result.Loading || false}
                    message="Carregando Pedidos..."
                    subMessage="Aguarde..."
                  />
                </div>
                {/* Timeline */}
                {
                  !isPending && (
                    <div className="px-5 py-4 bg-surface-50 border-b border-surface-100">
                      <div className="flex justify-between relative">

                        <div className="absolute left-7 right-7 top-3.5 h-1 bg-surface-200 rounded-full" />

                        <div
                          className="absolute left-7 top-3.5 h-1 bg-green-600 rounded-full transition-all"
                          style={{
                            width: `${(statusIdx / (orderStatusSteps.length - 1)) * 84}%`
                          }}
                        />

                        {orderStatusSteps.map((step, i) => {
                          const done = i <= statusIdx;

                          return (
                            <div key={step} className="relative z-10 flex flex-col items-center">

                              <div
                                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold
                                 ${done
                                    ? "bg-green-600 border-green-600 text-white"
                                    : "bg-white border-surface-300 text-surface-300"
                                  }`}
                              >
                                {done ? "✓" : i + 1}
                              </div>

                              <span
                                className={`mt-1 text-[9px] text-center max-w-[55px]
                                 ${done
                                    ? "text-green-600"
                                    : "text-surface-400"
                                  }`}
                              >
                                {orderStatusLabels[step]}
                              </span>

                            </div>
                          );
                        })}

                      </div>
                    </div>
                  )
                }

                {/* Produtos */}
                <div className=" space-y-3">

                  <div className="px-5 py-4 border-t border-surface-100">

                    <button
                      onClick={() =>
                        setExpandedOrder(expandedOrder === order.id_Order ? null : order.id_Order)
                      }
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 hover:bg-surface-100 transition-all ${colorConfig.class_group_hover_text}`}
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span className="font-semibold text-sm">
                          {expandedOrder === order.id_Order ? "Ocultar produtos" : `Ver produtos (${order.products.length})`}
                        </span>
                      </div>

                      <ChevronRight
                        className={`w-5 h-5 transition-transform ${expandedOrder === order.id_Order ? "rotate-90" : ""
                          }`}
                      />
                    </button>

                    {expandedOrder === order.id_Order && (
                      <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                        {order.products.map((item, i) => (
                          <div
                            key={i}
                            className=" group/item rounded-xl p-2 transition-all hover:bg-surface-50"
                          >
                            {/* Linha principal */}
                            <div className="flex items-center gap-3">
                              <img
                                src={`/Imagens/Produtos/${item.imagens?.[0]?.url_Imagem}`}
                                className=" h-11 w-11 shrink-0 rounded-xl object-cover sm:h-12 sm:w-12"
                                alt={item.name}
                              />

                              {/* Informações */}
                              <div className="min-w-0 flex-1">
                                <p
                                  className={` truncate text-xs font-semibold transition-colors sm:text-sm ${colorConfig.class_group_hover_text}`}
                                >
                                  {item.name}
                                </p>

                                <p className="mt-0.5 text-[10px] leading-4 text-surface-400 sm:text-xs">
                                  Qtd: {item.quantity}
                                </p>

                                <p className="text-[10px] font-medium text-surface-400 sm:text-xs">
                                  {formatPrice(item.price_Unic)}
                                </p>
                              </div>

                              {/* Comprar novamente */}
                              <div className="relative shrink-0 group/comprar">
                                <button
                                  onClick={() => navigate(`/product/${item.id}`)}
                                  aria-label={`Comprar novamente ${item.name}`}
                                  className=" flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 hover:bg-surface-100 sm:h-9 sm:w-9"
                                >
                                  <ChevronRight
                                    className={` h-4 w-4 text-surface-300 transition-all duration-200 group-hover/comprar:translate-x-0.5 ${colorConfig.class_group_hover_text}`}
                                  />
                                </button>

                                {/* Tooltip apenas desktop */}
                                <div
                                  className=" pointer-events-none absolute bottom-full right-0 z-50 mb-2 min-w-max max-w-[250px] translate-y-1 rounded-lg bg-surface-900 px-3 py-2 text-[11px] text-white opacity-0 shadow-lg transition-all duration-200 group-hover/comprar:translate-y-0 group-hover/comprar:opacity-100"
                                >
                                  <p className="font-bold">
                                    Comprar novamente
                                  </p>

                                  <p className="mt-0.5 max-w-[220px] truncate text-white/70">
                                    {item.name}
                                  </p>

                                  <div
                                    className=" absolute right-3 top-full h-0 w-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-surface-900"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Ações */}
                            {order.order_Status === 'ENTREGUE' && (
                              <div className="mt-2 flex justify-end pl-14 sm:mt-0 sm:pl-0">
                                {!item.evaluated ? (
                                  <button
                                    onClick={() => setReviewTarget({ product: item, order })}
                                    className={` flex items-center justify-center gap-1 rounded-lg bg-surface-100 px-3 py-1.5 text-[11px] font-bold transition-colors hover:bg-surface-200 sm:px-3 sm:py-2 sm:text-xs ${colorConfig.class_text}`}
                                  >
                                    <Star className="h-3.5 w-3.5" />
                                    Avaliar
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => Controller?.action.handleGetAssents(order.id_Order, item.id)}
                                    className=" flex items-center justify-center gap-1 rounded-lg bg-green-50 px-2.5 py-1.5 text-[10px] font-bold text-green-600 transition-colors hover:bg-green-100 sm:px-3 sm:py-2 sm:text-xs"
                                  >{Controller?.result.Loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Star className="h-3.5 w-3.5 fill-current" />

                                      <span className="sm:hidden">
                                        Avaliado, obrigado!
                                      </span>

                                      <span className="hidden sm:inline">
                                        Avaliado, obrigado!
                                      </span>
                                    </>
                                  )}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-surface-100 flex flex-wrap justify-between gap-3 text-xs">

                  <div className="flex items-center gap-2 text-surface-500">
                    <MapPin className="w-4 h-4" />
                    {order.address.road}, {order.address.number} • {order.address.city}
                  </div>

                  <span className={`font-semibold ${colorConfig.class_text}`}>
                    #{order.number_Order}
                  </span>

                </div>
              </div>
            );
          })
        )}
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

                  {(selectedOrder.discont > 0) && selectedOrder.couponApplied && (
                    <div className="flex items-start gap-2 p-3 bg-surface-50 rounded-xl">
                      <BadgePercent className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-surface-400 font-body">Disconto</p>
                        <p className="text-sm font-bold text-surface-900">
                          {formatPrice(selectedOrder.discont)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedOrder.discount_Type === "FreeShipping" && (
                    <div className="flex items-start gap-2 p-3 bg-surface-50 rounded-xl">
                      <BadgePercent className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-surface-400 font-body">Cupom</p>
                        <p className="text-sm font-bold text-surface-900">
                          Frete Grátis
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {selectedOrder.id_Cupom && (
                  <div className="grid grid-cols-2 gap-2">

                    <div className="flex items-start gap-2 p-3 bg-surface-50 rounded-xl">
                      <ShoppingBag className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-surface-400 font-body">Cupom Mín. compra</p>
                        <p className="text-sm font-bold text-surface-900">
                          {formatPrice(selectedCupom?.minimum_Value || 0)}
                        </p>
                      </div>
                    </div>
                    {selectedOrder.couponApplied && (
                      <div className="flex items-start gap-2 p-3 bg-surface-50 rounded-xl">
                        <TicketPercent className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-black-400 font-body">Cupom aplicado</p>
                          <p className="text-sm font-bold text-surface-900 truncate">
                            {selectedCupom?.cod_Cupom}
                          </p>
                        </div>
                      </div>)}
                  </div>
                )}
                {/* Endereço */}
                {selectedOrder.address && (
                  <div className="rounded-xl bg-surface-50 p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-surface-400 mt-1 shrink-0" />

                      <div className="flex-1">
                        <p className="text-xs text-surface-500 mb-2">
                          Endereço de entrega
                        </p>

                        <h3 className="text-base font-bold text-surface-900">
                          {selectedOrder.address.road}, {selectedOrder.address.number}
                        </h3>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3 text-sm">
                          <div>
                            <span className="text-surface-500">Destinatário</span>
                            <p className="font-medium">
                              {selectedOrder.address.name}
                            </p>
                          </div>

                          <div>
                            <span className="text-surface-500">Bairro</span>
                            <p className="font-medium">
                              {selectedOrder.address.neighborhood || "-"}
                            </p>
                          </div>

                          <div>
                            <span className="text-surface-500">Cidade</span>
                            <p className="font-medium">
                              {selectedOrder.address.city}
                            </p>
                          </div>

                          <div>
                            <span className="text-surface-500">Estado</span>
                            <p className="font-medium">
                              {selectedOrder.address.state || "-"}
                            </p>
                          </div>

                          {selectedOrder.address.supplement && (
                            <div className="col-span-2">
                              <span className="text-surface-500">Complemento</span>
                              <p className="font-medium">
                                {selectedOrder.address.supplement}
                              </p>
                            </div>
                          )}

                          {selectedOrder.address.referencePoint && (
                            <div className="col-span-2">
                              <span className="text-surface-500">Ponto de referência</span>
                              <p className="font-medium">
                                {selectedOrder.address.referencePoint}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
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

                        <div className="flex flex-col items-end">
                          <p className="text-sm font-bold text-surface-900 shrink-0">
                            {formatPrice(item.price_Unic * item.quantity)}
                          </p>


                          {(item.valorDicont || 0) > 0 && (<p className="text-sm font-bold text-green-600 shrink-0">
                            Cupom:{formatPrice(item.valorDicont || 0)}
                          </p>)}

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
                          {(selectedOrder.total_Value_OrderCupom || 0) > 0 && (
                            <span className="font-semibold text-surface-900">
                              {formatPrice((selectedOrder.total_Value_OrderCupom || 0))}
                            </span>)}

                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-surface-500">
                            Desconto Total
                          </span>
                          {selectedOrder.discont === 0 ?
                            (
                              <span className="font-bold text-green-600">
                                Fréte Grátis
                              </span>
                            ) : (
                              <span className="font-bold text-green-600">
                                - {formatPrice(selectedOrder.discont)}
                              </span>)}

                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-surface-500">
                        Frete
                      </span>

                      <span
                        className={`font-semibold ${selectedOrder.discount_Type === "FreeShipping"
                          ? "text-green-600"
                          : "text-surface-900"
                          }`}
                      >
                        {selectedOrder.discount_Type === "FreeShipping"
                          ? "Grátis"
                          : formatPrice(selectedOrder.shippingCost || 0)}
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
        <ProductReviewModal
          open={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          product={reviewTarget?.product || null}
          orderId={reviewTarget?.order.id_Order || 0}
          orderNumber={reviewTarget?.order.number_Order}
          themeClass={`${ColorGlobalTema} hover:opacity-90`} />

        <ProductReviewDetailsModal
          open={!!Controller?.result.reviewDetailsTarget}
          onClose={() => Controller?.action.setReviewDetailsTarget(false)}
          assessment={Controller?.result.assessmentResponse}
        />
      </div>

    </div >
  );

}
