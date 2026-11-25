'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatUsagePair } from '../../lib/billingDisplay';

const LABELS = {
  customers: 'Customers',
  vouchers: 'Promo codes',
  emails: 'Emails',
  users: 'Users',
  campaigns: 'Campaigns',
};

const PLANS_SECTION_ID = 'available-plans';

function scrollToPlansSection() {
  const el = document.getElementById(PLANS_SECTION_ID);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function UpgradePlanLink({ children, className = '' }) {
  const pathname = usePathname();
  const onBilling =
    pathname === '/dashboard/settings/billing' ||
    pathname?.startsWith('/dashboard/settings/billing/');

  function handleClick(event) {
    if (!onBilling) return;
    event.preventDefault();
    scrollToPlansSection();
    if (window.location.hash !== `#${PLANS_SECTION_ID}`) {
      window.history.replaceState(null, '', `#${PLANS_SECTION_ID}`);
    }
  }

  return (
    <Link
      href={`/dashboard/settings/billing#${PLANS_SECTION_ID}`}
      onClick={handleClick}
      className={`font-semibold text-rose-950 underline decoration-rose-400 underline-offset-2 hover:text-rose-900 ${className}`}
    >
      {children}
    </Link>
  );
}

/**
 * Usage meters with 80%/100% warnings.
 */
export default function UsageMeters({ usageReport }) {
  if (!usageReport) {
    return (
      <p className="text-sm text-[var(--dash-muted)]">Usage metrics will appear here.</p>
    );
  }

  const entries = Object.entries(usageReport);
  const anyWarning = entries.some(([, m]) => m.warning);
  const anyBlocked = entries.some(([, m]) => m.blocked);

  return (
    <div className="space-y-3">
      {anyBlocked ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          You have reached a plan limit.{' '}
          <UpgradePlanLink>Upgrade your plan</UpgradePlanLink> to continue.
        </div>
      ) : anyWarning ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You are approaching your plan limit.{' '}
          <UpgradePlanLink className="text-amber-950 decoration-amber-500 hover:text-amber-900">
            Review plans
          </UpgradePlanLink>
          .
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {entries.map(([key, metric]) => {
          const pct = metric.unlimited ? 0 : metric.percent;
          const barColor = metric.blocked
            ? 'bg-rose-500'
            : metric.warning
              ? 'bg-amber-500'
              : 'bg-[var(--dash-navy)]';
          return (
            <div key={key} className="dash-panel px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--dash-muted)]">
                  {LABELS[key] || key}
                </p>
                <p className="text-xs tabular-nums text-[var(--dash-muted)]">
                  {formatUsagePair(metric.used, metric.limit)}
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--dash-surface-2)]">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: metric.unlimited ? '8%' : `${Math.max(2, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { PLANS_SECTION_ID, scrollToPlansSection };