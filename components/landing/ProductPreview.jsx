import { DEMO_METRICS } from '../../lib/landing/plans';

/**
 * Polished product mockup using KingProm dashboard visual language.
 * Demo numbers only — not connected to live tenant data.
 */
export default function ProductPreview({ variant = 'hero' }) {
  const compact = variant === 'analytics';

  return (
    <div
      className={[
        'landing-preview relative overflow-hidden rounded-2xl border border-white/15 bg-[#0f172a] shadow-[0_24px_80px_rgb(2_6_23_/0.45)]',
        compact ? 'text-[11px]' : 'text-xs sm:text-sm',
      ].join(' ')}
      aria-hidden={compact ? undefined : true}
      role={compact ? 'img' : undefined}
      aria-label={compact ? 'KingProm analytics preview' : undefined}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5 sm:px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 font-medium text-white/70">KingProm Dashboard</span>
      </div>

      <div className="grid gap-0 sm:grid-cols-[140px_1fr]">
        <aside className="hidden border-r border-white/10 bg-white/[0.03] p-3 sm:block">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-white/40">
            Workspace
          </p>
          {['Overview', 'Campaigns', 'Promo codes', 'Customers', 'Redeem', 'Analytics'].map(
            (item, i) => (
              <div
                key={item}
                className={`rounded-md px-2 py-1.5 text-[11px] ${
                  i === 0 ? 'bg-white/10 text-white' : 'text-white/55'
                }`}
              >
                {item}
              </div>
            ),
          )}
        </aside>

        <div className="space-y-3 p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {[
              { label: 'Revenue', value: DEMO_METRICS.revenueLabel },
              { label: 'Campaigns', value: String(DEMO_METRICS.activeCampaigns) },
              { label: 'Promo codes', value: DEMO_METRICS.promoCodes },
              { label: 'Redemptions', value: DEMO_METRICS.redemptions },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2"
              >
                <p className="text-[10px] uppercase tracking-wide text-white/45">{stat.label}</p>
                <p className="mt-1 font-semibold tabular-nums text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-2 lg:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--gold-light))]">
                Active campaign
              </p>
              <p className="mt-1 font-semibold text-white">{DEMO_METRICS.campaignName}</p>
              <p className="mt-2 text-white/60">
                {DEMO_METRICS.campaignVouchers} vouchers · {DEMO_METRICS.campaignRedeemed} redeemed
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[hsl(var(--gold))]"
                  style={{ width: DEMO_METRICS.campaignRate }}
                />
              </div>
              <p className="mt-1.5 tabular-nums text-white/70">
                {DEMO_METRICS.campaignRate} redemption
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
                Analytics
              </p>
              <ul className="mt-2 space-y-2 text-white/75">
                <li className="flex justify-between gap-2">
                  <span>Redemption rate</span>
                  <span className="tabular-nums text-white">{DEMO_METRICS.redemptionRate}</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span>Customers</span>
                  <span className="tabular-nums text-white">{DEMO_METRICS.customers}</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span>Tracked offer value</span>
                  <span className="tabular-nums text-white">{DEMO_METRICS.revenueLabel}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
