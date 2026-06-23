import { useState, useEffect } from 'react';
import { Zap, ArrowLeft, Clock, Filter } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { UseProductStore } from '../store/UseProductStore';
import { UseUserStore } from '../store/UseUserStore';
import { getColorConfig } from '../types/Colors';

const TARGET = new Date(Date.now() + 4 * 60 * 60 * 1000 + 23 * 60 * 1000 + 45 * 1000);

export default function FlashSalePage() {
  const { products } = UseProductStore();
  const { ColorGlobalTema, ColorGlobalHover, ColorGlobalText, ColorGlobalHoverText, NameColorGlobal } = UseUserStore();
  const [filter, setFilter] = useState('all');
  const [timeLeft, setTimeLeft] = useState({ h: '04', m: '23', s: '45' });
  const navigate = useNavigate();
  const colorConfig = getColorConfig(NameColorGlobal);

  useEffect(() => {
    const tick = () => {
      const diff = TARGET.getTime() - Date.now();
      if (diff <= 0) return;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  console.log(`${ColorGlobalTema}/30`)
  const saleProducts = products.filter(p => p.origin_Price && p.origin_Price > p.price_Unic);

  const filtered = filter === 'all' ? saleProducts : saleProducts.filter(p => p.category === filter);
  const cats = ['all', ...Array.from(new Set(saleProducts.map(p => p.category)))];
  const catLabels: Record<string, string> = { all: 'Todos', eletronicos: 'Eletrônicos', garrafas: 'Stanley', acessorios: 'Acessórios', virais: 'Virais' };
  console.log(`"hover:"${ColorGlobalText}`)
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#09090b] via-[#1a0a00] to-[#09090b] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 30% 50%, ${colorConfig.hex}, transparent 60%), radial-gradient(circle at 70% 50%, ${colorConfig.hex}, transparent 60%)` }} />
        <div className="max-w-7xl mx-auto px-4 py-10 relative">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-body transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Zap className={`w-8 h-8 ${ColorGlobalText} `} />
                <span className={`${ColorGlobalTema}/30 ${ColorGlobalText} text-xs font-bold px-3 py-1 rounded-full border border${ColorGlobalTema.slice(2)}`}>OFERTA RELÂMPAGO</span>
              </div>
              <h1 className="font-display font-bold text-white text-4xl md:text-5xl tracking-tight mb-2">
                Descontos de até 50%
              </h1>
              <p className="text-white/50 font-body text-base">{saleProducts.length} produtos com preços imperdíveis</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 text-white/50 text-xs font-body">
                <Clock className="w-3.5 h-3.5" /> Termina em:
              </div>
              <div className="flex items-center gap-2">
                {[timeLeft.h, timeLeft.m, timeLeft.s].map((v, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <span
                      className={`${ColorGlobalTema} text-white font-display font-bold text-xl px-3.5 py-2.5 rounded-xl min-w-[52px] text-center`}
                      style={{
                        boxShadow: `0 4px 20px ${colorConfig.hex}`
                      }}
                    >
                      {v}
                    </span>
                    {i < 2 && <span className={`${ColorGlobalText} font-bold text-xl`}>:</span>}
                  </span>
                ))}
              </div>
              <div className="flex gap-3 text-white/30 text-[10px]">
                <span className="mr-9">HORAS</span><span className="mr-8">MIN</span><span className="ml-4">SEG</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 text-surface-500">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-body">Filtrar:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {cats.map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all ${filter === c
                  ? `${ColorGlobalTema} text-white shadow-brand`
                  : `bg-white text-surface-500 border border-surface-200 hover:border-${ColorGlobalTema.slice(3)} hover:${ColorGlobalText}`
                  }`}
              >
                {catLabels[c] || c}
              </button>
            ))}
          </div>
          <span className="ml-auto text-surface-400 text-sm">{filtered.length} produtos</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(p => <ProductCard key={p.id} product={p} compact />)}
        </div>
      </div>
    </div>
  );
}
