import { useState } from 'react';
import { ArrowLeft, Star, Package, TrendingUp } from 'lucide-react';
import { useStore } from '../context/store';
import ProductCard from '../components/ProductCard';

const BRANDS = [
  { name: 'Apple', emoji: '🍎', desc: 'Inovação e design premium', tags: ['iphone','macbook','airpods','apple watch'], color: 'from-gray-700 to-gray-900', count: 0 },
  { name: 'Samsung', emoji: '📱', desc: 'Galaxy e muito mais', tags: ['samsung','galaxy'], color: 'from-blue-700 to-blue-900', count: 0 },
  { name: 'Stanley', emoji: '🧊', desc: 'Garrafas que viraram mania', tags: ['stanley','quencher'], color: 'from-green-700 to-emerald-900', count: 0 },
  { name: 'JBL', emoji: '🎧', desc: 'Pure Bass, pura qualidade', tags: ['jbl'], color: 'from-orange-700 to-orange-900', count: 0 },
  { name: 'Todos', emoji: '✨', desc: 'Ver tudo disponível', tags: [], color: 'from-brand-600 to-brand-800', count: 0 },
];

export default function BrandsPage() {
  const { products, navigateTo } = useStore();
  const [selected, setSelected] = useState<string | null>(null);

  const getBrandProducts = (brand: typeof BRANDS[0]) => {
    if (brand.name === 'Todos') return products;
    return products.filter(p => brand.tags.some(t => p.tags.includes(t) || p.name.toLowerCase().includes(t)));
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="bg-white border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center gap-3">
          <button onClick={() => navigateTo('home')} className="p-2 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display font-bold text-surface-900 text-xl">Marcas Premium</h1>
            <p className="text-surface-400 text-xs">As melhores marcas em um só lugar</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Brand cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {BRANDS.map(brand => {
            const bp = getBrandProducts(brand);
            return (
              <button
                key={brand.name}
                onClick={() => navigateTo('search')}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${brand.color} p-5 text-left group hover:scale-105 hover:-translate-y-0.5 transition-all`}
              >
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
                <span className="text-3xl block mb-3">{brand.emoji}</span>
                <h3 className="font-display font-bold text-white text-sm">{brand.name}</h3>
                <p className="text-white/60 text-[10px] mt-1 font-body">{bp.length} produtos</p>
              </button>
            );
          })}
        </div>

        {/* All products by brand section */}
        {BRANDS.filter(b => b.name !== 'Todos').map(brand => {
          const bp = getBrandProducts(brand).slice(0, 5);
          if (bp.length === 0) return null;
          return (
            <section key={brand.name}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{brand.emoji}</span>
                  <div>
                    <h2 className="font-display font-bold text-surface-900 text-lg">{brand.name}</h2>
                    <p className="text-surface-400 text-xs">{brand.desc}</p>
                  </div>
                </div>
                <button onClick={() => navigateTo('search')} className="text-brand-500 text-sm font-semibold hover:text-brand-600 transition-colors">Ver todos →</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {bp.map(p => <ProductCard key={p.id} product={p} compact />)}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
