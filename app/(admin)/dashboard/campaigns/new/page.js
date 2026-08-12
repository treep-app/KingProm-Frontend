import { Suspense } from 'react';
import CampaignCreateWizard from '../../../../../components/dashboard/CampaignCreateWizard';

export const metadata = {
  title: 'Create campaign',
};

export default function CreateCampaignPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-1 py-10 text-sm text-[var(--dash-muted)]">
          Loading…
        </div>
      }
    >
      <CampaignCreateWizard />
    </Suspense>
  );
}
