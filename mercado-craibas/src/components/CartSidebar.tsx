import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Zap } from 'lucide-react';
import { useStore } from '../context/store';
import { formatPrice } from '../utils';

export default function CartSidebar() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, cartTotal, navigateTo, user } = useStore();
  const total = cartTotal();

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
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-lg">Seu Carrinho</h2>
              <p className="text-xs text-surface-400 font-body">{cart.length} {cart.length === 1 ? 'item' : 'itens'}</p>
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
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-surface-300" />
              </div>
              <h3 className="font-display font-semibold text-surface-700 text-lg mb-2">Carrinho vazio</h3>
              <p className="text-surface-400 font-body text-sm mb-6">Adicione produtos incríveis ao seu carrinho</p>
              <button
                onClick={() => { setCartOpen(false); navigateTo('home'); }}
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-display font-semibold rounded-xl transition-all shadow-brand text-sm"
              >
                Explorar Produtos
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={`${item.product.id}-${item.selectedVariation?.id}`} className="flex gap-3 p-3 bg-surface-50 rounded-2xl group">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-body font-medium text-surface-800 line-clamp-2 leading-tight">{item.product.name}</h4>
                  {item.selectedVariation && (
                    <p className="text-xs text-surface-400 font-body mt-0.5">{item.selectedVariation.name}: {item.selectedVariation.value}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-display font-bold text-surface-900 text-sm">{formatPrice(item.product.price)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-surface-200 hover:bg-surface-300 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3 text-surface-600" />
                      </button>
                      <span className="w-6 text-center text-sm font-body font-semibold text-surface-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-surface-200 hover:bg-surface-300 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3 text-surface-600" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1.5 rounded-lg text-surface-300 hover:text-red-500 hover:bg-red-50 transition-all self-start opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
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
                  navigateTo('login');
                } else {
                  navigateTo('checkout');
                }
              }}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-display font-bold rounded-xl transition-all shadow-brand hover:shadow-brand-lg flex items-center justify-center gap-2 text-base"
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
