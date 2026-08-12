import Link from 'next/link';

export function SectionHeader({ eyebrow, title, description, align = 'left', id }) {
  const alignClass = align === 'center' ? 'mx-auto text-center' : '';
  return (
    <div className={`max-w-2xl ${alignClass}`} id={id}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[var(--dash-ink)] sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base leading-relaxed text-[var(--dash-muted)]">{description}</p>
      ) : null}
    </div>
  );
}

export function CtaButton({ href, children, variant = 'primary', className = '' }) {
  const base =
    variant === 'primary'
      ? 'dash-btn dash-btn-primary dash-btn-lg'
      : variant === 'secondary'
        ? 'dash-btn dash-btn-secondary dash-btn-lg'
        : 'dash-btn dash-btn-ghost dash-btn-lg';

  const isExternal = href.startsWith('mailto:') || href.startsWith('http');
  const classes = [base, className].filter(Boolean).join(' ');

  if (isExternal) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

export function FeatureCard({ title, body }) {
  return (
    <article className="rounded-xl border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow-md)]">
      <h3 className="text-base font-semibold text-[var(--dash-ink)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--dash-muted)]">{body}</p>
    </article>
  );
}

export function SolutionCard({ title, body }) {
  return (
    <article className="border-b border-[var(--dash-border)] py-6 last:border-0 sm:border-0 sm:py-0">
      <h3 className="font-display text-xl font-semibold text-[var(--dash-ink)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--dash-muted)]">{body}</p>
    </article>
  );
}

export function IntegrationCard({ title, detail, soon }) {
  return (
    <article className="rounded-xl border border-[var(--dash-border)] bg-white px-4 py-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--dash-ink)]">{title}</h3>
        {soon ? (
          <span className="shrink-0 rounded-md bg-[var(--dash-surface-2)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
            Coming soon
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-[var(--dash-muted)]">{detail}</p>
    </article>
  );
}

export function PricingCard({ plan, formatMoney }) {
  const price = plan.customPrice
    ? 'Custom'
    : plan.priceCents > 0
      ? `${formatMoney(plan.priceCents, plan.currency)}/mo`
      : '$0/mo';

  return (
    <article
      className={`flex flex-col rounded-2xl border bg-white p-6 shadow-[var(--dash-shadow-md)] ${
        plan.highlight
          ? 'border-[var(--dash-navy)] ring-1 ring-[var(--dash-navy)]'
          : 'border-[var(--dash-border)]'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-[var(--dash-ink)]">{plan.name}</h3>
        {plan.badge ? (
          <span className="rounded-md bg-[var(--dash-accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--dash-navy)]">
            {plan.badge}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-[var(--dash-ink)]">
        {price}
      </p>
      <p className="mt-2 text-sm text-[var(--dash-muted)]">{plan.description}</p>
      <ul className="mt-5 flex-1 space-y-2 text-sm text-[var(--dash-ink-soft)]">
        {plan.bullets.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--dash-gold)]" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <CtaButton
          href={plan.ctaHref}
          variant={plan.highlight ? 'primary' : 'secondary'}
          className="w-full"
        >
          {plan.ctaLabel}
        </CtaButton>
      </div>
    </article>
  );
}

export function FAQItem({ item, open, onToggle }) {
  return (
    <div className="border-b border-[var(--dash-border)] last:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dash-focus)]"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="text-sm font-semibold text-[var(--dash-ink)] sm:text-base">{item.q}</span>
        <span className="text-lg text-[var(--dash-muted)]" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {open ? (
        <p className="pb-4 text-sm leading-relaxed text-[var(--dash-muted)]">{item.a}</p>
      ) : null}
    </div>
  );
}
