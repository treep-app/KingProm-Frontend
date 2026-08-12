/**
 * Generic loading placeholder for panels and sections.
 */
export default function LoadingState({
  rows = 3,
  label = 'Loading…',
  className = '',
}) {
  return (
    <div
      className={['dash-panel divide-y divide-[var(--dash-border)]', className]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3">
          <div className="size-8 shrink-0 animate-pulse rounded-lg bg-[var(--dash-surface-2)]" />
          <div className="flex-1 space-y-2 py-0.5">
            <div className="h-3.5 w-2/3 max-w-xs animate-pulse rounded bg-[var(--dash-surface-2)]" />
            <div className="h-3 w-1/3 max-w-[10rem] animate-pulse rounded bg-[var(--dash-surface-2)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
