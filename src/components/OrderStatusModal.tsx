import { useEffect, useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { orderStatusLabels, orderStatusColors } from "../utils";

interface OrderStatusModalProps {
  open: boolean;
  loading?: boolean;

  currentStatus: string;
  orderId: number;

  onCancel: () => void;
  onConfirm: (orderId: number, status: string) => void | Promise<void>;
}

export default function OrderStatusModal({
  open,
  loading = false,
  currentStatus,
  orderId,
  onCancel,
  onConfirm,
}: OrderStatusModalProps) {
  const [draft, setDraft] = useState(currentStatus);

  useEffect(() => {
    setDraft(currentStatus);
  }, [currentStatus]);

  if (!open) return null;

  const hasChanges = draft !== currentStatus;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">

      <div className="relative w-full max-w-xl overflow-hidden rounded-[30px] border border-white/10 bg-[#0b0b0d] shadow-2xl">

        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-brand-500/10 blur-3xl" />

        <div className="relative p-7">

          <div className="w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6">
            <Bell className="w-8 h-8 text-brand-400" />
          </div>

          <h2 className="text-2xl font-black text-white">
            Alterar Status do Pedido
          </h2>

          <p className="mt-3 text-sm leading-7 text-white/60">
            Escolha o novo status do pedido. O cliente será notificado automaticamente após a confirmação.
          </p>

          <div className="mt-7 space-y-3 max-h-[350px] overflow-y-auto">

            {Object.entries(orderStatusLabels).map(([key, label]) => {

              const selected = draft === key;

              return (
                <button
                  key={key}
                  onClick={() => setDraft(key)}
                  className={`w-full rounded-2xl border transition-all p-4 flex items-center justify-between ${selected
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                    }`}
                >

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${orderStatusColors[key]}`}
                  >
                    {label}
                  </span>

                  {selected && (
                    <Check className="w-5 h-5 text-brand-400" />
                  )}

                </button>
              );
            })}
          </div>

          {hasChanges && (
            <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 flex gap-3">

              <Bell className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />

              <p className="text-sm text-amber-200">
                O cliente receberá uma notificação informando que o status do pedido foi atualizado.
              </p>

            </div>
          )}

          <div className="flex gap-3 mt-8">

            <button
              disabled={loading}
              onClick={onCancel}
              className="flex-1 h-12 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold transition-all"
            >
              Cancelar
            </button>

            <button
              disabled={!hasChanges || loading}
              onClick={() => onConfirm(orderId, draft)}
              className="flex-1 h-12 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Confirmar
                </>
              )}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}