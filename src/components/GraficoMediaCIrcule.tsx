export function GraficoMediaCIrcule({
    segments,
    dark,
}: {
    segments: {
        value: number;
        color: string;
        label: string;
    }[];
    dark: boolean;
}) {
    const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
    const r = 46, cx = 58, cy = 58, strokeW = 14;
    const circumference = 2 * Math.PI * r;
    let offset = 0;
    console.log("teste2", dark)
    return (
        <svg viewBox="0 0 116 116" width={116} height={116}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeW} />
            {segments.map((seg, i) => {
                const dash = (seg.value / total) * circumference;
                const gap = circumference - dash;
                const el = (
                    <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={strokeW}
                        strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset} strokeLinecap="round"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
                );
                offset += dash; return el;
            })}
            <text x={cx} y={cy + 4} textAnchor="middle" fill={dark ? "#ffffff" : "#000000"} fontSize="13" fontWeight="bold">{total}</text>
            <text
                x={cx}
                y={cy + 15}
                textAnchor="middle"
                fill={dark ? "#ffffff" : "#000000"}
                fontSize="8"
            >
                pedidos
            </text>
        </svg >
    );
}