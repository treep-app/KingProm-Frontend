'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { QUICK_ACTIONS } from '../../lib/dashboard/quickActions';
import { SectionHeader } from './ui';
import { useCan } from './WorkspaceProvider';

function ActionCard({ action }) {
  const Icon = action.icon;
  const planned = action.status === 'planned';

  return (
    <Link
      href={action.href}
      className="dash-panel group flex h-full min-w-[9.5rem] flex-col p-3.5 transition-[border-color,box-shadow,background-color] duration-200 hover:border-[var(--dash-border-strong)] hover:bg-[var(--dash-surface-2)]/40 hover:shadow-[var(--dash-shadow-md)] sm:min-w-0 sm:p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--dash-surface-2)] text-[var(--dash-ink-soft)] ring-1 ring-[var(--dash-border)] transition group-hover:bg-white">
          <Icon className="size-4" strokeWidth={1.75} />
        </div>
        <div className="flex items-center gap-1.5">
          {planned ? (
            <span className="rounded-md bg-[var(--dash-surface-2)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--dash-muted)] ring-1 ring-[var(--dash-border)]">
              Soon
            </span>
          ) : null}
          <ArrowUpRight className="size-3.5 text-[var(--dash-muted)] transition group-hover:text-[var(--dash-ink)]" />
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-[var(--dash-ink)]">{action.label}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--dash-muted)]">
        {action.description}
        {planned ? ' · Placeholder route' : null}
      </p>
    </Link>
  );
}

export default function QuickActionsSection({ actions = QUICK_ACTIONS }) {
  const can = useCan();
  const visible = actions.filter((action) =>
    action.permission ? can(action.permission) : true,
  );

  if (visible.length === 0) return null;

  return (
    <section aria-label="Quick actions" className="space-y-3">
      <SectionHeader
        title="Quick Actions"
        description="Jump into common promotion and marketing workflows"
      />
      {/* Phone: horizontal snap strip · sm+: wrapping grid */}
      <div className="-mx-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 sm:[&::-webkit-scrollbar]:hidden lg:grid-cols-3 xl:grid-cols-5 [&::-webkit-scrollbar]:hidden">
        {visible.map((action) => (
          <div key={action.id} className="w-[9.75rem] shrink-0 snap-start sm:w-auto sm:shrink">
            <ActionCard action={action} />
          </div>
        ))}
      </div>
    </section>
  );
}
