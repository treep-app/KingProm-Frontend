'use client';

import dynamic from 'next/dynamic';
import { LoadingState } from '../../../../components/dashboard/ui';

const StaffRedeemPage = dynamic(
  () => import('../../../../components/dashboard/StaffRedeemPage'),
  {
    ssr: false,
    loading: () => <LoadingState rows={4} label="Loading redeem…" />,
  },
);

export default function RedeemClient() {
  return <StaffRedeemPage />;
}
