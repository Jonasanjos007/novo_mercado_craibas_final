import { TrendingDown, TrendingUp } from "lucide-react";
import { formatPrice } from "../utils";
import { useState } from "react";
interface MiniBarChartProps {
    data: number[];
    labels?: string[];
    percentages?: (number | undefined)[];
    differences?: (number | undefined)[];
    color?: string;
    darkMode?: boolean;
    ValueR$_Number?: boolean;
}
export function GraficoMes({
    data,
    labels = [],
    color = "#22c55e",
    percentages = [],
    differences = [],
    darkMode = false,
    ValueR$_Number = true
}: MiniBarChartProps) {
    const [selected, setSelected] = useState<number | null>(null);
    const width = 480;
    const baseHeight = 130;
    const expandedHeight = selected !== null ? 140 : 130;
    const chartHeight = 82;
    const bottomSpace = 26;
    const topSpace = 14;

    const max = Math.max(...data, 1);

    // gap menor quando há muitas barras, pra não espremer demais
    const gap = data.length > 6 ? 6 : 10;
    const barWidth = (width - gap * (data.length + 1)) / data.length;

    // fonte e visibilidade do valor se adaptam ao espaço disponível
    const valueFontSize = barWidth < 28 ? 9 : barWidth < 40 ? 10 : 11;
    const labelFontSize = barWidth < 28 ? 11 : barWidth < 40 ? 13 : 15;
    const showValue = barWidth >= 22;

    const gradientId = `gradient-${color.replace("#", "")}`;

    return (
        <svg
            width="100%"
            height={expandedHeight}
            viewBox={`0 0 ${width} ${expandedHeight}`}
            preserveAspectRatio="xMidYMid meet"
            className="max-w-full overflow-visible"
        >
            <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.15} />
                </linearGradient>
            </defs>

            {[0.25, 0.5, 0.75, 1].map((l) => (
                <line
                    key={l}
                    x1="0"
                    x2={width + 10}
                    y1={topSpace + chartHeight * l}
                    y2={topSpace + chartHeight * l}
                    stroke={darkMode ? "#2d3748" : "#ececec"}
                    strokeDasharray="4 4"
                />
            ))}

            {data.map((value, i) => {
                const h = Math.max(4, (value / max) * chartHeight);
                const x = gap + i * (barWidth + gap);
                const y = topSpace + (chartHeight - h);

                return (
                    <g key={i}>
                        {/* Valor (some se não couber) */}
                        {showValue && (
                            <text
                                x={x + barWidth / 2}
                                y={y - 4}
                                textAnchor="middle"
                                className="select-none mt-8"
                                style={{
                                    fontSize: valueFontSize,
                                    fontWeight: 600,
                                    fill: darkMode ? "#fff" : "#1f2937",
                                }}
                            >
                                {ValueR$_Number ? formatPrice(value) : value}
                            </text>
                        )}

                        {/* Barra */}
                        <rect
                            x={x}
                            y={y}
                            rx={Math.min(8, barWidth / 3)}
                            ry={Math.min(8, barWidth / 3)}
                            width={barWidth}
                            height={h}
                            fill={`url(#${gradientId})`}
                        >
                            <animate attributeName="height" from="0" to={h} dur="0.45s" fill="freeze" />
                            <animate attributeName="y" from={topSpace + chartHeight} to={y} dur="0.45s" fill="freeze" />
                        </rect>

                        {/* Nome do mês */}
                        <text
                            x={x + barWidth / 2}
                            y={expandedHeight - bottomSpace + 16}
                            textAnchor="middle"
                            style={{
                                fontSize: labelFontSize,
                                fontWeight: 700,
                                fill: darkMode ? "#d1d5db" : "#4b5563",
                            }}
                        >
                            {labels[i]}
                        </text>
                        <foreignObject x={x - 12} y={expandedHeight - 10} width={barWidth + 24} height={45} >
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() =>
                                        setSelected(selected === i ? null : i)
                                    }
                                    className={`flex items-center gap-1 text-[11px] font-semibold transition ${(percentages?.[i] ?? 0) >= 0
                                        ? "text-green-600"
                                        : "text-red-500"
                                        }`}
                                >
                                    {(percentages?.[i] ?? 0) >= 0 ? (
                                        <TrendingUp size={12} />
                                    ) : (
                                        <TrendingDown size={12} />
                                    )}

                                    {(percentages?.[i] ?? 0) >= 0 ? "+" : ""}
                                    {(percentages?.[i] ?? 0).toFixed(1)}%
                                </button>

                                {selected === i && (
                                    <div
                                        className={`mt-1 rounded-md px-2 py-1 text-[10px] shadow-md whitespace-nowrap
                                            ${darkMode
                                                ? "bg-slate-800 text-white"
                                                : "bg-white text-slate-700"
                                            }`}
                                    >
                                        {(differences?.[i] ?? 0) >= 0 ? "+" : ""}
                                        {ValueR$_Number ? formatPrice(differences?.[i] ?? 0) : differences?.[i] ?? 0}
                                    </div>
                                )}
                            </div>
                        </foreignObject>
                    </g>
                );
            })}
        </svg>
    );
}