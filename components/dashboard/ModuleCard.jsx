import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function ModuleCard({ href, title, description, status = 'planned', icon: Icon }) {
  const planned = status === 'planned';

  return (
    <Link
      href={href}
      className="dash-panel group flex flex-col p-5 transition-[border-color,box-shadow,transform] duration-200 hover:border-[var(--dash-border-strong)] hover:shadow-[var(--dash-shadow-md)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--dash-surface-2)] text-[var(--dash-ink)] ring-1 ring-[var(--dash-border)]">
          {Icon ? <Icon className="size-[18px]" strokeWidth={1.75} /> : null}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              planned
                ? 'bg-[var(--dash-surface-2)] text-[var(--dash-muted)]'
                : 'bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]'
            }`}
          >
            {planned ? 'Planned' : 'Live'}
          </span>
          <ArrowUpRight className="size-4 text-[var(--dash-muted)] transition group-hover:text-[var(--dash-ink)]" />
        </div>
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-[var(--dash-ink)]">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--dash-muted)]">{description}</p>
    </Link>
  );
}
