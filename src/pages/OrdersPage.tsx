import { Package, MapPin, ChevronRight, ArrowLeft, Hash, Calendar, CreditCard, BadgePercent, ShoppingCart, X, Ticket, TicketPercent, ShoppingBag, Star, Loader2, Clock, PackageCheck, UserCheck } from 'lucide-react';
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
  const navigate = useNavigate();
  const { orders } = UseOrderStore();
  const { Cupons } = UseOrderStore();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCupom, setSelectedCupom] = useState<Cupom | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ product: ProductSaveOrder; order: Order } | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const { NameColorGlobal, ColorGlobalHoverText, ColorGlobalTema } = UseUserStore();
  const colorConfig = getColorConfig(NameColorGlobal);

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
            const progress = statusIdx / (orderStatusSteps.length - 1);
            return (
              <div
                key={order.id_Order}
                className="group relative bg-white rounded-3xl shadow-soft overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Barra lateral */}
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

                {/* Header */}
                <div className="border-b border-surface-100 p-4 sm:p-5">
                  {/* Cabeçalho */}
                  <div className="flex items-start gap-3">
                    {/* Produtos */}
                    <div className="flex -space-x-2 shrink-0">
                      {order.products.slice(0, 3).map((item, i) => (
                        <img
                          key={i}
                          src={`/Imagens/Produtos/${item.imagens?.[0]?.url_Imagem ?? ""}`}
                          alt={item.name}
                          className="h-11 w-11 rounded-xl border-2 border-white bg-surface-50 object-cover shadow-sm sm:h-12 sm:w-12"
                        />
                      ))}

                      {order.products.length > 3 && (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-white bg-surface-100 text-[10px] font-bold text-surface-500 shadow-sm sm:h-12 sm:w-12">
                          +{order.products.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="min-w-0 flex-1">
                      {/* Pedido + data */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="truncate text-sm font-bold text-surface-900">
                          Pedido #{order.number_Order}
                        </h3>

                        <span className="h-1 w-1 shrink-0 rounded-full bg-surface-300" />

                        <span className="shrink-0 text-[10px] font-medium text-surface-400 sm:text-[11px]">
                          {new Date(order.insertDate).toLocaleDateString("pt-BR")}
                        </span>
                      </div>

                      {/* Informações secundárias */}
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
                      </div>
                    </div>
                  </div>

                  {/* Status + ações */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
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

                      {/* Cupom */}
                      {order.couponApplied && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1">
                          <Ticket className="h-3 w-3 shrink-0 text-green-600" />

                          <span className="max-w-[110px] truncate text-[9px] font-semibold text-green-700 sm:text-[10px]">
                            {cupomSelecionado?.cod_Cupom}
                          </span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrder(order);
                        setSelectedCupom(
                          Cupons.find((c) => c.id === order.id_Cupom) ?? null
                        );
                      }}
                      className={`
    group/details
    inline-flex
    shrink-0
    items-center
    gap-1.5
    rounded-lg
    border
    border-surface-200
    bg-white
    px-3
    py-2
    text-[10px]
    font-bold
    shadow-sm
    transition-all
    hover:border-surface-300
    hover:bg-surface-50
    hover:shadow
    active:scale-[0.98]
    sm:text-xs
    ${colorConfig.class_text}
  `}
                    >
                      Detalhes

                      <ChevronRight
                        className="
      h-3.5 w-3.5
      transition-transform
      duration-200
      group-hover/details:translate-x-0.5
    "
                      />
                    </button>
                  </div>

                  <Loading
                    loading={Controller?.result.Loading || false}
                    message="Carregando Pedidos..."
                    subMessage="Aguarde..."
                  />
                </div>
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

                          {/* Avaliar */}
                          {!allEvaluated && (
                            <button
                              onClick={() => setExpandedOrder(order.id_Order)}
                              className={` shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl ${ColorGlobalTema} text-white text-[10px] sm:text-[11px] font-bold shadow-sm hover:shadow-md hover:opacity-90 active:scale-95 transition-all`}
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>Avaliar os produtos</span>
                            </button>
                          )}
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
                        {order.products.map((item, i) => {
                          const isHovered = hoveredProduct === i;

                          return (
                            <div
                              key={i}
                              onMouseEnter={() => setHoveredProduct(i)}
                              onMouseLeave={() => setHoveredProduct(null)}
                              className={` rounded-xl p-2 transition-all duration-200 ${isHovered? "bg-surface-50" : "bg-transparent" }`}>
                              {/* Produto */}
                              <div className="flex items-center gap-3">
                                {/* Imagem */}
                                <img
                                  src={`/Imagens/Produtos/${item.imagens?.[0]?.url_Imagem}`}
                                  alt={item.name}
                                  className=" h-11 w-11 shrink-0 rounded-xl object-cover sm:h-12 sm:w-12"
                                />

                                {/* Informações */}
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={` truncate text-xs font-semibold transition-colors duration-200 sm:text-sm ${isHovered
                                        ? colorConfig.class_text
                                        : "text-surface-800"
                                      }`}
                                  >
                                    {item.name}
                                  </p>

                                  <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[10px] text-surface-400 sm:text-xs">
                                    <span>
                                      Qtd:{" "}
                                      <strong className="font-semibold text-surface-600">
                                        {item.quantity}
                                      </strong>
                                    </span>

                                    <span className="h-1 w-1 rounded-full bg-surface-300" />

                                    <span className="font-medium">
                                      {formatPrice(item.price_Unic)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Ações */}
                              {order.order_Status === "ENTREGUE" && (
                                <div
                                  className=" mt-3 flex items-center justify-between gap-2 border-t border-surface-100 pt-3">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/product/${item.id}`)}
                                    className=" inline-flex items-center justify-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3 py-2 text-[10px] font-bold text-surface-600 shadow-sm transition-all duration-200 hover:border-surface-300 hover:bg-surface-50 hover:shadow hover:text-orange-600 active:scale-[0.98] sm:text-xs"
                                  >
                                    <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                                    <span>Comprar novamente</span>
                                  </button>

                                  {/* Avaliação */}
                                  {!item.evaluated ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setReviewTarget({
                                          product: item,
                                          order,
                                        })
                                      }
                                      className={` inline-flex items-center justify-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3 py-2 text-[10px] font-bold shadow-sm transition-all duration-200 hover:border-surface-300 hover:bg-surface-50 hover:shadow active:scale-[0.98] sm:text-xs ${colorConfig.class_text}`}
                                    >
                                      <Star className="h-3.5 w-3.5 shrink-0" />
                                      <span>Avaliar produto</span>
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
                                      disabled={Controller?.result.Loading}
                                      className=" inline-flex items-center justify-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-[10px] font-bold text-green-600 shadow-sm transition-all duration-200 hover:border-green-300 hover:bg-green-100 hover:shadow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:text-xs"
                                    >
                                      {Controller?.result.Loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <Star className="h-3.5 w-3.5 fill-current" />

                                          <span>
                                            Avaliado, obrigado!
                                          </span>
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
