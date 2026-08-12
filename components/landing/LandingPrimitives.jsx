import Link from 'next/link';

export function CtaButton({ href, children, variant = 'primary', className = '' }) {
  const base =
    variant === 'primary'
      ? 'landing-btn-primary'
      : variant === 'secondary'
        ? 'landing-btn-secondary'
        : 'landing-btn-ghost';

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

export function PricingCard({ plan, formatMoney, compact = false }) {
  const price = plan.customPrice
    ? 'Custom'
    : plan.priceCents > 0
      ? formatMoney(plan.priceCents, plan.currency)
      : '$0';

  const bullets = compact ? plan.bullets.slice(0, 4) : plan.bullets;

  return (
    <article className={['landing-price-card', plan.highlight ? 'is-featured' : ''].join(' ')}>
      {plan.badge ? <span className="landing-price-badge">{plan.badge}</span> : null}
      <h3>{plan.name}</h3>
      <p className="landing-price-amount">
        <strong>{price}</strong>
        {!plan.customPrice ? <span>/mo</span> : null}
      </p>
      <p className="landing-price-desc">{plan.description}</p>
      <ul>
        {bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <CtaButton
        href={plan.ctaHref}
        variant={plan.highlight ? 'primary' : 'secondary'}
        className="w-full !text-sm"
      >
        {plan.ctaLabel}
      </CtaButton>
    </article>
  );
}

export function FAQItem({ item, open, onToggle }) {
  return (
    <div className="landing-faq-item">
      <button type="button" aria-expanded={open} onClick={onToggle}>
        <span>{item.q}</span>
        <em aria-hidden>{open ? '−' : '+'}</em>
      </button>
      {open ? <p>{item.a}</p> : null}
    </div>
  );
}
