import { CalendarDays, Camera, Heart, Mail, Package, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { User } from '../models/User';
import { UseUserStore } from '../store/UseUserStore';
import { UseProductStore } from '../store/UseProductStore';

interface ProfileCardProps {
    user: User | null;
    userOrders?: any[];
    wishlist?: any[];
}

export default function ProfileCard({ user, userOrders = [], wishlist = [] }: ProfileCardProps) {
    const { favorites } = UseProductStore();
    const [showPhoto, setShowPhoto] = useState(false);
    const { ColorGlobalTema, ColorGlobalText } = UseUserStore();
    const avatarUrl = user?.avatar ? `/Imagens/Usuarios/${user.avatar}` : '';
    const memberSince = user?.insert_Date
        ? new Date(user.insert_Date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        : 'Não informado';

    return (
        <aside className="relative w-full min-w-0 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-soft">
            <div className={`h-2 w-full ${ColorGlobalTema}`} />

            <div className="min-w-0 p-4">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={() => avatarUrl && setShowPhoto(true)}
                        className="group relative block shrink-0 overflow-hidden rounded-full border-2 border-white bg-surface-100 shadow-medium"
                        style={{ width: 64, height: 64, minWidth: 64, minHeight: 64, maxWidth: 64, maxHeight: 64 }}
                        aria-label="Visualizar foto do perfil"
                    >
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={user?.name || 'Foto do perfil'}
                                className="block"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                            />
                        ) : (
                            <span className={`flex h-full w-full items-center justify-center text-xl font-black uppercase ${ColorGlobalText}`}>
                                {user?.name?.charAt(0) || 'U'}
                            </span>
                        )}
                        {avatarUrl && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                                <Camera className="h-4 w-4 text-white opacity-0 group-hover:opacity-100" />
                            </span>
                        )}
                    </button>

                    <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex min-w-0 items-center gap-1.5">
                            <h2 className="min-w-0 truncate font-display text-base font-bold text-surface-900">
                                {user?.name || 'Cliente'}
                            </h2>
                            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                        </div>
                        <p className={`mt-1 truncate text-[9px] font-bold uppercase tracking-wider ${ColorGlobalText}`}>
                            Cliente Mercado Craíbas
                        </p>
                        <div className="mt-1.5 flex min-w-0 items-center gap-1 text-[11px] text-surface-400">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="min-w-0 truncate">{user?.email || 'E-mail não informado'}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid min-w-0 grid-cols-2 gap-2">
                    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-surface-50 p-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <Package className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                            <p className="font-display text-sm font-black leading-none text-surface-900">{userOrders.length}</p>
                            <p className="mt-1 truncate text-[8px] font-semibold uppercase text-surface-400">Pedidos</p>
                        </div>
                    </div>
                    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-surface-50 p-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-500">
                            <Heart className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                            <p className="font-display text-sm font-black leading-none text-surface-900">{wishlist.length}</p>
                            <p className="mt-1 truncate text-[8px] font-semibold uppercase text-surface-400">Favoritos</p>
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex min-w-0 items-center gap-1.5 border-t border-surface-100 pt-3 text-[9px] text-surface-400">
                    <CalendarDays className="h-3 w-3 shrink-0" />
                    <span className="truncate">Membro desde <strong className="font-semibold capitalize text-surface-600">{memberSince}</strong></span>
                </div>
            </div>

            {showPhoto && avatarUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setShowPhoto(false)}>
                    <button type="button" onClick={() => setShowPhoto(false)} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white" aria-label="Fechar foto">
                        <X className="h-5 w-5" />
                    </button>
                    <img src={avatarUrl} alt={user?.name || 'Foto do perfil'} className="max-h-[88vh] max-w-full rounded-2xl object-contain" onClick={event => event.stopPropagation()} />
                </div>
            )}
        </aside>
    );
}
