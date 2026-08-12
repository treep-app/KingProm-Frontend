import { Suspense } from 'react';
import EmailCampaignWizard from '../../../../../../components/dashboard/EmailCampaignWizard';

export const metadata = {
  title: 'Edit email campaign',
};

export default async function EditEmailCampaignPage({ params }) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-1 py-10 text-sm text-[var(--dash-muted)]">
          Loading…
        </div>
      }
    >
      <EmailCampaignWizard campaignId={id} />
    </Suspense>
  );
}
