'use client';

/**
 * Visual section wrapper for multi-section campaign forms.
 */
export default function FormSection({ title, description, children, className = '' }) {
  return (
    <section
      className={[
        'space-y-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 sm:p-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <header className="space-y-0.5 border-b border-[var(--dash-border)] pb-3">
        <h3 className="text-sm font-semibold text-[var(--dash-ink)]">{title}</h3>
        {description ? (
          <p className="text-xs text-[var(--dash-muted)]">{description}</p>
        ) : null}
      </header>
      <div className="space-y-3.5">{children}</div>
    </section>
  );
}
