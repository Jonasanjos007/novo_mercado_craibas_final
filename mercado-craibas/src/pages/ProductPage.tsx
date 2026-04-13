import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Zap, Shield, Truck, RefreshCw, Heart, Share2, Check, Package, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/store';
import { formatPrice, formatDiscount, badgeLabels, badgeColors, orderStatusLabels } from '../utils';
import ProductCard from '../components/ProductCard';
import { useProductController } from '../controller/useProductController';
import { useParams } from 'react-router-dom';
import { useNotification } from '../utils/NotificationCard';

export const ProductPage = () => {
  const Controller = useProductController();
  const action = Controller?.action;
  const result = Controller?.result;
  const { selectedProductId, products, navigateTo, setCartOpen } = useStore();
  const notify = useNotification();
  const product = products.find(p => p.id === selectedProductId);
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<'desc' | 'reviews'>('desc');
  const [wishlist, setWishlist] = useState(false);
  const [added, setAdded] = useState(false);
  const [variationError, setVariationError] = useState(false);


  if (!product) return null;



  return (
    <div className="min-h-screen bg-surface-50 pb-16">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-surface-400 font-body">
          <button onClick={() => navigateTo('home')} className="hover:text-brand-500 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Início
          </button>
          <span>/</span>
          <button onClick={() => navigateTo('category', undefined, product.category)} className="hover:text-brand-500 transition-colors capitalize">
            {product.category}
          </button>
          <span>/</span>
          <span className="text-surface-600 truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative bg-white rounded-3xl overflow-hidden aspect-square shadow-soft">
              <img
                src={product.images[imgIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <div className="absolute top-4 left-4">
                  <span className={`${badgeColors[product.badge]} text-white text-xs font-display font-bold px-3 py-1 rounded-full`}>
                    {badgeLabels[product.badge]}
                  </span>
                </div>
              )}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => setWishlist(!wishlist)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-medium transition-all ${wishlist ? 'bg-rose-500 text-white' : 'bg-white text-surface-400 hover:text-rose-500'}`}
                >
                  <Heart className="w-4 h-4" fill={wishlist ? 'currentColor' : 'none'} />
                </button>
                <button className="w-10 h-10 rounded-2xl bg-white text-surface-400 hover:text-brand-500 flex items-center justify-center shadow-medium transition-all">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
              {product.images.length > 1 && (
                <>
                  <button onClick={() => setImgIndex(i => (i - 1 + product.images.length) % product.images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-medium flex items-center justify-center hover:bg-white transition-all">
                    <ChevronLeft className="w-4 h-4 text-surface-700" />
                  </button>
                  <button onClick={() => setImgIndex(i => (i + 1) % product.images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-medium flex items-center justify-center hover:bg-white transition-all">
                    <ChevronRight className="w-4 h-4 text-surface-700" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === imgIndex ? 'border-brand-500 shadow-brand' : 'border-surface-200'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-surface-400 font-body bg-surface-100 px-2 py-0.5 rounded-full capitalize">{product.category}</span>
                {product.freeShipping && (
                  <span className="text-xs text-green-600 font-body bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Frete Grátis
                  </span>
                )}
              </div>
              <h1 className="font-display font-bold text-surface-900 text-2xl md:text-3xl leading-tight">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-surface-200 fill-surface-200'}`} />
                  ))}
                </div>
                <span className="font-display font-bold text-surface-900 text-sm">{product.rating}</span>
                <span className="text-surface-400 font-body text-sm">({product.reviewCount.toLocaleString()} avaliações)</span>
                <span className="text-surface-400 font-body text-sm">· {product.sold.toLocaleString()} vendidos</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-surface-50 rounded-2xl p-4">
              {product.originalPrice && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-surface-400 font-body text-sm line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="bg-rose-500 text-white text-xs font-display font-bold px-2 py-0.5 rounded-full">-{result?.discount}%</span>
                </div>
              )}
              <p className="font-display font-bold text-surface-900 text-4xl">{formatPrice(product.price)}</p>
              {product.installments && (
                <p className="text-surface-500 font-body text-sm mt-1">
                  em até <strong>{product.installments}x</strong> de <strong>{formatPrice(product.price / product.installments)}</strong> sem juros
                </p>
              )}
              <div className="flex items-center gap-2 mt-3 p-3 bg-green-50 rounded-xl border border-green-100">
                <Zap className="w-4 h-4 text-green-600 shrink-0" />
                <div>
                  <span className="font-display font-bold text-green-700 text-base">{formatPrice(product.price * 0.95)}</span>
                  <span className="text-green-600 font-body text-sm"> no PIX · 5% de desconto</span>
                </div>
              </div>
            </div>

            {/* Variations */}
            {result?.variationTypes.map(type => {
              const options = product.variations.filter(v => v.name === type);
              return (
                <div key={type}>
                  <p className="font-display font-semibold text-surface-800 text-sm mb-2">
                    {type}: {selectedVariations[type] && <span className="text-brand-600 font-body font-normal">{selectedVariations[type]}</span>}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {options.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedVariations(prev => ({ ...prev, [type]: opt.value }))}
                        className={`px-3 py-1.5 rounded-xl text-sm font-body border-2 transition-all ${selectedVariations[type] === opt.value ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold' : 'border-surface-200 text-surface-600 hover:border-brand-300'} ${opt.stock === 0 ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                        disabled={opt.stock === 0}
                      >
                        {opt.value}
                        {opt.priceModifier && opt.priceModifier > 0 ? ` (+${formatPrice(opt.priceModifier)})` : ''}
                      </button>
                    ))}
                  </div>
                  {variationError && !selectedVariations[type] && (
                    <p className="mt-1 text-xs font-body text-rose-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                      Escolha uma opção
                    </p>
                  )}
                </div>
              );
            })}

            {/* Quantity */}
            <div>
              <p className="font-display font-semibold text-surface-800 text-sm mb-2">Quantidade</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border-2 border-surface-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2.5 hover:bg-surface-100 text-surface-600 transition-colors font-display text-lg font-medium">−</button>
                  <span className="px-4 py-2.5 font-display font-bold text-surface-900 min-w-[50px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-2.5 hover:bg-surface-100 text-surface-600 transition-colors font-display text-lg font-medium">+</button>
                </div>
                <span className="text-surface-400 font-body text-sm">{product.stock} disponíveis</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (action?.handleAddToCart(quantity, selectedVariations)) {
                    setAdded(true);
                    notify.success("Sucesso", "Produto adicionado ao carrinho.");

                    setTimeout(() => setAdded(false), 2000);
                  } else { setVariationError(true) }
                }}
                className={`flex-1 py-4 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 transition-all ${added ? 'bg-green-500 text-white shadow-green-200' : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand hover:shadow-brand-lg'}`}
              >
                {added ? <><Check className="w-5 h-5" /> Adicionado!</> : <><ShoppingCart className="w-5 h-5" /> Adicionar ao Carrinho</>}
              </button>
            </div>

            {/* Buy now */}
            <button
              onClick={() => { action?.handleAddToCart(quantity, selectedVariations); navigateTo('checkout'); }}
              className="w-full py-3.5 rounded-2xl border-2 border-surface-200 text-surface-700 font-display font-bold hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> Comprar Agora
            </button>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <Shield className="w-4 h-4 text-green-500" />, text: 'Compra\nSegura' },
                { icon: <Truck className="w-4 h-4 text-blue-500" />, text: 'Frete\nRápido' },
                { icon: <RefreshCw className="w-4 h-4 text-purple-500" />, text: 'Troca em\n30 dias' },
              ].map((g, i) => (
                <div key={i} className="flex flex-col items-center gap-1 p-3 bg-surface-50 rounded-xl text-center">
                  {g.icon}
                  <span className="text-xs text-surface-500 font-body whitespace-pre-line leading-tight">{g.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10">
          <div className="flex gap-1 bg-surface-100 rounded-2xl p-1 w-fit mb-6">
            {(['desc', 'reviews'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${tab === t ? 'bg-white text-surface-900 shadow-soft' : 'text-surface-400 hover:text-surface-600'}`}
              >
                {t === 'desc' ? 'Descrição' : `Avaliações (${product.reviewCount.toLocaleString()})`}
              </button>
            ))}
          </div>

          {tab === 'desc' && (
            <div className="bg-white rounded-3xl p-6 shadow-soft animate-fade-in">
              <p className="font-body text-surface-700 leading-relaxed text-base">{product.description}</p>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Categoria', value: product.category },
                  { label: 'Estoque', value: `${product.stock} unidades` },
                  { label: 'Avaliação', value: `${product.rating}/5.0` },
                  { label: 'Vendidos', value: product.sold.toLocaleString() },
                ].map(info => (
                  <div key={info.label} className="p-3 bg-surface-50 rounded-xl">
                    <p className="text-xs text-surface-400 font-body">{info.label}</p>
                    <p className="font-display font-semibold text-surface-800 text-sm mt-0.5 capitalize">{info.value}</p>
                  </div>
                ))}
              </div>
              {product.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-surface-100 text-surface-500 rounded-full text-xs font-body">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'reviews' && (
            <div className="bg-white rounded-3xl p-6 shadow-soft animate-fade-in space-y-4">
              {/* Rating summary */}
              <div className="flex items-center gap-6 p-4 bg-surface-50 rounded-2xl mb-6">
                <div className="text-center">
                  <p className="font-display font-bold text-5xl text-surface-900">{product.rating}</p>
                  <div className="flex justify-center mt-1">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-xs text-surface-400 font-body mt-1">{product.reviewCount.toLocaleString()} avaliações</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <span className="text-xs text-surface-500 font-body w-4">{s}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                      <div className="flex-1 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: s === 5 ? '75%' : s === 4 ? '16%' : s === 3 ? '6%' : s === 2 ? '2%' : '1%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {result?.fakeReviews.map((review, i) => (
                <div key={i} className="border-b border-surface-100 pb-4 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{review.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-display font-semibold text-surface-800 text-sm">{review.name}</p>
                        <p className="text-xs text-surface-400 font-body">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-200 fill-surface-200'}`} />)}
                    </div>
                  </div>
                  <p className="text-sm text-surface-600 font-body leading-relaxed">{review.text}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs text-green-600 font-body">Compra verificada</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related */}
        {result?.related && result.related.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display font-bold text-surface-900 text-xl mb-4">Você também pode gostar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {result?.related.map(p => <ProductCard key={p.id} product={p} compact />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default ProductPage;