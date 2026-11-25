export default function PageHeader({
  title,
  description,
  actions = null,
  eyebrow = null,
  compact = false,
}) {
  return (
    <div
      className={[
        'flex flex-col gap-2 border-b border-[var(--dash-border)] lg:flex-row lg:items-center lg:justify-between',
        compact ? 'pb-3 sm:pb-4' : 'gap-3 pb-5 sm:gap-4 sm:pb-6 lg:items-start',
      ].join(' ')}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dash-muted)]">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={
            compact
              ? 'text-lg font-semibold tracking-tight text-[var(--dash-ink)] sm:text-xl'
              : 'text-xl font-semibold tracking-tight text-[var(--dash-ink)] sm:text-[1.65rem] lg:text-[1.85rem]'
          }
        >
          {title}
        </h1>
        {description && !compact ? (
          <div className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--dash-muted)] sm:text-[15px]">
            {description}
          </div>
        ) : null}
        {description && compact ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-[var(--dash-muted)] sm:text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
