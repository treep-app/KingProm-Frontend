import { Activity } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState } from '../ui';
import ActivityItem from './ActivityItem';

/**
 * Reusable activity / audit list.
 *
 * @param {object} props
 * @param {Array} props.items - Activity records (live or demo)
 * @param {'live'|'demo'|null} props.source
 * @param {'loading'|'ready'|'empty'|'error'} props.status
 * @param {string|null} props.errorMessage
 * @param {string|null} props.demoNote
 * @param {number|null} props.limit - Optional truncate for dashboard preview
 * @param {boolean} props.compact
 * @param {React.ReactNode} props.emptyAction
 */
export default function ActivityFeed({
  items = [],
  source = null,
  status = 'ready',
  errorMessage = null,
  demoNote = null,
  limit = null,
  compact = false,
  emptyAction = null,
  emptyTitle = 'No recent activity',
  emptyDescription = 'Operator and system events will appear here.',
}) {
  if (status === 'loading') {
    return <LoadingState rows={4} label="Loading activity…" />;
  }

  if (status === 'error') {
    return (
      <ErrorState
        title="Unable to load activity"
        message={errorMessage || 'Unable to load activity.'}
      />
    );
  }

  const visible = typeof limit === 'number' ? items.slice(0, limit) : items;

  if (status === 'empty' || !visible.length) {
    return (
      <EmptyState
        icon={Activity}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="dash-panel overflow-hidden">
      {source === 'demo' ? (
        <div className="flex items-center justify-between gap-2 border-b border-[var(--dash-border)] px-4 py-2">
          <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200/80">
            Demo
          </span>
          {demoNote ? (
            <p className="text-[11px] text-[var(--dash-muted)]">{demoNote}</p>
          ) : null}
        </div>
      ) : null}
      <ul className="divide-y divide-[var(--dash-border)]" role="list">
        {visible.map((item) => (
          <ActivityItem key={item.id} item={item} compact={compact} />
        ))}
      </ul>
    </div>
  );
}
