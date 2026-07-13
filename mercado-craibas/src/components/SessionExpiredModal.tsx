import { AlertTriangle, Home, LogIn, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "../store/SessionStore";

interface Props {
    open: boolean;
}

export default function SessionExpiredModal({ open }: Props) {
    const navigate = useNavigate();
    const { close } = useSessionStore();

    if (!open) return null;

    const handleLogin = () => {
        localStorage.removeItem("@app:tokens");
        close();
        navigate("/login", { replace: true });
    };

    const handleHome = () => {
        localStorage.removeItem("@app:tokens");
        close();
        navigate("/", { replace: true });
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">

            <div className="
                relative
                w-full
                max-w-md
                sm:max-w-lg
                max-h-[90vh]
                overflow-y-auto
                rounded-3xl
                bg-white
                shadow-2xl
                animate-in
                fade-in
                zoom-in-95
                duration-300
            ">

                {/* Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -left-24 h-60 w-60 rounded-full bg-red-500/10 blur-3xl" />
                    <div className="absolute -bottom-24 -right-24 h-60 w-60 rounded-full bg-orange-500/10 blur-3xl" />
                </div>

                {/* Header */}
                <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-6 py-8 sm:px-8 sm:py-10">

                    <div className="relative mx-auto flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-white/15 border border-white/20 backdrop-blur">

                        <div className="absolute h-full w-full rounded-full border border-white/30 animate-ping" />

                        <AlertTriangle
                            className="text-white"
                            size={36}
                            strokeWidth={2.3}
                        />

                    </div>

                </div>

                {/* Conteúdo */}
                <div className="relative px-6 py-8 sm:px-8">

                    <div className="flex justify-center">
                        <div className="rounded-full bg-green-100 p-2">
                            <ShieldCheck className="text-green-600" size={20} />
                        </div>
                    </div>

                    <h2 className="mt-4 text-center text-2xl sm:text-3xl font-bold text-gray-900">
                        Sessão Expirada
                    </h2>

                    <p className="mt-4 text-center text-sm sm:text-base leading-7 text-gray-500">
                        Sua sessão expirou por motivos de segurança.
                        <br className="hidden sm:block" />
                        Faça login novamente para continuar utilizando sua conta.
                    </p>

                    <div className="mt-8 space-y-3">

                        <button
                            onClick={handleLogin}
                            className="
                                w-full
                                h-12
                                sm:h-14
                                rounded-2xl
                                bg-gradient-to-r
                                from-red-600
                                to-orange-500
                                text-white
                                font-semibold
                                flex
                                items-center
                                justify-center
                                gap-3
                                shadow-lg
                                hover:scale-[1.02]
                                active:scale-[0.98]
                                transition-all
                            "
                        >
                            <LogIn size={20} />
                            Fazer Login
                        </button>

                        <button
                            onClick={handleHome}
                            className="
                                w-full
                                h-12
                                sm:h-14
                                rounded-2xl
                                border
                                border-gray-200
                                bg-gray-50
                                text-gray-700
                                font-semibold
                                flex
                                items-center
                                justify-center
                                gap-3
                                hover:bg-gray-100
                                transition-all
                            "
                        >
                            <Home size={20} />
                            Continuar como Visitante
                        </button>

                    </div>

                    <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4">

                        <p className="text-center text-xs sm:text-sm leading-6 text-amber-700">
                            <strong>Dica:</strong> sua sessão foi encerrada automaticamente
                            para proteger sua conta. Faça login novamente para acessar
                            pedidos, endereços e finalizar compras.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}