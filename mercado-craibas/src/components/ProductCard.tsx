import { ShoppingCart, Star, Zap, Heart } from 'lucide-react';
import { Product } from '../types';
import { formatPrice, formatDiscount, badgeLabels, badgeColors } from '../utils';
import { useStore } from '../context/store';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const { navigateTo, addToCart, toggleWishlist, isWishlisted } = useStore();
  const discount = product.originalPrice ? formatDiscount(product.originalPrice, product.price) : 0;
  const wishlisted = isWishlisted(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ product, quantity: 1 });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      onClick={() => navigateTo('product', product.id)}
      className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-strong border border-surface-100 hover:border-brand-200"
    >
      <div className="relative overflow-hidden bg-surface-50">
        <div className={`${compact ? 'aspect-square' : 'aspect-[4/3]'} relative`}>
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.badge && <span className={`${badgeColors[product.badge]} text-white text-[10px] font-display font-bold px-2 py-0.5 rounded-full`}>{badgeLabels[product.badge]}</span>}
          {discount > 0 && <span className="bg-rose-500 text-white text-[10px] font-display font-bold px-2 py-0.5 rounded-full">-{discount}%</span>}
        </div>
        {product.freeShipping && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-green-500/90 backdrop-blur-sm text-white text-[9px] font-body font-semibold px-2 py-0.5 rounded-full">🚚 Frete Grátis</span>
          </div>
        )}
        {/* Quick actions */}
        <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button onClick={handleWishlist} className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-medium transition-all ${wishlisted ? 'bg-red-500 text-white' : 'bg-white text-surface-400 hover:text-red-500'}`}>
            <Heart className="w-3 h-3" fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
          <button onClick={handleQuickAdd} className="w-7 h-7 bg-brand-500 hover:bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-brand">
            <ShoppingCart className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="p-3">
        <h3 className={`font-body text-surface-700 leading-tight mb-1.5 line-clamp-2 group-hover:text-brand-600 transition-colors ${compact ? 'text-xs' : 'text-sm'}`}>
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(star => <Star key={star} className={`w-3 h-3 ${star <= Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-surface-200 fill-surface-200'}`} />)}
          </div>
          <span className="text-[10px] text-surface-400 font-body">({product.reviewCount.toLocaleString('pt-BR')})</span>
          {product.sold > 1000 && <span className="text-[10px] text-surface-400 font-body ml-auto">{(product.sold/1000).toFixed(1)}k vendidos</span>}
        </div>
        <div>
          {product.originalPrice && <p className="text-[10px] text-surface-400 font-body line-through leading-none">{formatPrice(product.originalPrice)}</p>}
          <p className={`font-display font-bold text-surface-900 leading-none ${compact ? 'text-base' : 'text-lg'}`}>{formatPrice(product.price)}</p>
          {product.installments && <p className="text-[10px] text-surface-500 font-body mt-0.5">em {product.installments}x de {formatPrice(product.price / product.installments)}</p>}
        </div>
        <div className="mt-2 flex items-center gap-1">
          <Zap className="w-3 h-3 text-brand-500" />
          <span className="text-[10px] font-body font-semibold text-brand-600">{formatPrice(product.price * 0.95)} no PIX</span>
        </div>
      </div>
    </div>
  );
}
