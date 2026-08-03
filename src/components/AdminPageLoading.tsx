interface LoadingProps {
    loading: boolean;
    message?: string;
    subMessage?: string;
}

export default function AdminPageLoading({
    loading,
    message = "Carregando...",
    subMessage = "Aguarde um momento",
}: LoadingProps) {
    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-[999] bg-[#f5f5f7] animate-pulse overflow-y-auto">
            <div className="min-h-screen flex">

                {/* Sidebar */}
                <aside className="hidden md:flex w-60 flex-col border-r bg-white border-slate-200">
                    <div className="p-5 border-b">
                        <div className="h-10 w-40 rounded-xl bg-slate-200" />
                    </div>

                    <div className="flex-1 p-4 space-y-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-11 rounded-xl bg-slate-200" />
                        ))}
                    </div>
                </aside>

                <div className="flex-1 flex flex-col">

                    {/* Header */}
                    <header className="border-b bg-white px-4 md:px-6 py-4">
                        <div className="flex items-center justify-between">

                            <div className="space-y-2">
                                <div className="h-6 w-40 md:w-56 rounded bg-slate-200" />
                                <div className="h-3 w-24 md:w-36 rounded bg-slate-100" />
                            </div>

                            <div className="flex gap-2">
                                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                            </div>

                        </div>
                    </header>

                    <main className="p-4 md:p-6 space-y-5">

                        {/* Texto */}
                        <div className="text-center">
                            <h2 className="text-base md:text-lg font-bold text-slate-700">
                                {message}
                            </h2>

                            <p className="text-xs md:text-sm text-slate-500 mt-1">
                                {subMessage}
                            </p>
                        </div>

                        {/* Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-3xl border bg-white p-5"
                                >
                                    <div className="flex justify-between mb-5">
                                        <div className="w-11 h-11 rounded-2xl bg-slate-200" />
                                        <div className="h-4 w-16 rounded bg-slate-200" />
                                    </div>

                                    <div className="h-8 w-32 rounded bg-slate-200 mb-3" />
                                    <div className="h-4 w-24 rounded bg-slate-100 mb-5" />

                                    <div className="h-24 rounded-2xl bg-slate-100" />
                                </div>
                            ))}
                        </div>

                        {/* Gráficos */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                            <div className="lg:col-span-2 rounded-3xl border bg-white p-5">
                                <div className="h-5 w-40 rounded bg-slate-200 mb-5" />

                                <div className="h-48 md:h-72 rounded-2xl bg-slate-100" />
                            </div>

                            <div className="rounded-3xl border bg-white p-5">
                                <div className="h-5 w-32 rounded bg-slate-200 mb-5" />

                                <div className="flex justify-center">
                                    <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-slate-100" />
                                </div>

                                <div className="space-y-3 mt-6">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="h-4 rounded bg-slate-200" />
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Desktop */}
                        <div className="hidden lg:block rounded-3xl border bg-white overflow-hidden">

                            <div className="h-16 border-b bg-slate-50" />

                            <div className="divide-y">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-5 p-5"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-slate-200" />

                                        <div className="flex-1">
                                            <div className="h-4 w-56 rounded bg-slate-200 mb-2" />
                                            <div className="h-3 w-28 rounded bg-slate-100" />
                                        </div>

                                        <div className="w-24 h-4 rounded bg-slate-200" />
                                        <div className="w-32 h-10 rounded-xl bg-slate-100" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mobile */}
                        <div className="lg:hidden space-y-4">

                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-3xl border bg-white p-4"
                                >
                                    <div className="flex gap-3">

                                        <div className="w-14 h-14 rounded-2xl bg-slate-200" />

                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-40 rounded bg-slate-200" />
                                            <div className="h-3 w-24 rounded bg-slate-100" />
                                        </div>

                                    </div>

                                    <div className="mt-4 grid grid-cols-3 gap-3">

                                        <div className="h-10 rounded-xl bg-slate-100" />
                                        <div className="h-10 rounded-xl bg-slate-100" />
                                        <div className="h-10 rounded-xl bg-slate-100" />

                                    </div>

                                    <div className="mt-4 h-11 rounded-xl bg-slate-100" />

                                </div>
                            ))}

                        </div>

                    </main>

                </div>

            </div>
        </div>
    );
}