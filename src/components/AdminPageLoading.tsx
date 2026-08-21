interface LoadingProps {
  loading: boolean;
  darkMode?: boolean;
  message?: string;
  subMessage?: string;
}

export default function AdminPageLoading({
  loading,
  darkMode = false,
  message = 'Carregando...',
  subMessage = 'Aguarde um momento',
}: LoadingProps) {
  if (!loading) return null;

  const page = darkMode ? 'bg-[#09090e]' : 'bg-[#f5f5f7]';
  const panel = darkMode ? 'bg-[#0d0d14]' : 'bg-white';
  const border = darkMode ? 'border-white/[0.07]' : 'border-slate-200';
  const skeleton = darkMode ? 'bg-white/[0.09]' : 'bg-slate-200';
  const skeletonSoft = darkMode ? 'bg-white/[0.045]' : 'bg-slate-100';
  const title = darkMode ? 'text-white/80' : 'text-slate-700';
  const subtitle = darkMode ? 'text-white/35' : 'text-slate-500';

  return (
    <div className={`fixed inset-0 z-[999] overflow-y-auto ${page}`} role="status" aria-live="polite" aria-label={message}>
      <div className="flex min-h-screen animate-pulse">
        <aside className={`hidden w-60 flex-col border-r md:flex ${panel} ${border}`}>
          <div className={`border-b p-5 ${border}`}>
            <div className={`h-10 w-40 rounded-xl ${skeleton}`} />
          </div>
          <div className="flex-1 space-y-3 p-4">
            {Array.from({ length: 8 }).map((_, index) => <div key={index} className={`h-11 rounded-xl ${index === 0 ? 'bg-brand-500/35' : skeleton}`} />)}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className={`border-b px-4 py-4 md:px-6 ${panel} ${border}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className={`h-6 w-40 rounded md:w-56 ${skeleton}`} />
                <div className={`h-3 w-24 rounded md:w-36 ${skeletonSoft}`} />
              </div>
              <div className="flex gap-2">
                <div className={`h-10 w-10 rounded-xl ${skeleton}`} />
                <div className={`h-10 w-10 rounded-xl ${skeleton}`} />
              </div>
            </div>
          </header>

          <main className="space-y-5 p-4 md:p-6">
            <div className="py-1 text-center">
              <div className="mb-3 flex justify-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-400" /><span className="h-2 w-2 rounded-full bg-brand-500 [animation-delay:150ms]" /><span className="h-2 w-2 rounded-full bg-brand-600 [animation-delay:300ms]" /></div>
              <h2 className={`text-base font-bold md:text-lg ${title}`}>{message}</h2>
              <p className={`mt-1 text-xs md:text-sm ${subtitle}`}>{subMessage}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={`rounded-3xl border p-5 ${panel} ${border}`}>
                  <div className="mb-5 flex justify-between"><div className={`h-11 w-11 rounded-2xl ${skeleton}`} /><div className={`h-4 w-16 rounded ${skeleton}`} /></div>
                  <div className={`mb-3 h-8 w-32 rounded ${skeleton}`} />
                  <div className={`mb-5 h-4 w-24 rounded ${skeletonSoft}`} />
                  <div className={`h-24 rounded-2xl ${skeletonSoft}`} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className={`rounded-3xl border p-5 lg:col-span-2 ${panel} ${border}`}><div className={`mb-5 h-5 w-40 rounded ${skeleton}`} /><div className={`h-48 rounded-2xl md:h-72 ${skeletonSoft}`} /></div>
              <div className={`rounded-3xl border p-5 ${panel} ${border}`}>
                <div className={`mb-5 h-5 w-32 rounded ${skeleton}`} />
                <div className="flex justify-center"><div className={`h-28 w-28 rounded-full border-[14px] bg-transparent md:h-36 md:w-36 ${darkMode ? 'border-white/[0.07]' : 'border-slate-100'}`} /></div>
                <div className="mt-6 space-y-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className={`h-4 rounded ${skeleton}`} />)}</div>
              </div>
            </div>

            <div className={`hidden overflow-hidden rounded-3xl border lg:block ${panel} ${border}`}>
              <div className={`h-16 border-b ${skeletonSoft} ${border}`} />
              <div className={darkMode ? 'divide-y divide-white/[0.06]' : 'divide-y divide-slate-100'}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-5 p-5">
                    <div className={`h-12 w-12 rounded-2xl ${skeleton}`} />
                    <div className="flex-1"><div className={`mb-2 h-4 w-56 rounded ${skeleton}`} /><div className={`h-3 w-28 rounded ${skeletonSoft}`} /></div>
                    <div className={`h-4 w-24 rounded ${skeleton}`} /><div className={`h-10 w-32 rounded-xl ${skeletonSoft}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 lg:hidden">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className={`rounded-3xl border p-4 ${panel} ${border}`}>
                  <div className="flex gap-3"><div className={`h-14 w-14 rounded-2xl ${skeleton}`} /><div className="flex-1 space-y-2"><div className={`h-4 w-40 max-w-full rounded ${skeleton}`} /><div className={`h-3 w-24 rounded ${skeletonSoft}`} /></div></div>
                  <div className="mt-4 grid grid-cols-3 gap-3">{Array.from({ length: 3 }).map((_, item) => <div key={item} className={`h-10 rounded-xl ${skeletonSoft}`} />)}</div>
                  <div className={`mt-4 h-11 rounded-xl ${skeletonSoft}`} />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
