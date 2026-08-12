import { Suspense } from 'react';
import RedemptionsHistoryManager from '../../../../components/dashboard/RedemptionsHistoryManager';

export const metadata = {
  title: 'Redemptions',
};

function RedemptionsFallback() {
  return (
    <div className="mx-auto max-w-6xl space-y-3 px-1 py-6" role="status" aria-busy="true">
      <div className="h-8 w-44 animate-pulse rounded-lg bg-[var(--dash-surface-2)]" />
      <div className="h-64 animate-pulse rounded-xl bg-[var(--dash-surface-2)]" />
      <span className="sr-only">Loading redemptions…</span>
    </div>
  );
}

export default function RedemptionsPage() {
  return (
    <Suspense fallback={<RedemptionsFallback />}>
      <RedemptionsHistoryManager />
    </Suspense>
  );
}
