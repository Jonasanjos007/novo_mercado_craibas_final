import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Zap, Shield, Truck, RefreshCw, Heart, Share2, Check, ArrowLeft, Play, X } from 'lucide-react';
import { useStore } from '../context/store';
import { formatPrice, formatDiscount, badgeLabels, badgeColors, orderStatusLabels } from '../utils';
import ProductCard from '../components/ProductCard';
import { useProductController } from '../controller/useProductController';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../utils/NotificationCard';
import Loading from '../components/Loading';
import { UseProductStore } from '../store/UseProductStore';
import { UseRouteStore } from '../store/UseRouteStore';
import { UseOrderStore } from '../store/UseOrderStore';

const isVideoFile = (fileName: string) => /\.(mp4|webm|ogg|mov|avi|mkv|m4v)$/i.test(fileName);

const getReviewMedia = (media?: string) =>
  (media ?? '').split(';').map(file => file.trim()).filter(Boolean);

type MediaViewerState = { items: string[]; index: number } | null;

const ReviewMediaCarousel = ({
  items,
  onOpen,
}: {
  items: string[];
  onOpen: (index: number) => void;
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: -1 | 1) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const firstItem = carousel.firstElementChild as HTMLElement | null;
    const gap = Number.parseFloat(window.getComputedStyle(carousel).columnGap || '0');
    const distance = (firstItem?.offsetWidth ?? carousel.clientWidth) + gap;
    carousel.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };

  return (
    <div className="relative mt-3 min-w-0 max-w-full group/media">
      <div
        ref={carouselRef}
        className="flex w-full snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-3"
        aria-label="Mídias da avaliação"
      >
        {items.map((fileName, mediaIndex) => {
          const mediaUrl = `/Imagens/Avaliacoes/${fileName}`;
          const isVideo = isVideoFile(fileName);

          return (
            <button
              type="button"
              key={`${fileName}-${mediaIndex}`}
              onClick={() => onOpen(mediaIndex)}
              className="relative h-28 w-28 shrink-0 snap-start [scroll-snap-stop:always] overflow-hidden rounded-xl border border-surface-200 bg-surface-100 text-left sm:h-32 sm:w-32 md:h-36 md:w-36 lg:h-40 lg:w-40"
              aria-label={`Abrir ${isVideo ? 'vídeo' : 'imagem'} ${mediaIndex + 1} de ${items.length}`}
            >
              {isVideo ? (
                <>
                  <video src={mediaUrl} preload="metadata" muted playsInline className="block h-full w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/15">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white shadow-lg">
                      <Play className="h-5 w-5 fill-current" />
                    </span>
                  </span>
                </>
              ) : (
                <img
                  src={mediaUrl}
                  alt={`Mídia da avaliação ${mediaIndex + 1}`}
                  loading="lazy"
                  className="block h-full w-full object-cover transition-transform duration-200 hover:scale-105"
                />
              )}
            </button>
          );
        })}
      </div>

      {items.length > 1 && (
        <>
          <button type="button" onClick={() => scroll(-1)} aria-label="Ver mídias anteriores" className="absolute left-1 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-surface-700 shadow-medium transition hover:bg-white sm:flex">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Ver próximas mídias" className="absolute right-1 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-surface-700 shadow-medium transition hover:bg-white sm:flex">
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="absolute bottom-3 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
            {items.length} mídias
          </span>
        </>
      )}
    </div>
  );
};

