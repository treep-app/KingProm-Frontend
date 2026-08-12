import { Suspense } from 'react';
import PromoCodeDetailPage from '../../../../../components/dashboard/PromoCodeDetailPage';

export const metadata = {
  title: 'Promo code',
};

export default async function PromoCodeDetailRoute({ params }) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-1 py-10 text-sm text-[var(--dash-muted)]">
          Loading promo code…
        </div>
      }
    >
      <PromoCodeDetailPage ticketId={id} />
    </Suspense>
  );
}
