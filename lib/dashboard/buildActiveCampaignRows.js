import { formatNumber } from '../format';

/**
 * Short expiry label, e.g. "31 Dec".
 */
export function formatCampaignExpiryLabel(campaign) {
  if (campaign?.expiresAt) {
    return new Date(campaign.expiresAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  }
  if (campaign?.eventDate) {
    return new Date(campaign.eventDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  }
  if (campaign?.expiresIn) {
    return `Valid ${campaign.expiresIn}`;
  }
  if (campaign?.expiryMode) {
    return String(campaign.expiryMode);
  }
  return '—';
}

function purposeFromCampaign(campaign) {
  const description = String(campaign.description || '').trim();
  if (description) return description;
  const subtitle = String(campaign.offerSubtitle || '').trim();
  if (subtitle) return subtitle;
  const title = String(campaign.offerTitle || '').trim();
  if (title) return title;
  return '—';
}

/**
 * Merge ACTIVE campaigns with analytics byCampaign stats into display rows.
 *
 * @param {{
 *   campaigns?: Array,
 *   byCampaign?: Array,
 * }} input
 */
export function buildActiveCampaignRows({ campaigns = [], byCampaign = [] } = {}) {
  const statsById = new Map(
    (byCampaign || []).map((row) => [row.id, row]),
  );

  return (campaigns || []).map((campaign) => {
    const stats = statsById.get(campaign.id);
    const codes =
      stats?.total != null
        ? Number(stats.total)
        : Number(campaign.ticketCount ?? 0);
    const redeemed = stats?.redeemed != null ? Number(stats.redeemed) : 0;
    const remaining = Math.max(codes - redeemed, 0);

    return {
      id: campaign.id,
      name: campaign.name || campaign.id,
      purpose: purposeFromCampaign(campaign),
      codes,
      redeemed,
      remaining,
      expiresLabel: formatCampaignExpiryLabel(campaign),
      expiresAt: campaign.expiresAt || campaign.eventDate || null,
      status: campaign.status || 'ACTIVE',
      href: `/dashboard/promo-codes?campaignId=${encodeURIComponent(campaign.id)}`,
    };
  });
}

export function formatCodesLabel(count) {
  const n = formatNumber(count);
  return `${n} ${Number(count) === 1 ? 'code' : 'codes'}`;
}