export const ProductPage = () => {
  const Controller = useProductController();
  const action = Controller?.action;
  const result = Controller?.result;
  const navigate = useNavigate();
  const { Category } = UseOrderStore();
  const { selectedProductId, navigatePages } = UseRouteStore();
  const { products } = UseProductStore();
  const product = products.find(p => p.id === Number(selectedProductId));
  console.log('product', product)
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [added, setAdded] = useState(false);
  const [reviewPage, setReviewPage] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<MediaViewerState>(null);
  const mediaTouchStartRef = useRef<number | null>(null);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setSelectedVariations({});
    setQuantity(1);
    setImgIndex(0);
  }, [product?.id]);

  useEffect(() => {
    if (!selectedMedia) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedMedia(null);
      if (event.key === 'ArrowLeft') {
        setSelectedMedia(current => current && ({ ...current, index: Math.max(0, current.index - 1) }));
      }
      if (event.key === 'ArrowRight') {
        setSelectedMedia(current => current && ({ ...current, index: Math.min(current.items.length - 1, current.index + 1) }));
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [!!selectedMedia]);
  if (!selectedProductId) {
    navigate('/');
    return null;
  }
  if (!product) return null;


  const reviewsPerPage = 3;

  const reviews = Controller?.result.RantingAllProduct ?? [];
  console.log('reviews', reviews)

  const totalReviewPages = Math.ceil(reviews.length / reviewsPerPage);

  const visibleReviews = reviews.slice(
    reviewPage * reviewsPerPage,
    reviewPage * reviewsPerPage + reviewsPerPage
  );


  return (
    <div className="min-h-screen bg-surface-50 pb-16">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-surface-400 font-body">
          <button onClick={() => navigate('/')} className="hover:text-brand-500 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Início
          </button>
          <span>/</span>
          <button
            onClick={() => {
              const categoryName =
                Category.find(c => c.id === product.id_category)?.category ?? "Sem categoria";

              navigatePages("category", null, categoryName);
              navigate(`/category/${categoryName}`);
            }}
            className="hover:text-brand-500 transition-colors capitalize"
          >
            {Category.find(c => c.id === product.id_category)?.category ?? "Sem categoria"}
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
                src={`/Imagens/Produtos/${product.imagens[imgIndex]?.url_Imagem}`}
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
              {product.imagens.length > 1 && (
                <>
                  <button onClick={() => setImgIndex(i => (i - 1 + product.imagens.length) % product.imagens.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-medium flex items-center justify-center hover:bg-white transition-all">
                    <ChevronLeft className="w-4 h-4 text-surface-700" />
                  </button>
                  <button onClick={() => setImgIndex(i => (i + 1) % product.imagens.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-medium flex items-center justify-center hover:bg-white transition-all">
                    <ChevronRight className="w-4 h-4 text-surface-700" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.imagens.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === imgIndex ? 'border-brand-500 shadow-brand' : 'border-surface-200'}`}
                >
                  <img src={`/Imagens/Produtos/${img.url_Imagem}`} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-surface-400 font-body bg-surface-100 px-2 py-0.5 rounded-full capitalize">{Category.find(c => c.id === product.id_category)?.category || "Sem categoria"}</span>
                {product.freeShipping && (
                  <span className="text-xs text-green-600 font-body bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Frete Grátis
                  </span>
                )}
              </div>
              <h1 className="font-display font-bold text-surface-900 text-2xl md:text-3xl leading-tight">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-3">
                <span className="font-display font-bold text-surface-900 text-sm">{product.rating.toLocaleString('en-US', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })} </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-surface-200 fill-surface-200'}`} />
                  ))}
                </div>

                <span className="text-surface-400 font-body text-sm">{product.review_Count
                } avaliações</span>
                <span className="text-surface-400 font-body text-sm">· {product.count_Sold.toLocaleString()} vendidos</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-surface-50 rounded-2xl p-4">
              {product.origin_Price && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-surface-400 font-body text-sm line-through">{formatPrice(product.origin_Price)}</span>
                  <span className="bg-rose-500 text-white text-xs font-display font-bold px-2 py-0.5 rounded-full">-{result?.discount}%</span>
                </div>
              )}
              <p className="font-display font-bold text-surface-900 text-4xl">{formatPrice(product.price_Unic)}</p>
              {product.installments && (
                <p className="text-surface-500 font-body text-sm mt-1">
                  em até <strong>{product.installments}x</strong> de <strong>{formatPrice(product.price_Unic / product.installments)}</strong> sem juros
                </p>
              )}
              <div className="flex items-center gap-2 mt-3 p-3 bg-green-50 rounded-xl border border-green-100">
                <Zap className="w-4 h-4 text-green-600 shrink-0" />
                <div>
                  <span className="font-display font-bold text-green-700 text-base">{formatPrice(product.price_Unic * 0.95)}</span>
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
                        className={`px-3 py-1.5 rounded-xl text-sm font-body border-2 transition-all ${selectedVariations[type] === opt.value ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold' : 'border-surface-200 text-surface-600 hover:border-brand-300'} ${opt.stoke === 0 ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                        disabled={opt.stoke === 0}
                      >
                        {opt.value}
                        {opt.price_Modifier && opt.price_Modifier > 0 ? ` (+${formatPrice(opt.price_Modifier)})` : ''}
                      </button>
                    ))}
                  </div>
                  {result.variationError && !selectedVariations[type] && (
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
                  <button onClick={() => setQuantity(q => Math.min(product.total_Stock, q + 1))} className="px-3 py-2.5 hover:bg-surface-100 text-surface-600 transition-colors font-display text-lg font-medium">+</button>
                </div>
                <span className="text-surface-400 font-body text-sm">{product.total_Stock} disponíveis</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (action?.handleAddToCart(quantity, selectedVariations)) {
                    setAdded(true);
                    setTimeout(() => setAdded(false), 2000);
                  }
                }}
                className={`flex-1 py-4 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 transition-all ${added ? 'bg-green-500 text-white shadow-green-200' : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand hover:shadow-brand-lg'}`}
              >
                {added ? <><Check className="w-5 h-5" /> Adicionado!</> : <><ShoppingCart className="w-5 h-5" /> Adicionar ao Carrinho</>}
              </button>
            </div>

            {/* Buy now */}
            <button
              onClick={() => {
                if (action?.handleFinishbuy(quantity, selectedVariations)) {
                }
              }}
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
                onClick={() => { Controller?.action.setTab(t); Controller?.action.SearchProductReviews(selectedProductId); }}
                className={`px-5 py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${Controller?.result.tab === t ? 'bg-white text-surface-900 shadow-soft' : 'text-surface-400 hover:text-surface-600'}`}
              >
                {t === 'desc' ? 'Descrição' : `Avaliações (${product.review_Count.toLocaleString()})`}
              </button>
            ))}
          </div>

          {Controller?.result.tab === 'desc' && (
            <div className="bg-white rounded-3xl p-6 shadow-soft animate-fade-in">
              <p className="font-body text-surface-700 leading-relaxed text-base">{product.description}</p>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Categoria', value: Category.find(c => c.id === product.id_category)?.category || "Sem categoria" },
                  { label: 'Estoque', value: `${product.total_Stock} unidades` },
                  { label: 'Avaliação', value: `${product.review_Count}/5.0` },
                  { label: 'Vendidos', value: product.count_Sold.toLocaleString() },
                ].map(info => (
                  <div key={info.label} className="p-3 bg-surface-50 rounded-xl">
                    <p className="text-xs text-surface-400 font-body">{info.label}</p>
                    <p className="font-display font-semibold text-surface-800 text-sm mt-0.5 capitalize">{info.value}</p>
                  </div>
                ))}
              </div>
              {product.tags && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tags.split(",").map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-surface-100 text-surface-500 rounded-full text-xs font-body"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {Controller?.result.tab === 'reviews' && Controller.result.RantingAllProduct.length > 0 ? (

            <div className="bg-white rounded-3xl p-6 shadow-soft animate-fade-in space-y-4">
              {/* Rating summary */}
              <div className="flex items-center gap-6 p-4 bg-surface-50 rounded-2xl mb-6">
                <div className="text-center">
                  <p className="font-display font-bold text-5xl text-surface-900">
                    {(product.rating ?? 0).toLocaleString('en-US', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                  </p>

                  <div className="flex justify-center mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-surface-200 fill-surface-200'}`} />
                    ))}
                  </div>

                  <p className="text-xs text-surface-400 font-body mt-1">
                    {product.review_Count} avaliações
                  </p>
                </div>

                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map(s => {
                    const reviews = Controller.result.RantingAllProduct;

                    const total = reviews.length;

                    const count = reviews.filter(review => review.ranting === s).length;

                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={s} className="flex items-center gap-2">
                        <span className="text-xs text-surface-500 font-body w-4">
                          {s}
                        </span>

                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />

                        <div className="flex-1 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{
                              width: `${percentage}%`
                            }}
                          />
                        </div>

                        <span className="text-xs text-surface-400 w-8 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}

                </div>
              </div>

              <div className="w-full min-w-0 overflow-hidden">

                <div className="space-y-4">
                  {visibleReviews.map((review, i) => (
                    <div
                      key={review.id ?? i}
                      className="w-full min-w-0 border-b border-surface-100 pb-4 last:border-0"
                    >
                      {/* Cabeçalho */}
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar */}
                          <div className=" w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                            {review.user?.avatar ? (
                              <img
                                src={`/Imagens/Usuarios/${review.user.avatar}`}
                                alt={review.user?.name ?? 'Usuário'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className=" text-white text-lg sm:text-xl font-bold uppercase">
                                {review.user?.name?.[0] ?? '?'}
                              </span>
                            )}
                          </div>

                          {/* Nome e data */}
                          <div className="min-w-0">
                            <p className=" font-display font-semibold text-surface-800 text-base sm:text-lg truncate">
                              {review.user?.name ?? 'Usuário'}
                            </p>

                            <p className=" text-sm sm:text-base text-surface-400 font-body mt-0.5">
                              {review.insertDate
                                ? new Date(review.insertDate).toLocaleDateString('pt-BR')
                                : '-'}
                            </p>
                          </div>
                        </div>

                        {/* Estrelas */}
                        <div className="flex shrink-0">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= review.ranting
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-surface-200 fill-surface-200'
                                }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Comentário */}
                      <p
                        className=" w-full max-w-full text-sm text-surface-600 font-body leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap"
                      >
                        {review.comment}
                      </p>

                      {/* Mídias */}
                      {getReviewMedia(review.media).length > 0 && (
                        <ReviewMediaCarousel
                          items={getReviewMedia(review.media)}
                          onOpen={index => setSelectedMedia({
                            items: getReviewMedia(review.media),
                            index,
                          })}
                        />
                      )}

                      {/* Compra verificada */}
                      <div className="mt-2 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-green-500" />

                        <span className="text-xs text-green-600 font-body">
                          Compra verificada
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedMedia && (
                  <div
                    onClick={() => setSelectedMedia(null)}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Visualizador de mídias da avaliação"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedMedia(null)}
                      className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 sm:right-6 sm:top-6"
                      aria-label="Fechar visualizador"
                    >
                      <X className="h-6 w-6" />
                    </button>

                    <div
                      onClick={event => event.stopPropagation()}
                      onTouchStart={event => {
                        mediaTouchStartRef.current = event.touches[0]?.clientX ?? null;
                      }}
                      onTouchEnd={event => {
                        const startX = mediaTouchStartRef.current;
                        const endX = event.changedTouches[0]?.clientX;
                        mediaTouchStartRef.current = null;
                        if (startX === null || endX === undefined || Math.abs(startX - endX) < 45) return;

                        const direction = startX > endX ? 1 : -1;
                        setSelectedMedia(current => current && ({
                          ...current,
                          index: Math.max(0, Math.min(current.items.length - 1, current.index + direction)),
                        }));
                      }}
                      className="h-full w-full overflow-hidden touch-pan-y"
                    >
                      <div
                        className="flex h-full w-full transition-transform duration-300 ease-out"
                        style={{ transform: `translateX(-${selectedMedia.index * 100}%)` }}
                      >
                        {selectedMedia.items.map((fileName, index) => {
                          const mediaUrl = `/Imagens/Avaliacoes/${fileName}`;
                          return (
                            <div key={`${fileName}-${index}`} className="flex h-full w-full shrink-0 items-center justify-center p-3 sm:p-8 md:p-12">
                              {isVideoFile(fileName) ? (
                                <video src={mediaUrl} controls playsInline className="max-h-full max-w-full rounded-xl bg-black object-contain shadow-2xl" />
                              ) : (
                                <img src={mediaUrl} alt={`Mídia ${index + 1} da avaliação`} className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {selectedMedia.items.length > 1 && (
                      <>
                        <button
                          type="button"
                          disabled={selectedMedia.index === 0}
                          onClick={event => {
                            event.stopPropagation();
                            setSelectedMedia(current => current && ({ ...current, index: Math.max(0, current.index - 1) }));
                          }}
                          className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 disabled:opacity-30 sm:left-6"
                          aria-label="Mídia anterior"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          type="button"
                          disabled={selectedMedia.index === selectedMedia.items.length - 1}
                          onClick={event => {
                            event.stopPropagation();
                            setSelectedMedia(current => current && ({ ...current, index: Math.min(current.items.length - 1, current.index + 1) }));
                          }}
                          className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 disabled:opacity-30 sm:right-6"
                          aria-label="Próxima mídia"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white sm:bottom-6">
                          {selectedMedia.index + 1} / {selectedMedia.items.length}
                        </div>
                      </>
                    )}
                  </div>
                )}
                {/* Carrossel / paginação */}
                {totalReviewPages > 1 && (
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={reviewPage === 0}
                      onClick={() =>
                        setReviewPage(prev => Math.max(prev - 1, 0))
                      }
                      className="
          w-9
          h-9
          rounded-full
          border
          border-surface-200
          flex
          items-center
          justify-center
          hover:bg-surface-50
          disabled:opacity-30
          disabled:cursor-not-allowed
          transition
        "
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalReviewPages }).map((_, page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setReviewPage(page)}
                          className={`h-2 rounded-full transition-all ${reviewPage === page
                            ? 'w-6 bg-brand-500'
                            : 'w-2 bg-surface-200 hover:bg-surface-300'
                            }`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={reviewPage === totalReviewPages - 1}
                      onClick={() =>
                        setReviewPage(prev =>
                          Math.min(prev + 1, totalReviewPages - 1)
                        )
                      }
                      className="
          w-9
          h-9
          rounded-full
          border
          border-surface-200
          flex
          items-center
          justify-center
          hover:bg-surface-50
          disabled:opacity-30
          disabled:cursor-not-allowed
          transition
        "
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

          ) : Controller?.result.tab === 'reviews' ? (

            <div className="bg-white rounded-3xl p-10 shadow-soft animate-fade-in text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 flex items-center justify-center">
                <Star className="w-8 h-8 text-surface-400" />
              </div>

              <h3 className="font-display font-semibold text-lg text-surface-800">
                Nenhuma avaliação ainda
              </h3>

              <p className="text-sm text-surface-400 font-body mt-2">
                Este produto ainda não possui avaliações.
                Seja o primeiro a avaliar!
              </p>
            </div>

          ) : null}

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
