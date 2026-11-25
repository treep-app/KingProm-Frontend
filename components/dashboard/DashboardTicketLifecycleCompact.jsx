import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TICKET_LIFECYCLE_STEPS } from '../../lib/dashboard/constants';
import StatusBadge from './StatusBadge';

/**
 * Compact voucher lifecycle reference — pairs with Recent activity in the overview footer row.
 */
export default function DashboardTicketLifecycleCompact() {
  return (
    <section aria-label="Voucher lifecycle" className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Voucher lifecycle</h2>
        <Link
          href="/dashboard/promo-codes"
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--dash-accent)] hover:underline"
        >
          Promo codes
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <p className="text-xs text-[var(--dash-muted)]">
        How a code moves from issue to redemption or expiry.
      </p>
      <div className="dash-panel p-3 sm:p-4">
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {TICKET_LIFECYCLE_STEPS.map((step, index) => (
            <li
              key={step.status}
              className="flex items-start gap-2.5 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-2)]/35 px-3 py-2.5"
            >
              <span
                className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-white text-[10px] font-bold tabular-nums text-[var(--dash-muted)] ring-1 ring-[var(--dash-border)]"
                aria-hidden
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <StatusBadge status={step.status} />
                <p className="mt-1 text-[11px] leading-snug text-[var(--dash-muted)]">
                  {step.label}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}