import {
  DEMO_ACTIVITY_ITEMS,
  DEMO_ACTIVITY_NOTE,
} from '../../../lib/dashboard/demoActivity';
import ActivityFeed from './ActivityFeed';
import { SectionHeader } from '../ui';

/**
 * Dashboard "Recent Activity" section.
 * Uses demo records until a live audit/activity API exists.
 * Pass `items` + `source="live"` to swap in production data later.
 */
export default function RecentActivitySection({
  items = null,
  source = null,
  status = null,
  errorMessage = null,
  limit = 5,
  compact = false,
}) {
  const usingDemo = !items?.length;
  const data = usingDemo ? DEMO_ACTIVITY_ITEMS : items;
  const dataSource = source || (usingDemo ? 'demo' : 'live');
  const feedStatus = status || (data.length ? 'ready' : 'empty');

  return (
    <section aria-label="Recent activity" className={compact ? 'space-y-2' : 'space-y-3'}>
      <SectionHeader
        title="Recent activity"
        description={compact ? null : 'Latest operator and system events across your workspace'}
        href="/dashboard/audit-log"
        linkLabel="Audit log"
      />

      <ActivityFeed
        items={data}
        source={dataSource}
        status={feedStatus}
        errorMessage={errorMessage}
        demoNote={DEMO_ACTIVITY_NOTE}
        limit={limit}
        compact
      />
    </section>
  );
}
