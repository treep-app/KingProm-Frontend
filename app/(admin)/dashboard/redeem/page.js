import { Suspense } from 'react';
import RedeemClient from './RedeemClient';
import { LoadingState } from '../../../../components/dashboard/ui';

export const metadata = {
  title: 'Redeem voucher',
};

export default function RedeemPage() {
  return (
    <Suspense fallback={<LoadingState rows={3} label="Loading redeem…" />}>
      <RedeemClient />
    </Suspense>
  );
}
