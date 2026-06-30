// components/CheckoutHeader.tsx
import { ChevronLeft, Lock, ChevronDown, User, Package, Heart, LayoutDashboard, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/store';
import { useState } from 'react';
import { UseUserStore } from '../store/UseUserStore';
import { getColorConfig } from '../types/Colors';

interface CheckoutHeaderProps {
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
    showSecure?: boolean;
}

export default function Headerpages({
    title = 'Checkout',
    showBack = true,
    onBack,
    showSecure = true,
}: CheckoutHeaderProps) {
    const { user, logout, ColorGlobalTema, NameColorGlobal, ColorGlobalHoverText } = UseUserStore();
    const navigate = useNavigate();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const colorConfig = getColorConfig(NameColorGlobal);

    const handleBack = () => {
        if (onBack) onBack();
        else navigate(-1);
    };

    return (
        <header
            className="sticky top-0 z-50 shadow-strong border-b border-surface-800"
            style={{ background: 'var(--header-bg)' }}
        >
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

                {/* Esquerda: voltar */}
                <div className="w-28 flex items-center">
                    {showBack && (
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1.5 text-surface-400 hover:text-white transition-colors group"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            <span className="text-sm font-body hidden sm:block">Voltar</span>
                        </button>
                    )}
                </div>

                {/* Centro: logo + título */}
                <button onClick={() => navigate('/')} className="flex items-center gap-2 group shrink-0">
                    <div className={`w-9 h-9 rounded-xl ${ColorGlobalTema} flex items-center justify-center `} style={{ boxShadow: `0 4px 12px  ${colorConfig.hex}` }}>
                        <span className="text-white font-display font-bold text-sm">MC</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className={`font-display font-bold text-white text-sm ${ColorGlobalHoverText} transition-colors leading-none`}>
                            Mercado Craibas
                        </span>
                        {title && (
                            <>
                                <span className="text-surface-600 text-sm font-body select-none">·</span>
                                <span className="text-surface-400 text-sm font-body">{title}</span>
                            </>
                        )}
                    </div>
                </button>

                {/* Direita: usuário ou compra segura */}
                <div className="w-28 flex justify-end">
                    {user ? (
                        <div className="relative">
                            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-surface-300 hover:text-white hover:bg-surface-800 transition-all">
                                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${ColorGlobalTema} flex items-center justify-center`}><span className="text-white text-xs font-bold">{user.name[0]}</span></div>
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
        </header>
    );
    function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
        return (
            <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-all ${danger ? 'text-red-500 hover:bg-red-50' : 'text-surface-700 hover:bg-surface-50 hover:text-surface-900'}`}>{icon}{label}</button>
        );
    }
}