import { Loader2 } from "lucide-react";

interface LoadingProps {
  loading: boolean;
  message?: string;
  subMessage?: string;
}

export default function Loading({
  loading,
  message = "Carregando...",
  subMessage = "Aguarde um momento"
}: LoadingProps) {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">

      {/* Card */}
      <div className="relative w-[340px] rounded-3xl bg-surface-900/80 border border-surface-700 shadow-2xl p-6 text-center overflow-hidden">

        {/* glow usando brand da loja */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-400/10 rounded-full blur-3xl animate-pulse" />

        {/* spinner */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Loader2 className="w-9 h-9 text-brand-400 animate-spin" />
            <span className="absolute inset-0 rounded-full border border-brand-500/20 animate-ping" />
          </div>
        </div>

        {/* texto */}
        <h2 className="text-white font-display font-bold text-lg mb-1">
          {message}
        </h2>

        <p className="text-surface-400 text-xs font-body mb-4">
          {subMessage}
        </p>

        {/* barra de loading */}
        <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-brand-500 to-amber-400 rounded-full animate-[loadingBar_1.2s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* animação da barra */}
      <style>
        {`
          @keyframes loadingBar {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
    </div>
  );
}