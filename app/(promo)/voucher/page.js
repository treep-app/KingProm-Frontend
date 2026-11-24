import { Suspense } from 'react';
import VoucherPassPage from '../../../components/VoucherPassPage';
import TicketLoadingPlaceholder from '../../../components/TicketLoadingPlaceholder';

export const metadata = {
  title: 'Voucher',
  description: 'Your digital voucher — present at check-in',
};

export default function VoucherRoute() {
  return (
    <Suspense fallback={<TicketLoadingPlaceholder message="Loading voucher…" />}>
      <VoucherPassPage />
    </Suspense>
  );
}