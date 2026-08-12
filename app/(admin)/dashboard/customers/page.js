import { Suspense } from 'react';
import CustomersManager from '../../../../components/dashboard/CustomersManager';

export const metadata = {
  title: 'Customers',
};

function CustomersFallback() {
  return (
    <div className="mx-auto max-w-6xl space-y-3 px-1 py-6" role="status" aria-busy="true">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-[var(--dash-surface-2)]" />
      <div className="grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--dash-surface-2)]" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-[var(--dash-surface-2)]" />
      <span className="sr-only">Loading customers…</span>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<CustomersFallback />}>
      <CustomersManager />
    </Suspense>
  );
}
