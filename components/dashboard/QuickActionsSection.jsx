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

function ActionRailItem({ action }) {
  const Icon = action.icon;
  const planned = action.status === 'planned';

  return (
    <Link
      href={action.href}
      className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--dash-surface-2)]/60"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-surface-2)] text-[var(--dash-ink-soft)] ring-1 ring-[var(--dash-border)]">
        <Icon className="size-3.5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-[var(--dash-ink)]">{action.label}</span>
          {planned ? (
            <span className="shrink-0 rounded px-1 py-0.5 text-[9px] font-semibold uppercase text-[var(--dash-muted)] ring-1 ring-[var(--dash-border)]">
              Soon
            </span>
          ) : null}
        </span>
      </span>
      <ArrowUpRight className="size-3.5 shrink-0 text-[var(--dash-muted)] opacity-0 transition group-hover:opacity-100" />
    </Link>
  );
}

export default function QuickActionsSection({ actions = QUICK_ACTIONS, layout = 'grid' }) {
  const can = useCan();
  const visible = actions.filter((action) =>
    action.permission ? can(action.permission) : true,
  );

  if (visible.length === 0) return null;

  if (layout === 'strip') {
    return (
      <section aria-label="Quick actions" className="space-y-2">
        <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visible.slice(0, 6).map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                href={action.href}
                className="dash-panel flex w-[7.25rem] shrink-0 snap-start flex-col gap-2 p-3 transition hover:border-[var(--dash-border-strong)]"
              >
                <Icon className="size-4 text-[var(--dash-ink-soft)]" strokeWidth={1.75} />
                <span className="line-clamp-2 text-xs font-medium leading-snug text-[var(--dash-ink)]">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    );
  }

  if (layout === 'rail') {
    return (
      <section aria-label="Quick actions" className="space-y-2">
        <SectionHeader title="Shortcuts" />
        <div className="dash-panel divide-y divide-[var(--dash-border)] overflow-hidden">
          {visible.slice(0, 5).map((action) => (
            <ActionRailItem key={action.id} action={action} />
          ))}
        </div>
      </section>
    );
  }

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
