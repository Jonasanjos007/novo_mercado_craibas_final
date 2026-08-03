import { X } from 'lucide-react';
import { CartItensProduct } from "../models/CartItensProduct";
import { formatPrice } from "../utils";

interface Props {
    open: boolean;
    onClose: () => void;
    products: CartItensProduct[];
    type?: string;
    discount?: number;
}

export default function CouponProductsModal({
    open,
    onClose,
    products,
    type,
    discount
}: Props) {
    if (!open) return null;

    const subtotal = products.reduce(
        (acc, item) =>
            acc + (item.product?.price_Unic || 0) * item.quantity,
        0
    );

    const total = subtotal - (discount || 0);

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-strong">

                <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-surface-100 px-5 py-4 flex justify-between items-center">
                    <h2 className="font-display text-base font-bold text-surface-900">
                        {type === "FixedValue"
                            ? "Resumo do desconto"
                            : "Produtos com desconto"}
                    </h2>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-surface-100 hover:bg-surface-200 flex items-center justify-center text-surface-500 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-5 space-y-2.5">

                    {products.map(item => (
                        <div
                            key={item.product?.id}
                            className="flex gap-3 p-3 bg-surface-50 rounded-2xl"
                        >
                            <img
                                src={`/Imagens/Produtos/${item.product?.imagens[0]?.url_Imagem}`}
                                className="w-14 h-14 rounded-xl object-cover shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                                <p className="font-body font-semibold text-sm text-surface-900 truncate">
                                    {item.product?.name}
                                </p>

                                {item.selectedVariation && (
                                    <p className="text-xs text-surface-400 font-body mt-0.5">
                                        {item.selectedVariation.value}
                                    </p>
                                )}

                                <p className="text-xs text-surface-500 font-body mt-0.5">
                                    {item.quantity}x {formatPrice(item.product?.price_Unic || 0)}
                                </p>
                            </div>

                            <div className="text-right shrink-0">
                                <p className="font-display font-bold text-sm text-surface-900">
                                    {formatPrice(
                                        (item.product?.price_Unic || 0) * item.quantity
                                    )}
                                </p>

                                {type !== "FixedValue" && (
                                    <span className="text-xs font-display font-bold text-green-600">
                                        -{formatPrice(item.product?.valorDicont || 0)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {type === "FixedValue" && (
                        <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-4 space-y-1.5 text-sm font-body">
                            <div className="flex justify-between text-surface-500">
                                <span>Subtotal</span>
                                <span className="font-semibold text-surface-800">{formatPrice(subtotal)}</span>
                            </div>

                            <div className="flex justify-between text-green-600">
                                <span>Desconto</span>
                                <span className="font-semibold">-{formatPrice(discount || 0)}</span>
                            </div>

                            <div className="border-t border-green-100 pt-2 mt-1 flex justify-between items-center">
                                <span className="font-display font-bold text-surface-900">Total</span>
                                <span className="font-display font-bold text-surface-900 text-lg">{formatPrice(total)}</span>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}