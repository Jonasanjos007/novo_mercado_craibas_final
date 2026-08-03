import {
    ArrowRight,
    ShoppingBag,
    ShieldCheck,
    Truck,
    Sparkles,
    X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function CheckoutAutUser() {

    const navigate = useNavigate();

    return (
        <div className=" fixed inset-0 z-[9999] w-screen overflow-y-auto bg-gradient-to-tl from-[#f97316]/[100%] via-[#09090b] to-[#120d0a]/[100%] ">
            <div className="absolute  overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b  via-transparent to-orange-500/10" />
                <div className="  absolute  -top-40  -left  w-[320px]  h-[320  sm:w-[500px]  sm:h-[500  rounded-full  blur-[120  bg-brand-500/20" />
                <div className=" absolute -bottom-40 -right-40 w-[320px] h-[320px] sm:w-[500px] sm:h-[500px] rounded-full blur-[120px] bg-orange-500/20 " />
            </div>
            <button onClick={() => navigate(-1)} className="fixed top-4 right-4 z-[10000] w-11 h-11 rounded-2xl bg-white/5 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition">
                <X />
            </button>
            <div className=" relative min-h-[100dvh] max-w-7xl mx-auto px-5 sm:px-8 pt-20 pb-20 lg:pt-24 lg:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                <div className="order-2 lg:order-1">
                    <div className=" inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs sm:text-sm font-bold mb-6">
                        <Sparkles className="w-4 h-4" />
                        Checkout Seguro
                    </div>
                    <h1 className=" text-white font-bold text-4xl sm:text-5xl lg:text-7xl leading-tight mb-6">
                        Continue sua compra.
                    </h1>
                    <p className=" text-white/50 text-base sm:text-lg leading-relaxed max-w-xl mb-10">
                        Entre ou crie sua conta para finalizar pedidos,
                        acompanhar entregas e desbloquear ofertas.
                    </p>
                    <div className="space-y-5">
                        {[
                            {
                                icon: <Truck className="w-5 h-5" />,
                                title: "Entrega rápida"
                            },
                            {
                                icon: <ShieldCheck className="w-5 h-5" />,
                                title: "Pagamento protegido"
                            },
                            {
                                icon: <ShoppingBag className="w-5 h-5" />,
                                title: "Pedidos sincronizados"
                            }

                        ].map((item, i) => (
                            <div key={i} className=" flex items-center gap-4 text-white/70">
                                <div className=" w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    {item.icon}
                                </div>
                                <span className="font-medium">
                                    {item.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className=" order-1 lg:order-2 w-full max-w-[520px] mx-auto bg-black/[20%] backdrop-blur-xl border rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-2xl">
                    <p className=" uppercase tracking-[4px] text-brand-400 text-xs font-bold mb-4">
                        Checkout
                    </p>
                    <h2 className=" text-white font-bold text-2xl sm:text-3xl mb-3">
                        Acesse sua conta
                    </h2>
                    <p className="text-white/40 mb-8 text-sm sm:text-base ">
                        Escolha como deseja continuar
                    </p>
                    <div className="space-y-4">
                        <button onClick={() => navigate("/login")} className="w-full h-14 sm:h-16 rounded-2xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition">
                            Já tenho conta
                        </button>
                        <button onClick={() => navigate("/register/register")} className=" w-full h-14 sm:h-16 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-brand flex items-center justify-center gap-2 transition">
                            Criar Conta
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-center text-white/30 text-xs sm:text-sm mt-8">
                        Compra protegida • SSL Seguro
                    </p>
                </div>
            </div>
        </div>
    );

}