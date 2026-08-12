export default function EmptyState({
  icon: Icon,
  title,
  description,
  action = null,
}) {
  return (
    <div className="dash-panel flex flex-col items-center px-4 py-10 text-center sm:px-6 sm:py-14">
      {Icon ? (
        <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-[var(--dash-surface-2)] text-[var(--dash-muted)] ring-1 ring-[var(--dash-border)] sm:size-12">
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-[var(--dash-ink)]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--dash-muted)]">{description}</p>
      {action ? <div className="mt-5 w-full max-w-xs sm:mt-6 sm:w-auto">{action}</div> : null}
    </div>
  );
}
