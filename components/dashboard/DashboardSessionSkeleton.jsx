'use client';

function Bone({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[var(--dash-surface-2)] ${className}`}
      aria-hidden
    />
  );
}

function NavBone() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Bone className="size-[18px] shrink-0 rounded-md" />
      <Bone className="h-3.5 flex-1 max-w-[7.5rem]" />
    </div>
  );
}

/**
 * Full-shell placeholder shown while AuthGate validates the session.
 * Mirrors sidebar + topbar + content so the dashboard feels imminent.
 */
export default function DashboardSessionSkeleton({ label = 'Loading dashboard…' }) {
  return (
    <div
      className="dashboard-shell flex min-h-dvh min-w-0 overflow-x-hidden bg-[var(--dash-bg)] text-[var(--dash-ink)]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{label}</span>

      {/* Sidebar chrome */}
      <aside className="hidden w-[15.5rem] shrink-0 border-r border-[var(--dash-border)] bg-[color-mix(in_srgb,var(--dash-bg)_70%,white)] lg:flex lg:flex-col">
        <div className="flex h-14 items-center gap-2.5 border-b border-[var(--dash-border)] px-4">
          <Bone className="size-8 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Bone className="h-3 w-24" />
            <Bone className="h-2.5 w-16" />
          </div>
        </div>
        <div className="flex-1 space-y-5 overflow-hidden px-3 py-4">
          {[0, 1, 2].map((group) => (
            <div key={group} className="space-y-1">
              <Bone className="mb-2 ml-3 h-2.5 w-14" />
              <NavBone />
              <NavBone />
              <NavBone />
              {group === 0 ? <NavBone /> : null}
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--dash-border)] p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Bone className="size-8 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Bone className="h-3 w-20" />
              <Bone className="h-2.5 w-28" />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar chrome */}
        <header className="sticky top-0 z-30 border-b border-[var(--dash-border)] bg-[color-mix(in_srgb,var(--dash-bg)_92%,white)] pt-[env(safe-area-inset-top)] backdrop-blur-md">
          <div className="flex min-h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:px-6">
            <Bone className="size-11 shrink-0 rounded-xl lg:hidden" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Bone className="hidden h-2.5 w-28 md:block" />
              <Bone className="h-4 w-36 sm:w-44" />
            </div>
            <Bone className="hidden h-8 w-28 rounded-lg xl:block" />
            <Bone className="size-9 rounded-full sm:size-8" />
          </div>
        </header>

        {/* Page content placeholder */}
        <main className="dash-main min-w-0 flex-1 overflow-x-hidden px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1200px] space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <Bone className="h-7 w-40 sm:w-52" />
                <Bone className="h-3.5 w-64 max-w-full sm:w-80" />
              </div>
              <div className="flex gap-2">
                <Bone className="h-9 w-28" />
                <Bone className="h-9 w-36" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="dash-panel flex flex-col px-3 py-3 sm:px-4 sm:py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Bone className="h-3 w-20" />
                      <Bone className="h-6 w-16 sm:h-7 sm:w-20" />
                      <Bone className="hidden h-2.5 w-28 sm:block" />
                    </div>
                    <Bone className="hidden size-8 shrink-0 rounded-lg sm:block" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="dash-panel space-y-4 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <Bone className="h-4 w-32" />
                  <Bone className="h-3 w-20" />
                </div>
                <Bone className="h-[160px] w-full rounded-xl sm:h-[200px]" />
                <div className="flex gap-2">
                  <Bone className="h-2.5 w-16" />
                  <Bone className="h-2.5 w-20" />
                  <Bone className="h-2.5 w-14" />
                </div>
              </div>
              <div className="dash-panel space-y-3 p-4 sm:p-5">
                <Bone className="h-4 w-28" />
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 py-1">
                    <Bone className="size-8 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Bone className="h-3 w-3/4 max-w-[10rem]" />
                      <Bone className="h-2.5 w-1/2 max-w-[7rem]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-panel overflow-hidden">
              <div className="border-b border-[var(--dash-border)] px-4 py-3 sm:px-5">
                <Bone className="h-4 w-36" />
              </div>
              <div className="divide-y divide-[var(--dash-border)]">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Bone className="h-3.5 w-40 max-w-full" />
                      <Bone className="h-2.5 w-28 max-w-[70%]" />
                    </div>
                    <Bone className="h-6 w-16 shrink-0 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
