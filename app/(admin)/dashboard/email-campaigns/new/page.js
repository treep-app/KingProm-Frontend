import { Suspense } from 'react';
import EmailCampaignWizard from '../../../../../components/dashboard/EmailCampaignWizard';

export const metadata = {
  title: 'Create email campaign',
};

export default function CreateEmailCampaignPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-1 py-10 text-sm text-[var(--dash-muted)]">
          Loading…
        </div>
      }
    >
      <EmailCampaignWizard />
    </Suspense>
  );
}
