import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Zap } from 'lucide-react';
import { useStore } from '../context/store';
import { formatPrice } from '../utils';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../utils/NotificationCard';
import { useState } from 'react';
import ConfirmPopup from './ConfirmPopup';
import { UseUserStore } from '../store/UseUserStore';
import { UseCartStore } from '../store/UseCartStore';
import { UseRouteStore } from '../store/UseRouteStore';
import { getColorConfig } from '../types/Colors';

export default function CartSidebar() {
  const { cartOpen, setCartOpen } = UseCartStore();
  const { navigateTo } = UseRouteStore();
  const { removeFromCart, updateQuantity, cart, cartTotal } = UseCartStore();
  const { user } = UseUserStore();
  const { ColorGlobalTema, ColorGlobalHover, NameColorGlobal } = UseUserStore();
  const colorConfig = getColorConfig(NameColorGlobal);

  const total = cartTotal();
  const navigate = useNavigate();
  const notify = useNotification();
  const [loadingUpdate, setLoadingUpdate] = useState<number | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  if (!cartOpen) return null;
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={() => setCartOpen(false)}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-strong flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-100 bg-surface-950">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${ColorGlobalTema} flex items-center justify-center`}>
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-lg">Seu Carrinho</h2>
              <p className="text-xs text-surface-400 font-body">{cart.cartItensProduct.length} {cart.cartItensProduct.length === 1 ? 'item' : 'itens'}</p>
            </div>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.cartItensProduct.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-surface-300" />
              </div>
              <h3 className="font-display font-semibold text-surface-700 text-lg mb-2">Carrinho vazio</h3>
              <p className="text-surface-400 font-body text-sm mb-6">Adicione produtos incríveis ao seu carrinho</p>
              <button
                onClick={() => { setCartOpen(false); navigateTo('home'); }}
                className={`px-6 py-2.5 ${ColorGlobalTema} ${ColorGlobalHover} text-white font-display font-semibold rounded-xl transition-all shadow-brand text-sm`}
              >
                Explorar Produtos
              </button>
            </div>
          ) : (
            cart.cartItensProduct.map(item => (
              <div key={`${item.product?.id}-${item.selectedVariation?.id}`} className="flex gap-3 p-3 bg-surface-50 rounded-2xl group">
                <img
                  src={`/Imagens/Produtos/${item.product?.imagens[0]?.url_Imagem}`}
                  alt={item.product?.name}
                  className="w-16 h-16 object-cover rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-body font-medium text-surface-800 line-clamp-2 leading-tight">{item.product?.name}</h4>
                  {item.selectedVariation && (
                    <p className="text-xs text-surface-400 font-body mt-0.5">{item.selectedVariation.name}: {item.selectedVariation.value}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-display font-bold text-surface-900 text-sm">{formatPrice(item.product?.price_Unic || 0)}</span>
                    <div className="flex items-center gap-1">
                      {loadingUpdate === item.id ? (
                        <div className="flex items-center justify-center w-[84px]">
                          <div className="w-5 h-5 border-2 border-surface-300  rounded-full animate-spin" style={{ borderTopColor: `${colorConfig.hex}` }} />
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={async () => {
                              setLoadingUpdate(item.id || 0);
                              if (item.quantity === 1) {
                                setOpenDelete(true);
                                setLoadingUpdate(null);
                                return;
                              }
                              const Subtrair = await updateQuantity(item.id || 0, item.product?.id || 0, item.quantity, "Subtrair");
                              if (Subtrair.success) {
                                if (item.quantity === 1) {
                                  notify.success("Produto removido", "O produto foi removido do carrinho");
                                } else {
                                  notify.success("Produto atualizado", "Quantidade atualizada com sucesso");
                                }
                              } else {
                                notify.error(Subtrair.error?.error.code || "error", Subtrair?.error?.error.message || "Não foi possível atualizar");
                              }
                              setLoadingUpdate(null);
                            }}
                            className="w-6 h-6 rounded-lg bg-surface-200 hover:bg-surface-300 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3 h-3 text-surface-600" />
                          </button>

                          <span className="w-6 text-center text-sm font-body font-semibold text-surface-800">
                            {item.quantity}
                          </span>

                          <button onClick={async () => {
                            setLoadingUpdate(item.id || 0);
                            const Soma = await updateQuantity(item.id || 0, item.product?.id || 0, item.quantity, "Soma");
                            if (Soma.success) {
                              notify.success("Produto atualizado", "Quantidade atualizada com sucesso");
                            } else {
                              notify.error(Soma.error?.error.code || "error", Soma?.error?.error.message || "Não foi possível atualizar");
                            }
                            setLoadingUpdate(null);
                          }}
                            className="w-6 h-6 rounded-lg bg-surface-200 hover:bg-surface-300 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3 h-3 text-surface-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => setOpenDelete(true)} className=" p-1.5 rounded-lg text-surface-300 hover:text-red-500 hover:bg-red-50transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ConfirmPopup
                  open={openDelete}
                  title="Remover produto"
                  description="Deseja realmente remover este produto do carrinho?"
                  confirmText="Remover"
                  onCancel={() => { setOpenDelete(false); }}
                  onConfirm={async () => {
                    const result = await removeFromCart(item.id || 0);
                    if (result.success) {
                      notify.success("Produto removido", "O produto foi removido do carrinho");
                    } else {
                      notify.error(result.error?.error.code || "error", result?.error?.error.message || "Não foi possível remover o produto");
                    }
                    setOpenDelete(false);
                  }}
                />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.cartItensProduct.length > 0 && (
          <div className="p-4 border-t border-surface-100 space-y-3">
            {/* PIX discount */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="text-sm font-body text-green-700">Pagando no PIX</span>
              </div>
              <span className="text-sm font-display font-bold text-green-700">{formatPrice(total * 0.95)}</span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="font-body text-surface-600 text-sm">Total</span>
              <div className="text-right">
                <p className="font-display font-bold text-surface-900 text-xl">{formatPrice(total)}</p>
                <p className="text-xs text-surface-400 font-body">ou {formatPrice(total / 12)}/mês</p>
              </div>
            </div>

            {/* Checkout button */}
            <button
              onClick={() => {
                setCartOpen(false);
                if (!user) {
                  navigate("login");
                } else {
                  navigate("checkout");
                }
              }}
              className={`w-full py-3.5 ${ColorGlobalTema} hover:bg-green-600 text-white font-display font-bold rounded-xl transition-all duration-300 hover:shadow-[0_8px_24px_rgba(34,197,94,0.55)] hover:scale-105 active:scale-95 animate-pulse flex items-center justify-center gap-2 text-base`}
            >
              Finalizar Compra
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCartOpen(false)}
              className="w-full py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-600 font-body font-medium rounded-xl transition-all text-sm"
            >
              Continuar Comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
