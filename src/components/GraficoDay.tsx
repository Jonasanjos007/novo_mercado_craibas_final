type ChartPoint = {
    day: string;
    value: number;
};
export function GraficoDay({
    data,
    color = '#f97316',
    darkMode,
    valor,
}: {
    data: ChartPoint[];
    color?: string;
    darkMode?: boolean;
    valor?: boolean;
    labels: string[];
}) {
    if (data.length < 2) return null;

    const width = 300;
    const height = 140;
    const horizontalPadding = 14;
    const topPadding = 22;
    const bottomPadding = 22;

    const chartHeight = height - topPadding - bottomPadding;
    const usableWidth = width - horizontalPadding * 2;

    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));

    const points = data.map((item, index) => {
        const x = horizontalPadding + (index / (data.length - 1)) * usableWidth;
        const y =
            topPadding +
            (chartHeight - ((item.value - min) / (max - min || 1)) * chartHeight);
        return { x, y };
    });

    // Curva suavizada (Catmull-Rom -> Bezier) em vez de linhas retas
    const smoothPath = (pts: { x: number; y: number }[]) => {
        if (pts.length < 2) return '';
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i - 1] ?? pts[i];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[i + 2] ?? p2;

            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
        return d;
    };

    const linePath = smoothPath(points);
    const fillPath = `${linePath} L ${points[points.length - 1].x} ${height - bottomPadding} L ${points[0].x} ${height - bottomPadding} Z`;

    const gradientId = `gradient-${color.replace('#', '')}`;
    const gridColor = darkMode ? '#2d3748' : '#ececec';
    const axisColor = darkMode ? '#3f4759' : '#e2e2e2';

    // Linhas de grade horizontais (25% / 50% / 75% / 100%)
    const gridLines = [0.25, 0.5, 0.75, 1];

    return (
        <div className="w-full overflow-hidden">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-[160px] sm:h-[180px] md:h-[200px] lg:h-[220px]"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                    </linearGradient>
                </defs>

                {/* GRADE HORIZONTAL */}
                {gridLines.map(l => (
                    <line
                        key={l}
                        x1={horizontalPadding}
                        x2={width - horizontalPadding}
                        y1={topPadding + chartHeight * l}
                        y2={topPadding + chartHeight * l}
                        stroke={gridColor}
                        strokeWidth="1"
                        strokeDasharray="3 4"
                    />
                ))}

                {/* LINHA DE BASE (eixo x) */}
                <line
                    x1={horizontalPadding}
                    x2={width - horizontalPadding}
                    y1={height - bottomPadding}
                    y2={height - bottomPadding}
                    stroke={axisColor}
                    strokeWidth="1"
                />

                {/* ÁREA */}
                <path d={fillPath} fill={`url(#${gradientId})`} />

                {/* LINHA SUAVIZADA */}
                <path
                    d={linePath}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* PONTOS */}
                {points.map((p, i) => {
                    const isLast = i === points.length - 1;

                    return (
                        <g key={i}>
                            {/* dia da semana */}
                            <text
                                x={p.x}
                                y={topPadding - 10}
                                textAnchor="middle"
                                fontSize="8"
                                fontWeight="600"
                                fill={darkMode ? '#9ca3af' : '#6b7280'}
                            >
                                {data[i].day}
                            </text>

                            {isLast && (
                                <circle cx={p.x} cy={p.y} r={6} fill={color} opacity={0.15} />
                            )}

                            <circle
                                cx={p.x}
                                cy={p.y}
                                r={isLast ? 3.2 : 2.4}
                                fill={darkMode ? '#111827' : 'white'}
                                stroke={color}
                                strokeWidth="1.6"
                            />
                            <circle cx={p.x} cy={p.y} r={isLast ? 1.4 : 1} fill={color} />

                            {/* valor */}
                            <text
                                x={p.x}
                                y={height - bottomPadding + 16}
                                textAnchor="middle"
                                fontSize="8"
                                fontWeight="600"
                                fill={darkMode ? '#e5e7eb' : '#111827'}
                            >
                                {valor
                                    ? data[i].value.toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                        maximumFractionDigits: 0,
                                    })
                                    : data[i].value}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}