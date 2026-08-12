import { Suspense } from 'react';
import CampaignDetailPage from '../../../../../components/dashboard/CampaignDetailPage';

export const metadata = {
  title: 'Campaign',
};

export default async function CampaignDetailRoute({ params }) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-1 py-10 text-sm text-[var(--dash-muted)]">
          Loading campaign…
        </div>
      }
    >
      <CampaignDetailPage campaignId={id} />
    </Suspense>
  );
}
