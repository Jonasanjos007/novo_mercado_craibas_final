import { useState } from 'react';
import { SlidersHorizontal, X, ChevronDown, ArrowLeft, Search } from 'lucide-react';
import { useStore } from '../context/store';
import ProductCard from '../components/ProductCard';
import { categoryLabels, categoryIcons } from '../utils';
import { useNavigate, useParams } from 'react-router-dom';

type SortOption = 'relevancia' | 'menor-preco' | 'maior-preco' | 'avaliacao' | 'mais-vendidos';

export default function CategoryPage() {
  const { products, selectedCategory, searchQuery, currentPage, navigateTo } = useStore();
  const { search } = useParams();

  const [sort, setSort] = useState<SortOption>('relevancia');
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [freeShippingOnly, setFreeShippingOnly] = useState(false);
  const [badgeFilter, setBadgeFilter] = useState<string>('');
  const navigate = useNavigate();

  const isSearch = search === 'search';
  const query = searchQuery.toLowerCase();
  let filtered = products.filter(p => {
    if (isSearch) return (
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.tags.some(t => t.toLowerCase().includes(query)) ||
      p.category.toLowerCase().includes(query)
    );
    return selectedCategory ? p.category === selectedCategory : true;
  });

  filtered = filtered.filter(p =>
    p.price >= priceRange[0] && p.price <= priceRange[1] &&
    p.rating >= ratingFilter &&
    (!freeShippingOnly || p.freeShipping) &&
    (!badgeFilter || p.badge === badgeFilter)
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'menor-preco') return a.price - b.price;
    if (sort === 'maior-preco') return b.price - a.price;
    if (sort === 'avaliacao') return b.rating - a.rating;
    if (sort === 'mais-vendidos') return b.sold - a.sold;
    return 0;
  });

  const pageTitle = isSearch
    ? `Resultados para "${searchQuery}"`
    : selectedCategory
      ? `${categoryIcons[selectedCategory]} ${categoryLabels[selectedCategory]}`
      : 'Todos os Produtos';

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

          {/* Sort + Filter bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-body font-medium transition-all whitespace-nowrap ${filterOpen ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-surface-200 text-surface-600 hover:border-surface-300'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
            </button>

            <div className="flex gap-2 overflow-x-auto">
              {(['relevancia', 'menor-preco', 'maior-preco', 'avaliacao', 'mais-vendidos'] as SortOption[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`px-3 py-2 rounded-xl border-2 text-xs font-body font-medium transition-all whitespace-nowrap ${sort === s ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-surface-200 text-surface-500 hover:border-surface-300'}`}
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
              <button onClick={() => { setFreeShippingOnly(false); setRatingFilter(0); setBadgeFilter(''); setPriceRange([0, 15000]); }} className="px-5 py-2.5 bg-brand-500 text-white font-display font-bold rounded-xl shadow-brand text-sm">
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {sorted.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-body font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-brand-900 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
