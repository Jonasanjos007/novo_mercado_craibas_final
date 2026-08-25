import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Star, ShoppingCart, Zap, Heart, Check } from 'lucide-react';
import { formatPrice, badgeLabels, badgeColors } from '../utils';
import { useStore } from '../context/store';
import { UseOrderAdminStore } from '../storeAdmin/UseOrderAdminStore';
import { ProductAdmin } from '../models/Product';

interface ProductQuickViewProps {
  product: ProductAdmin;
  onClose: () => void;
  onViewFull?: () => void;
}

export const ProductQuickView = ({ product, onClose, onViewFull }: ProductQuickViewProps) => {
  const { darkMode } = useStore();
  const { Category } = UseOrderAdminStore();

  const [imgIndex, setImgIndex] = useState(0);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variationTypes = Array.from(new Set((product?.variations || []).map((v: any) => v.name)));
  const discount = product?.origin_Price
    ? Math.round(((product.origin_Price - product.price_Unic) / product.origin_Price) * 100)
    : 0;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!product) return null;

  // ── tema ──
  const dk = darkMode;
  const card = dk ? 'bg-[#0d0d14] border-white/[0.06]' : 'bg-white border-surface-200';
  const txt = dk ? 'text-white' : 'text-surface-900';
  const txt2 = dk ? 'text-white/60' : 'text-surface-500';
  const sub = dk ? 'text-white/35' : 'text-surface-400';
  const surf = dk ? 'bg-white/[0.04]' : 'bg-surface-50';
  const chip = dk ? 'bg-white/[0.06] text-white/60' : 'bg-surface-100 text-surface-400';
  const btnGhost = dk ? 'bg-white/[0.06] text-white/70 hover:bg-white/[0.10]' : 'bg-white text-surface-400 shadow-medium';
  const inputBorder = dk ? 'border-white/[0.10] text-white/70 hover:border-brand-400/60' : 'border-surface-200 text-surface-600 hover:border-brand-300';
  const qtyBorder = dk ? 'border-white/[0.10]' : 'border-surface-200';
  const qtyBtn = dk ? 'hover:bg-white/[0.06] text-white/70' : 'hover:bg-surface-100 text-surface-600';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border ${card}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-2xl shadow-medium flex items-center justify-center transition-colors ${btnGhost}`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 md:p-6">
          {/* Imagem */}
          <div className="space-y-2">
            <div className={`relative rounded-2xl overflow-hidden aspect-square ${surf}`}>
              <img
                src={`/Imagens/Produtos/${product.imagens?.[imgIndex]?.url_Imagem}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <div className="absolute top-3 left-3">
                  <span className={`${badgeColors[product.badge]} text-white text-xs font-display font-bold px-3 py-1 rounded-full`}>
                    {badgeLabels[product.badge]}
                  </span>
                </div>
              )}
              {product.imagens?.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIndex(i => (i - 1 + product.imagens.length) % product.imagens.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-medium flex items-center justify-center hover:bg-white transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 text-surface-700" />
                  </button>
                  <button
                    onClick={() => setImgIndex(i => (i + 1) % product.imagens.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-medium flex items-center justify-center hover:bg-white transition-all"
                  >
                    <ChevronRight className="w-4 h-4 text-surface-700" />
                  </button>
                </>
              )}
            </div>
            {product.imagens?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.imagens.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === imgIndex ? 'border-brand-500' : dk ? 'border-white/10' : 'border-surface-200'}`}
                  >
                    <img src={`/Imagens/Produtos/${img.url_Imagem}`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              <span className={`text-xs font-body px-2 py-0.5 rounded-full capitalize ${chip}`}>
                {Category.find(c => c.id === product.id_category)?.category || "Sem categoria"}
              </span>
              <h2 className={`font-display font-bold text-xl md:text-2xl leading-tight mt-2 pr-8 ${txt}`}>
                {product.name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.floor(5) ? 'text-amber-400 fill-amber-400' : `${dk ? 'text-white/10 fill-white/10' : 'text-surface-200 fill-surface-200'}`}`} />
                  ))}
                </div>
                <span className={`font-display font-bold text-sm ${txt}`}>{product.rating ?? 4.5}</span>
                <span className={`font-body text-xs ${sub}`}>({100})</span>
              </div>
            </div>

            {/* Preço */}
            <div className={`rounded-2xl p-4 ${surf}`}>
              {product.origin_Price && (
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-body text-sm line-through ${sub}`}>{formatPrice(product.origin_Price)}</span>
                  <span className="bg-rose-500 text-white text-xs font-display font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
                </div>
              )}
              <p className={`font-display font-bold text-3xl ${txt}`}>{formatPrice(product.price_Unic)}</p>
              {product.installments && (
                <p className={`font-body text-xs mt-1 ${sub}`}>
                  em até <strong className={txt}>{product.installments}x</strong> de <strong className={txt}>{formatPrice(product.price_Unic / product.installments)}</strong> sem juros
                </p>
              )}
            </div>

            {/* Variações */}
            {variationTypes.map((type: any) => {
              const options = product.variations.filter((v: any) => v.name === type);
              return (
                <div key={type}>
                  <p className={`font-display font-semibold text-sm mb-2 ${txt}`}>
                    {type}: {selectedVariations[type] && <span className="text-brand-500 font-body font-normal">{selectedVariations[type]}</span>}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {options.map((opt: any) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedVariations(prev => ({ ...prev, [type]: opt.value }))}
                        disabled={opt.stock === 0}
                        className={`px-3 py-1.5 rounded-xl text-sm font-body border-2 transition-all ${selectedVariations[type] === opt.value
                          ? (dk ? 'border-brand-500 bg-brand-500/10 text-brand-400 font-semibold' : 'border-brand-500 bg-brand-50 text-brand-700 font-semibold')
                          : inputBorder
                          } ${opt.stock === 0 ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                      >
                        {opt.value}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Quantidade */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center border-2 rounded-xl overflow-hidden ${qtyBorder}`}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className={`px-3 py-2 font-display text-lg transition-colors ${qtyBtn}`}>−</button>
                <span className={`px-4 py-2 font-display font-bold min-w-[44px] text-center ${txt}`}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.total_Stock ?? 99, q + 1))} className={`px-3 py-2 font-display text-lg transition-colors ${qtyBtn}`}>+</button>
              </div>
              <span className={`font-body text-xs ${sub}`}>{product.total_Stock} disponíveis</span>
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAdded(true);
                  setTimeout(() => setAdded(false), 2000);
                }}
                className={`flex-1 py-3.5 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all ${added ? 'bg-green-500 text-white' : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand'}`}
              >
                {added ? <><Check className="w-4 h-4" /> Adicionado!</> : <><ShoppingCart className="w-4 h-4" /> Adicionar</>}
              </button>
              <button className={`w-11 h-11 shrink-0 rounded-2xl border-2 flex items-center justify-center transition-all ${dk ? 'border-white/[0.10] text-white/40 hover:text-rose-400 hover:border-rose-500/30' : 'border-surface-200 text-surface-400 hover:text-rose-500 hover:border-rose-200'}`}>
                <Heart className="w-4 h-4" />
              </button>
            </div>

            {onViewFull && (
              <button
                onClick={onViewFull}
                className={`w-full py-3 rounded-2xl border-2 font-display font-semibold text-sm transition-all flex items-center justify-center gap-2 ${dk ? 'border-white/[0.10] text-white/70 hover:border-brand-500/40 hover:text-brand-400 hover:bg-brand-500/10' : 'border-surface-200 text-surface-700 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50'}`}
              >
                <Zap className="w-4 h-4" /> Ver página completa
              </button>
            )}
          </div>
        </div>

        <div className="px-5 md:px-6 pb-6">
          <div className={`rounded-3xl p-6 ${surf}`}>
            <p className={`font-body leading-relaxed text-base ${txt2}`}>{product.description}</p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Categoria', value: Category.find(c => c.id === product.id_category)?.category || "Sem categoria" },
                { label: 'Estoque', value: `${product.total_Stock} unidades` },
                { label: 'Avaliação', value: `${product.review_Count}/5.0` },
                { label: 'Vendidos', value: product.count_Sold.toLocaleString() },
              ].map(info => (
                <div key={info.label} className={`p-3 rounded-xl ${dk ? 'bg-white/[0.04]' : 'bg-white'}`}>
                  <p className={`text-xs font-body ${sub}`}>{info.label}</p>
                  <p className={`font-display font-semibold text-sm mt-0.5 capitalize ${txt}`}>{info.value}</p>
                </div>
              ))}
            </div>
            {product.tags && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.tags.split(",").map(tag => (
                  <span
                    key={tag}
                    className={`px-3 py-1 rounded-full text-xs font-body ${chip}`}
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;
