import { Suspense } from 'react';
import CampaignsManager from '../../../../components/dashboard/CampaignsManager';

export const metadata = {
  title: 'Campaigns',
};

function CampaignsFallback() {
  return (
    <div className="mx-auto max-w-6xl space-y-3 px-1 py-6" role="status" aria-busy="true">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--dash-surface-2)]" />
      <div className="h-28 animate-pulse rounded-xl bg-[var(--dash-surface-2)]" />
      <div className="h-64 animate-pulse rounded-xl bg-[var(--dash-surface-2)]" />
      <span className="sr-only">Loading campaigns…</span>
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={<CampaignsFallback />}>
      <CampaignsManager />
    </Suspense>
  );
}
