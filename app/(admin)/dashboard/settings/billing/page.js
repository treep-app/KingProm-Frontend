import { Suspense } from 'react';
import BillingSettingsPage from '../../../../../components/dashboard/BillingSettingsPage';

export const metadata = { title: 'Billing' };

export default function BillingSettingsRoute() {
  return (
    <Suspense fallback={null}>
      <BillingSettingsPage />
    </Suspense>
  );
}
