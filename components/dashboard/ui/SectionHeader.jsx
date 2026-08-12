import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Consistent section title row used across dashboard modules.
 */
export default function SectionHeader({
  title,
  description = null,
  actions = null,
  href = null,
  linkLabel = null,
  badge = null,
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-[var(--dash-ink)]">{title}</h2>
          {badge}
        </div>
        {description ? (
          <p className="mt-0.5 text-xs text-[var(--dash-muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
      {!actions && href && linkLabel ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--dash-accent)] hover:underline"
        >
          {linkLabel}
          <ArrowRight className="size-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
