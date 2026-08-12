import { Suspense } from 'react';
import TicketsManager from '../../../../components/dashboard/TicketsManager';

/**
 * Canonical promo-codes route — reuses the existing tickets module.
 * /dashboard/tickets redirects here for backwards compatibility.
 */
export const metadata = {
  title: 'Promo codes',
};

export default function PromoCodesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl space-y-3 px-1 py-6" role="status" aria-busy="true">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--dash-surface-2)]" />
          <div className="h-28 animate-pulse rounded-xl bg-[var(--dash-surface-2)]" />
          <div className="h-64 animate-pulse rounded-xl bg-[var(--dash-surface-2)]" />
          <span className="sr-only">Loading promo codes…</span>
        </div>
      }
    >
      <TicketsManager />
    </Suspense>
  );
}
