import { useState } from 'react';
import { ShoppingCart, Search, User, Menu, X, ChevronDown, Package, LayoutDashboard, Truck, LogOut, Heart, Moon, Sun } from 'lucide-react';
import { useStore } from '../context/store';
import { categoryLabels, categoryIcons } from '../utils';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { Filter } from 'lucide-react';
export default function Header() {
  const navigate = useNavigate();
  const { user, logout, navigateTo, navigatePages, cartCount, setCartOpen, searchQuery, setSearchQuery, Pages, currentPage, selectedCategory, wishlist, darkMode, toggleDarkMode } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const count = cartCount();
  const wishCount = wishlist.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate('/search/search');
  };

  return (
    <header className="sticky top-0 z-50 shadow-strong" style={{ background: 'var(--header-bg)' }}>
      <div className="bg-brand-600 text-white text-xs py-1.5 text-center font-body tracking-wide">
        🚚 Frete grátis acima de R$ 299 · Código <strong>BEMVINDO20</strong> = 20% OFF ·{' '}
        <button onClick={() => navigate('/flash-sale')} className="underline underline-offset-2 hover:text-brand-200 transition-colors">
          ⚡ Ofertas Relâmpago
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-brand">
            <span className="text-white font-display font-bold text-sm">MC</span>
          </div>
          <div className=" sm:block">
            <span className="font-display font-bold text-white text-lg leading-none block group-hover:text-brand-400 transition-colors">Mercado</span>
            <span className="font-display font-bold text-brand-400 text-lg leading-none block">Craibas</span>
          </div>
        </button>

        <form
          onSubmit={handleSearch}
          className="order-3 w-full md:order-none md:flex-1 md:max-w-2xl md:mx-auto"
        >
          <div className="flex items-center bg-white rounded-xl overflow-hidden ring-1 ring-surface-700 focus-within:ring-2 focus-within:ring-brand-400 focus-within:shadow-brand transition-all">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar produtos, marcas..."
              className="flex-1 px-4 py-2.5 text-sm font-body text-surface-800 bg-transparent outline-none placeholder:text-surface-400"
            />

            <button
              type="submit"
              className="p-[14px] bg-brand-500 hover:bg-brand-600 text-white transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="ml-auto flex gap-1 shrink-0">
          {/* Dark mode toggle */}
          {/* <button onClick={toggleDarkMode} className="p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-all" title={darkMode ? 'Modo Claro' : 'Modo Escuro'}>
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button> */}
          {/* Wishlist */}
          {/* <button onClick={() => navigate('/wishlist')} className="relative p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-all">
            <Heart className="w-5 h-5" />
            {wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{wishCount}</span>}
          </button> */}
          {/* Cart */}
          <button onClick={() => setCartOpen(true)} className="relative p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-all">
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse-soft">{count > 9 ? '9+' : count}</span>}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2.5 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-all">
            {menuOpen ? <X className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
          </button>
          {/* User */}
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-surface-300 hover:text-white hover:bg-surface-800 transition-all">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center"><span className="text-white text-xs font-bold">{user.name[0]}</span></div>
                <span className="hidden md:block text-sm font-body max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 hidden md:block" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-strong border border-surface-100 overflow-hidden animate-scale-in z-50">
                  <div className="p-3 border-b border-surface-100 bg-surface-50">
                    <p className="font-display font-semibold text-surface-900 text-sm">{user.name}</p>
                    <p className="text-xs text-surface-500 font-body">{user.email}</p>
                  </div>
                  <div className="p-1">
                    {user.role === 'CLIENTE' && <>
                      <MenuItem icon={<User className="w-4 h-4" />} label="Meu Perfil" onClick={() => { navigate('/profile'); setUserMenuOpen(false); }} />
                      <MenuItem icon={<Package className="w-4 h-4" />} label="Meus Pedidos" onClick={() => { navigate('/orders'); setUserMenuOpen(false); }} />
                      <MenuItem icon={<Heart className="w-4 h-4" />} label="Favoritos" onClick={() => { navigate('/wishlist'); setUserMenuOpen(false); }} />
                    </>}
                    {user.role === 'ADMIN' && <MenuItem icon={<LayoutDashboard className="w-4 h-4" />} label="Painel Admin" onClick={() => { navigate('/admin'); setUserMenuOpen(false); }} />}
                    {user.role === 'DELIVERY' && <MenuItem icon={<Truck className="w-4 h-4" />} label="Minhas Entregas" onClick={() => { navigate('/delivery-dashboard'); setUserMenuOpen(false); }} />}
                    <div className="border-t border-surface-100 mt-1 pt-1">
                      <MenuItem icon={<LogOut className="w-4 h-4" />} label="Sair" onClick={() => { logout(); setUserMenuOpen(false); }} danger />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-display font-semibold transition-all shadow-brand">
              <User className="w-4 h-4" /><span className="hidden sm:block">Entrar</span>
            </button>
          )}

        </div>
      </div>

      <nav className="hidden md:block border-t border-surface-800">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 py-1.5">
          <NavBtn active={Pages === 'home'} onClick={() => { navigatePages('home', null, null); navigate(`/`) }} label="🏠 Início" />
          {Object.entries(categoryLabels).map(([key, label]) => (
            <NavBtn key={key} active={Pages === 'category' && selectedCategory === key} onClick={() => { navigatePages('category', null, key); navigate(`category/${key}`) }} label={`${categoryIcons[key]} ${label}`} />
          ))}
          <div className="mx-1 h-4 w-px bg-surface-700" />
          <NavBtn active={Pages === 'flash-sale'} onClick={() => { navigatePages('flash-sale', null, null); navigate('/flash-sale') }} label="⚡ Relâmpago" highlight />
          <NavBtn active={Pages === 'brands'} onClick={() => { navigatePages('brands', null, null); navigate('/brands') }} label="⭐ Marcas" />
          <NavBtn active={Pages === 'about'} onClick={() => { navigatePages('about', null, null); navigate('/about') }} label="ℹ️ Sobre" />
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden border-t border-surface-800 p-4 animate-slide-up" style={{ background: 'var(--header-bg)' }}>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button key={key} onClick={() => { navigatePages('category', null, key); navigate(`category/${key}`); setMenuOpen(false); }} className="flex items-center gap-2 p-3 rounded-xl bg-surface-800 text-surface-300 hover:bg-surface-700 hover:text-white transition-all text-sm">
                <span>{categoryIcons[key]}</span><span>{label}</span>
              </button>
            ))}
            <button onClick={() => { navigate('/flash-sale'); setMenuOpen(false); }} className="flex items-center gap-2 p-3 rounded-xl bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-all text-sm">⚡ Relâmpago</button>
            <button onClick={() => { navigate('/about'); setMenuOpen(false); }} className="flex items-center gap-2 p-3 rounded-xl bg-surface-800 text-surface-300 hover:bg-surface-700 transition-all text-sm">ℹ️ Sobre Nós</button>
          </div>
        </div>
      )}
    </header>
  );
}

function NavBtn({ active, onClick, label, highlight }: { active: boolean; onClick: () => void; label: string; highlight?: boolean }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all whitespace-nowrap ${active ? 'bg-brand-500 text-white' : highlight ? 'text-brand-400 hover:text-white hover:bg-brand-500/20' : 'text-surface-400 hover:text-white hover:bg-surface-800'}`}>{label}</button>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-all ${danger ? 'text-red-500 hover:bg-red-50' : 'text-surface-700 hover:bg-surface-50 hover:text-surface-900'}`}>{icon}{label}</button>
  );
}
