import {
    Mail, Phone, MapPin, Edit3, Check, ArrowLeft, ShoppingBag,
    Heart, Star, Bell, Shield, CreditCard, Truck, Package, Globe,
    Camera, Lock, LogOut, ChevronRight, ToggleLeft, ToggleRight,
    Settings, BarChart2, Crown
} from 'lucide-react';
import { User } from "../models/User";
import { useState } from 'react';
import { UseUserStore } from '../store/UseUserStore';

const BANNER_URL =
    "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80&fit=crop";

interface ProfileCardProps {
    user: User | null;
    userOrders: any[];
    wishlist: any[];
    totalSpent: number;
}

export default function ProfileCard({ user, userOrders = [], wishlist = [], totalSpent = 0 }: ProfileCardProps) {
    const [showPhoto, setShowPhoto] = useState(false);
    const { NameColorGlobal, ColorGlobalTema, ColorGlobalText } = UseUserStore();
    const name = user?.name;
    const avatarUrl = user?.avatar;
    const formattedTotal =
        totalSpent >= 1000
            ? `R$${(totalSpent / 1000).toFixed(0)}k`
            : `R$${totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

    return (
        <div className="bg-white rounded-3xl border border-surface-100 overflow-hidden shadow-soft">
            {/* Cover banner */}
            <div className="h-24 relative overflow-hidden">
                <img src={BANNER_URL} alt="banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />

            </div>

            {/* Body */}
            <div className="px-4 pb-5">
                {/* Avatar row */}
                <div className="flex items-end justify-between -mt-9 mb-3.5">
                    <div className="relative">
                        <div
                            className="relative w-[68px] h-[68px] rounded-[18px] border-[3px] border-white overflow-hidden shadow-medium bg-surface-50 cursor-pointer group"
                            onClick={() => setShowPhoto(true)}
                        >
                            <img
                                src={`/Imagens/Usuarios/${avatarUrl}`}
                                alt={name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                        {showPhoto && (
                            <div
                                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                                onClick={() => setShowPhoto(false)}
                            >
                                <img
                                    src={`/Imagens/Usuarios/${avatarUrl}`}
                                    alt={name}
                                    className="max-w-full max-h-[90vh] object-contain rounded-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        )}
                        <button
                            className={`absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] ${ColorGlobalTema} rounded-[8px] border-2 border-white flex items-center justify-center`}
                            aria-label="Alterar foto"
                        >
                            <Camera className="w-[11px] h-[11px] text-white" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <button className="w-[34px] h-[34px] rounded-[10px] bg-surface-50 border border-surface-100 flex items-center justify-center" aria-label="Notificações">
                            <Bell className="w-4 h-4 text-surface-400" />
                        </button>
                        <button className="w-[34px] h-[34px] rounded-[10px] bg-surface-50 border border-surface-100 flex items-center justify-center" aria-label="Configurações">
                            <Settings className="w-4 h-4 text-surface-400" />
                        </button>
                    </div>
                </div>

                {/* Name + verified */}
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[18px] font-display font-bold text-surface-900 leading-none">{name}</span>
                    <div className="w-[18px] h-[18px] rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                </div>

                {/* Role + since */}


                <div className="h-px bg-surface-100 mb-3.5" />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3.5">
                    {[
                        { icon: <ShoppingBag className="w-[15px] h-[15px]" />, val: userOrders.length || 10, lbl: "Pedidos", bg: "bg-amber-50", ic: "text-amber-800" },
                        { icon: <Heart className="w-[15px] h-[15px]" />, val: wishlist.length || 0, lbl: "Favoritos", bg: "bg-red-50", ic: "text-red-700" },
                        { icon: <BarChart2 className="w-[15px] h-[15px]" />, val: formattedTotal, lbl: "Total gasto", bg: "bg-green-50", ic: "text-green-800" },
                    ].map((s, i) => (
                        <div key={i} className="bg-surface-50 border border-surface-100 rounded-[14px] p-3 text-center">
                            <div className={`w-7 h-7 rounded-[8px] ${s.bg} ${s.ic} flex items-center justify-center mx-auto mb-1.5`}>
                                {s.icon}
                            </div>
                            <p className="text-[13px] font-display font-bold text-surface-800 leading-none">{s.val}</p>
                            <p className="text-[10px] text-surface-400 mt-0.5">{s.lbl}</p>
                        </div>
                    ))}
                </div>




                {/* Level bar */}
                <div className="flex items-center gap-3 mt-3.5 pt-3.5 border-t border-surface-100">
                    <div className="flex-1">
                        <div className="flex justify-between mb-1.5">
                            <span className="text-[11px] text-surface-400">Nível Gold</span>
                            <span className={`text-[11px] ${ColorGlobalText} font-semibold`}>62% → Diamond</span>
                        </div>
                        <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                            <div className={`h-full w-[62%] ${ColorGlobalTema} rounded-full`} />
                        </div>
                    </div>
                    <div className={`${ColorGlobalTema} text-white text-[11px] font-semibold px-3 py-1.5 rounded-[10px] flex items-center gap-1.5 flex-shrink-0`}>
                        <Star className="w-3 h-3" />
                        Gold
                    </div>

                </div>
                <div className="flex items-center gap-2 mt-4 ">
                    <span className="text-[11px] text-surface-400">
                        membro desde {user?.insert_Date
                            ? new Date(user.insert_Date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            })
                            : '-'}
                    </span>
                </div>
            </div>
        </div>
    );
}