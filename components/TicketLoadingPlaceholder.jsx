import BrandLogo from './BrandLogo';

function Shimmer({ className = '' }) {
  return <div className={`ticket-shimmer ${className}`} aria-hidden />;
}

export default function TicketLoadingPlaceholder({ message = 'Validating your Golden Ticket…' }) {
  return (
    <main className="promo-stage" aria-busy="true" aria-live="polite">
      {/* Mobile loading */}
      <div className="flex h-[100dvh] flex-col overflow-hidden md:hidden">
        <header className="app-safe-top shrink-0 border-b border-white/8 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <BrandLogo size="md" />
            <Shimmer className="h-7 w-24 rounded-full" />
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 pb-10 pt-6">
          <div className="relative aspect-[320/460] w-full max-w-sm">
            <div className="ticket-mask absolute inset-0 overflow-hidden shadow-2xl shadow-cyan-500/10 ring-1 ring-cyan-400/25">
              <div className="gold-foil foil-animate absolute inset-0" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                <p className="text-lg font-semibold tracking-wide text-neutral-900">Blue Top Villa</p>
                <p className="mt-8 text-[42px] font-extrabold leading-none tracking-wide text-neutral-900">
                  GOLDEN
                </p>
                <p className="text-[42px] font-extrabold leading-none tracking-wide text-neutral-900">
                  TICKET
                </p>
                <p className="mt-10 text-sm text-amber-950/80">Preparing your foil…</p>
              </div>
            </div>
          </div>
          <p className="mt-10 text-center text-sm text-cyan-200/70">{message}</p>
        </div>
      </div>

      {/* Desktop loading — wide layout */}
      <div className="hidden min-h-screen md:block">
        <header className="border-b border-white/8 px-6 py-5">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <BrandLogo size="md" />
            <Shimmer className="hidden h-4 w-44 rounded-full sm:block" />
            <Shimmer className="h-7 w-28 rounded-full" />
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-12 md:px-8 md:py-14">
          <section className="flex flex-col items-center md:items-end">
            <div className="relative aspect-[320/460] w-full max-w-[420px]">
              <div className="ticket-mask absolute inset-0 overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
                <div className="gold-foil foil-animate absolute inset-0" />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                  <p className="text-lg font-semibold tracking-wide text-neutral-900">
                    Blue Top Villa
                  </p>
                  <p className="mt-8 text-[42px] font-extrabold leading-none tracking-wide text-neutral-900">
                    GOLDEN
                  </p>
                  <p className="text-[42px] font-extrabold leading-none tracking-wide text-neutral-900">
                    TICKET
                  </p>
                  <p className="mt-10 text-sm text-amber-950/80">Preparing your foil…</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-xl md:mx-0">
            <Shimmer className="h-3 w-48 rounded-full" />
            <Shimmer className="mt-4 h-12 w-full max-w-md rounded-xl" />
            <Shimmer className="mt-3 h-12 w-4/5 max-w-sm rounded-xl" />
            <div className="mt-5 space-y-2">
              <Shimmer className="h-4 w-full rounded-full" />
              <Shimmer className="h-4 w-[92%] rounded-full" />
              <Shimmer className="h-4 w-3/4 rounded-full" />
            </div>
            <p className="mt-6 text-sm text-amber-300/80">{message}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
