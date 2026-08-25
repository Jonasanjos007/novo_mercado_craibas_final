import { useEffect, useState } from 'react';
import { SlidersHorizontal, X, ArrowLeft, Search, ChevronLeft, ChevronRight, ShoppingBag, ArrowUp } from 'lucide-react';
import { useStore } from '../context/store';
import ProductCard from '../components/ProductCard';
import { useNavigate, useParams } from 'react-router-dom';
import { UseRouteStore } from '../store/UseRouteStore';
import { UseProductStore } from '../store/UseProductStore';
import { UseUserStore } from '../store/UseUserStore';
import AlertPopup from '../components/AlertPopup';
import Loading from '../components/Loading';
import { useCategoryController } from '../controller/useCategoryController';
import { UseOrderStore } from '../store/UseOrderStore';
import { getColorConfig } from '../types/Colors';

type SortOption = 'relevancia' | 'menor-preco' | 'maior-preco' | 'avaliacao' | 'mais-vendidos';

export default function CategoryPage() {
  const noScrollbar = '[&::-webkit-scrollbar]:hidden';
  const noScrollbarStyle: React.CSSProperties = { scrollbarWidth: 'none' };

  const Controller = useCategoryController();
  const { Category } = UseOrderStore();
  const { products } = UseProductStore();
  const { searchQuery, selectedCategory } = UseRouteStore();
  const { ColorGlobalTema, ColorGlobalText, ColorGlobalHoverText, NameColorGlobal } = UseUserStore();
  const colorConfig = getColorConfig(NameColorGlobal);
  const { id, search } = useParams<{ id?: string; search?: string }>();
  const routeCategory = id ? decodeURIComponent(id) : selectedCategory;
  const selectedCategoryData = Category.find(cat =>
    cat.category.toLowerCase() === routeCategory?.toLowerCase()
  );
  const [bannerIndex, setBannerIndex] = useState(0);
  const [sort, setSort] = useState<SortOption>('relevancia');
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1005000]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [freeShippingOnly, setFreeShippingOnly] = useState(false);
  const [badgeFilter, setBadgeFilter] = useState<string>('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const navigate = useNavigate();
  const isSearch = !id && search === 'search';
  const query = searchQuery.toLowerCase();
  let filtered = products.filter(p => {
    if (isSearch) {
      return (
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.split(",").some(t => t.trim().toLowerCase().includes(query)) ||
        (Category.find(c => c.id === p.id_category)?.category.toLowerCase().includes(query) ?? false)
      );
    }

    return selectedCategoryData
      ? p.id_category === selectedCategoryData?.id
      : true;
  });

  filtered = filtered.filter(p =>
    p.price_Unic >= priceRange[0] && p.price_Unic <= priceRange[1] &&
    p.review_Count >= ratingFilter &&
    (!freeShippingOnly || p.freeShipping) &&
    (!badgeFilter || p.badge === badgeFilter)
  );

  const categoryBanners = (Array.isArray(selectedCategoryData?.banners)
    ? selectedCategoryData.banners
    : typeof selectedCategoryData?.banners === 'string'
      ? selectedCategoryData.banners.split(';')
      : [])
    .map(banner => banner.trim())
    .filter(Boolean)
    .map(banner => banner.startsWith('/') || banner.startsWith('http') || banner.startsWith('data:')
      ? banner
      : `/Imagens/Categorias/${banner}`);

  useEffect(() => {
    setBannerIndex(0);
  }, [selectedCategoryData?.id]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 700);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    if (categoryBanners.length < 2) return;
    const timer = window.setInterval(() => {
      setBannerIndex(current => (current + 1) % categoryBanners.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [categoryBanners.length, selectedCategoryData?.id]);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'menor-preco') return a.price_Unic - b.price_Unic;
    if (sort === 'maior-preco') return b.price_Unic - a.price_Unic;
    if (sort === 'avaliacao') return b.review_Count - a.review_Count;
    if (sort === 'mais-vendidos') return b.count_Sold - a.count_Sold;
    return 0;
  });
  const clearFilters = () => {
    setPriceRange([0, 15000]);
    setRatingFilter(0);
    setFreeShippingOnly(false);
    setBadgeFilter('');
  };
  const pageTitle = isSearch
    ? `Resultados para "${searchQuery}"`
    : selectedCategoryData?.category
      ? selectedCategoryData.category.charAt(0).toUpperCase() +
      selectedCategoryData.category.slice(1)
      : 'Todos os Produtos';

  const openCategory = (category: string) => {
    UseRouteStore.getState().navigatePages('category', null, category);
    navigate(`/category/${category}`);
  };

  return (
    <div className="min-h-screen bg-surface-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => navigate('/')} className="text-surface-400 hover:text-surface-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display font-bold text-surface-900 text-xl">{pageTitle}</h1>
              <p className="text-surface-400 font-body text-xs">{sorted.length} {sorted.length === 1 ? 'produto encontrado' : 'produtos encontrados'}</p>
            </div>
          </div>

          {!isSearch && selectedCategoryData && (
            <>
              {/* Outras categorias */}
              <div className={`flex gap-4 overflow-x-auto pb-2 -mx-4  px-4 snap-x snap-mandatory md:grid md:grid-cols-8 md:gap-3 md:overflow-visible md:mx-0 md:px-0 ${noScrollbar}`} style={noScrollbarStyle}>
                {Category.filter(category => category.ativo === true && category.id != selectedCategoryData.id).map(category => {
                  // tenta usar a imagem real da categoria vinda do backend; se não existir, cai no emoji como fallback visual
                  const categoryImageUrl = category.imagem
                    ? category.imagem.startsWith('/') || category.imagem.startsWith('http') || category.imagem.startsWith('data:')
                      ? category.imagem
                      : `/Imagens/Categorias/${category.imagem}`
                    : '';

                  return (
                    <button
                      key={category.id}
                      onClick={() => { openCategory(category.category) }}
                      className="flex shrink-0 mt-2 snap-start flex-col items-center gap-2 w-[74px] md:w-full group"
                    >
                      <div
                        className="relative w-16 h-16 md:w-[72px] md:h-[72px] rounded-full overflow-hidden ring-2 ring-offset-2 ring-offset-[#f5f5f7] shadow-soft group-hover:scale-105 group-active:scale-95 transition-all duration-300"
                        style={{ ['--tw-ring-color' as string]: category.color || colorConfig.hex, background: category.color || colorConfig.hex }}
                      >
                        {categoryImageUrl ? (
                          <img src={categoryImageUrl} alt={category.category} className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-white"><ShoppingBag className="h-6 w-6" /></span>
                        )}
                      </div>
                      <span className="text-[11px] font-display font-bold text-surface-700 text-center leading-tight line-clamp-2 group-hover:text-brand-600 transition-colors">
                        {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                      </span>
                    </button>
                  );
                })}


              </div>

              {/* Banners da categoria */}
              {categoryBanners.length > 0 && (
                <div className="relative mb-5 aspect-[16/7] overflow-hidden rounded-2xl bg-surface-100 shadow-md sm:aspect-[16/5] sm:rounded-3xl">
                  {categoryBanners.map((banner, index) => (
                    <img
                      key={`${banner}-${index}`}
                      src={banner}
                      alt={`Banner de ${selectedCategoryData.category} ${index + 1}`}
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === bannerIndex ? 'opacity-100' : 'opacity-0'}`}
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                  {categoryBanners.length > 1 && (
                    <>
                      <button aria-label="Banner anterior" onClick={() => setBannerIndex(current => (current - 1 + categoryBanners.length) % categoryBanners.length)} className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 sm:h-10 sm:w-10">
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button aria-label="Próximo banner" onClick={() => setBannerIndex(current => (current + 1) % categoryBanners.length)} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 sm:h-10 sm:w-10">
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                        {categoryBanners.map((_, index) => (
                          <button key={index} aria-label={`Mostrar banner ${index + 1}`} onClick={() => setBannerIndex(index)} className={`h-1.5 rounded-full transition-all ${index === bannerIndex ? 'w-7 bg-white' : 'w-2 bg-white/50'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* Sort + Filter bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-body font-medium transition-all whitespace-nowrap ${filterOpen ? `border-${ColorGlobalTema.slice(3, -3)}400 ${ColorGlobalTema} text-white` : 'border-surface-200 text-surface-600 hover:border-surface-300'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
            </button>

            <div className="flex gap-2 overflow-x-auto">
              {(['relevancia', 'menor-preco', 'maior-preco', 'avaliacao', 'mais-vendidos'] as SortOption[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`px-3 py-2 rounded-xl border-2 text-xs font-body font-medium transition-all whitespace-nowrap ${sort === s ? ` ${ColorGlobalTema}  text-white` : 'border-surface-200 text-surface-500 hover:border-surface-300'}`}
                >
                  {s === 'relevancia' ? 'Relevância' : s === 'menor-preco' ? 'Menor Preço' : s === 'maior-preco' ? 'Maior Preço' : s === 'avaliacao' ? 'Avaliação' : 'Mais Vendidos'}
                </button>
              ))}
            </div>
          </div>

          {/* Active filters */}
          <div className="flex flex-wrap gap-2 mt-2">
            {freeShippingOnly && (
              <FilterChip label="Frete Grátis" onRemove={() => setFreeShippingOnly(false)} />
            )}
            {ratingFilter > 0 && (
              <FilterChip label={`${ratingFilter}+ estrelas`} onRemove={() => setRatingFilter(0)} />
            )}
            {badgeFilter && (
              <FilterChip label={badgeFilter} onRemove={() => setBadgeFilter('')} />
            )}
            {(priceRange[0] > 0 || priceRange[1] < 15000) && (
              <FilterChip label={`R$${priceRange[0]} - R$${priceRange[1]}`} onRemove={() => setPriceRange([0, 15000])} />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5 flex gap-5">
        {/* Filters sidebar */}
        {filterOpen && (
          <aside className="hidden md:block w-56 shrink-0 space-y-4 animate-slide-in-right">

            <div className="flex justify-between items-center px-1">
              <h2 className="font-display font-bold text-surface-800">
                Filtros
              </h2>

              <button
                onClick={clearFilters}
                className={`text-xs font-medium ${ColorGlobalText} ${ColorGlobalHoverText} transition-colors`}
              >
                Limpar
              </button>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-soft">
              <h3 className="font-display font-bold text-surface-800 text-sm mb-3">Preço</h3>
              <div className="space-y-2">
                {[[0, 100], [100, 500], [500, 2000], [2000, 15000]].map(([min, max]) => (
                  <label key={`${min}-${max}`} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={priceRange[0] === min && priceRange[1] === max}
                      onChange={() => setPriceRange([min, max])}
                      className="w-4 h-4 rounded accent-brand-500"
                    />
                    <span className="text-sm font-body text-surface-600 group-hover:text-surface-900 transition-colors">
                      {min === 0 ? `Até R$${max}` : max === 15000 ? `Acima de R$${min}` : `R$${min} - R$${max}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-soft">
              <h3 className="font-display font-bold text-surface-800 text-sm mb-3">Avaliação</h3>
              <div className="space-y-2">
                {[4, 3, 2, 1].map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="rating"
                      checked={ratingFilter === r}
                      onChange={() => setRatingFilter(r)}
                      className="w-4 h-4 accent-brand-500"
                    />
                    <span className="text-sm font-body text-surface-600 group-hover:text-surface-900 transition-colors">
                      {'★'.repeat(r)} ou mais
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-soft">
              <h3 className="font-display font-bold text-surface-800 text-sm mb-3">Filtros</h3>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" checked={freeShippingOnly} onChange={e => setFreeShippingOnly(e.target.checked)} className="w-4 h-4 rounded accent-brand-500" />
                <span className="text-sm font-body text-surface-600">Frete Grátis</span>
              </label>
              <h4 className="font-display font-semibold text-surface-700 text-xs mb-2 mt-3">Badge</h4>
              {['viral', 'oferta', 'mais-vendido', 'novo'].map(b => (
                <label key={b} className="flex items-center gap-2 cursor-pointer mb-1.5">
                  <input type="radio" name="badge" checked={badgeFilter === b} onChange={() => setBadgeFilter(b)} className="w-4 h-4 accent-brand-500" />
                  <span className="text-sm font-body text-surface-600 capitalize">{b}</span>
                </label>
              ))}
            </div>
          </aside>
        )}

        {/* Products grid */}
        <div className="flex-1">
          {sorted.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-surface-200 mx-auto mb-4" />
              <h2 className="font-display font-bold text-surface-700 text-xl mb-2">Nenhum produto encontrado</h2>
              <p className="text-surface-400 font-body text-sm mb-4">Tente outros filtros ou termos de busca</p>
              <button onClick={() => { setFreeShippingOnly(false); setRatingFilter(0); setBadgeFilter(''); setPriceRange([0, 15000]); }} className={`px-5 py-2.5 ${ColorGlobalTema} text-white font-display font-bold rounded-xl shadow-brand text-sm`}>
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {sorted.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Voltar ao topo"
            className={`fixed bottom-6 right-5 z-30 flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-strong transition-all hover:-translate-y-0.5 ${ColorGlobalTema}`}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
      <Loading
        loading={Controller?.result?.Loading || false}
        message={"Carregando..."}
        subMessage={"Melhores Produtos"}
      />
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className={`flex items-center gap-1 px-2.5 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-body font-medium`}>
      {label}
      <button onClick={onRemove} className="hover:text-brand-900 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
