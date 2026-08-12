import { formatDateTime, formatRelativeTime } from '../../../lib/format';
import {
  ACTIVITY_TONE_CLASSES,
  getActivityTypeMeta,
} from '../../../lib/dashboard/activityTypes';

/**
 * Single activity / audit row.
 * Reusable on Dashboard Recent Activity and Audit Log.
 */
export default function ActivityItem({
  item,
  showRelative = true,
  compact = false,
}) {
  const meta = getActivityTypeMeta(item.type);
  const Icon = meta.icon;
  const toneClass = ACTIVITY_TONE_CLASSES[meta.tone] || ACTIVITY_TONE_CLASSES.neutral;
  const when = showRelative
    ? formatRelativeTime(item.createdAt)
    : formatDateTime(item.createdAt);

  return (
    <li className={`flex gap-3 ${compact ? 'px-4 py-2.5' : 'px-4 py-3'}`}>
      <div
        className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${toneClass}`}
        aria-hidden
      >
        <Icon className="size-3.5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-[var(--dash-ink)]">{item.message}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[var(--dash-muted)]">
          <span>{meta.label}</span>
          {item.actor?.name ? (
            <>
              <span aria-hidden>·</span>
              <span>{item.actor.name}</span>
            </>
          ) : null}
          {when ? (
            <>
              <span aria-hidden>·</span>
              <time dateTime={item.createdAt} title={formatDateTime(item.createdAt)}>
                {when}
              </time>
            </>
          ) : null}
        </div>
      </div>
    </li>
  );
}
