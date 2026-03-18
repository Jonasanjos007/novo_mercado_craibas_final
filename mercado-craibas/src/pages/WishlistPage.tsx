import { Heart, ArrowLeft, ShoppingCart, Trash2, Share2 } from 'lucide-react';
import { useStore } from '../context/store';
import { formatPrice, badgeColors, badgeLabels } from '../utils';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart, navigateTo } = useStore();

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="bg-white border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center gap-3">
          <button onClick={() => navigateTo('home')} className="p-2 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            </div>
            <div>
              <h1 className="font-display font-bold text-surface-900 text-xl">Lista de Desejos</h1>
              <p className="text-surface-400 text-xs">{wishlist.length} {wishlist.length === 1 ? 'item' : 'itens'} salvos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-5">
              <Heart className="w-10 h-10 text-red-300" />
            </div>
            <h3 className="font-display font-bold text-surface-700 text-xl mb-2">Sua lista está vazia</h3>
            <p className="text-surface-400 font-body text-sm mb-6">Salve produtos que você gosta para comprar depois!</p>
            <button
              onClick={() => navigateTo('home')}
              className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-display font-bold rounded-xl transition-all shadow-brand"
            >
              Explorar Produtos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlist.map(({ product, addedAt }) => {
              const disc = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
              return (
                <div key={product.id} className="bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-medium hover:-translate-y-0.5 transition-all group">
                  <div className="relative aspect-square overflow-hidden bg-surface-50 cursor-pointer" onClick={() => navigateTo('product', product.id)}>
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {product.badge && (
                      <span className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColors[product.badge]}`}>
                        {badgeLabels[product.badge]}
                      </span>
                    )}
                    {disc > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{disc}%</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-body text-surface-700 text-xs line-clamp-2 mb-2 leading-relaxed">{product.name}</p>
                    <div className="mb-3">
                      {product.originalPrice && (
                        <p className="text-surface-300 text-[10px] line-through">{formatPrice(product.originalPrice)}</p>
                      )}
                      <p className="font-display font-bold text-surface-900 text-lg">{formatPrice(product.price)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart({ product, quantity: 1 })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Comprar
                      </button>
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="p-2 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 text-red-400 transition-all"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-surface-300 text-[10px] mt-2 font-body text-center">
                      Salvo em {addedAt.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
