export const colors = [
    { value: "brand", class: "bg-brand-500", class_text: "text-brand-400", class_hover: "hover:bg-brand-600", class_group_hover_text: "group-hover:text-brand-600", hex: "#3b82f6" },
    { value: "red", class: "bg-red-500", class_text: "text-red-500", class_hover: "hover:bg-red-600", class_group_hover_text: "group-hover:text-red-600", hex: "#ef4444" },
    { value: "orange", class: "bg-orange-500", class_text: "text-orange-500", class_hover: "hover:bg-orange-600", class_group_hover_text: "group-hover:text-orange-600", hex: "#f97316" },
    { value: "amber", class: "bg-amber-500", class_text: "text-amber-500", class_hover: "hover:bg-amber-600", class_group_hover_text: "group-hover:text-amber-600", hex: "#f59e0b" },
    { value: "yellow", class: "bg-yellow-500", class_text: "text-yellow-500", class_hover: "hover:bg-yellow-600", class_group_hover_text: "group-hover:text-yellow-600", hex: "#eab308" },
    { value: "lime", class: "bg-lime-500", class_text: "text-lime-500", class_hover: "hover:bg-lime-600", class_group_hover_text: "group-hover:text-lime-600", hex: "#84cc16" },
    { value: "green", class: "bg-green-500", class_text: "text-green-500", class_hover: "hover:bg-green-600", class_group_hover_text: "group-hover:text-green-600", hex: "#22c55e" },
    { value: "emerald", class: "bg-emerald-500", class_text: "text-emerald-500", class_hover: "hover:bg-emerald-600", class_group_hover_text: "group-hover:text-emerald-600", hex: "#10b981" },
    { value: "teal", class: "bg-teal-500", class_text: "text-teal-500", class_hover: "hover:bg-teal-600", class_group_hover_text: "group-hover:text-teal-600", hex: "#14b8a6" },
    { value: "cyan", class: "bg-cyan-500", class_text: "text-cyan-500", class_hover: "hover:bg-cyan-600", class_group_hover_text: "group-hover:text-cyan-600", hex: "#06b6d4" },
    { value: "sky", class: "bg-sky-500", class_text: "text-sky-500", class_hover: "hover:bg-sky-600", class_group_hover_text: "group-hover:text-sky-600", hex: "#0ea5e9" },
    { value: "blue", class: "bg-blue-500", class_text: "text-blue-500", class_hover: "hover:bg-blue-600", class_group_hover_text: "group-hover:text-blue-600", hex: "#3b82f6" },
    { value: "indigo", class: "bg-indigo-500", class_text: "text-indigo-500", class_hover: "hover:bg-indigo-600", class_group_hover_text: "group-hover:text-indigo-600", hex: "#6366f1" },
    { value: "violet", class: "bg-violet-500", class_text: "text-violet-500", class_hover: "hover:bg-violet-600", class_group_hover_text: "group-hover:text-violet-600", hex: "#8b5cf6" },
    { value: "purple", class: "bg-purple-500", class_text: "text-purple-500", class_hover: "hover:bg-purple-600", class_group_hover_text: "group-hover:text-purple-600", hex: "#a855f7" },
    { value: "fuchsia", class: "bg-fuchsia-500", class_text: "text-fuchsia-500", class_hover: "hover:bg-fuchsia-600", class_group_hover_text: "group-hover:text-fuchsia-600", hex: "#d946ef" },
    { value: "pink", class: "bg-pink-500", class_text: "text-pink-500", class_hover: "hover:bg-pink-600", class_group_hover_text: "group-hover:text-pink-600", hex: "#ec4899" },
    { value: "rose", class: "bg-rose-500", class_text: "text-rose-500", class_hover: "hover:bg-rose-600", class_group_hover_text: "group-hover:text-rose-600", hex: "#f43f5e" },
    { value: "brown", class: "bg-stone-500", class_text: "text-stone-500", class_hover: "hover:bg-stone-600", class_group_hover_text: "group-hover:text-stone-600", hex: "#78716c" },
    { value: "gray", class: "bg-gray-500", class_text: "text-gray-500", class_hover: "hover:bg-gray-600", class_group_hover_text: "group-hover:text-gray-600", hex: "#6b7280" },
    { value: "slate", class: "bg-slate-500", class_text: "text-slate-500", class_hover: "hover:bg-slate-600", class_group_hover_text: "group-hover:text-slate-600", hex: "#64748b" },
    { value: "zinc", class: "bg-zinc-500", class_text: "text-zinc-500", class_hover: "hover:bg-zinc-600", class_group_hover_text: "group-hover:text-zinc-600", hex: "#71717a" },
    { value: "black", class: "bg-black", class_text: "text-black", class_hover: "hover:bg-zinc-900", class_group_hover_text: "group-hover:text-zinc-900", hex: "#000000" },
] as const;
export const getColorConfig = (value?: string) => {
    return (
        colors.find((color) => color.value === value) ??
        colors[0]
    );
};