import { DEMO_METRICS } from '../../lib/landing/plans';

/** Light-first product mockup with theme-aware surfaces. */
export default function ProductPreview() {
  return (
    <div className="landing-preview" aria-hidden>
      <div className="landing-preview-chrome">
        <span />
        <span />
        <span />
        <em>KingProm Dashboard</em>
      </div>

      <div className="landing-preview-body">
        <aside className="landing-preview-aside">
          <p>Workspace</p>
          {['Overview', 'Campaigns', 'Promo codes', 'Redeem', 'Analytics'].map((item, i) => (
            <div key={item} className={i === 0 ? 'is-active' : ''}>
              {item}
            </div>
          ))}
        </aside>

        <div className="landing-preview-main">
          <div className="landing-preview-stats">
            {[
              { label: 'Revenue', value: DEMO_METRICS.revenueLabel },
              { label: 'Campaigns', value: String(DEMO_METRICS.activeCampaigns) },
              { label: 'Codes', value: DEMO_METRICS.promoCodes },
              { label: 'Redeemed', value: DEMO_METRICS.redemptions },
            ].map((stat) => (
              <div key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>

          <div className="landing-preview-campaign">
            <div>
              <div>
                <span>Active campaign</span>
                <strong>{DEMO_METRICS.campaignName}</strong>
              </div>
              <b>{DEMO_METRICS.campaignRate}</b>
            </div>
            <div className="landing-preview-bar">
              <i style={{ width: DEMO_METRICS.campaignRate }} />
            </div>
            <p>
              {DEMO_METRICS.campaignRedeemed} of {DEMO_METRICS.campaignVouchers} vouchers redeemed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
