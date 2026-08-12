/**
 * Build campaigns table rows from list + analytics summary.
 *
 * Remaining = issued codes − redeemed (not an unallocated inventory pool).
 */

import { formatCampaignExpiryLabel } from './buildActiveCampaignRows';
import { formatDiscountDisplay } from './campaignDiscount';

function purposeFromCampaign(campaign) {
  const description = String(campaign.description || '').trim();
  if (description) return description;
  return '—';
}

/**
 * @param {{
 *   campaigns?: Array,
 *   byCampaign?: Array,
 * }} input
 */
export function buildCampaignTableRows({ campaigns = [], byCampaign = [] } = {}) {
  const statsById = new Map((byCampaign || []).map((row) => [row.id, row]));

  return (campaigns || []).map((campaign) => {
    const stats = statsById.get(campaign.id);
    const promoCodes =
      stats?.total != null
        ? Number(stats.total)
        : Number(campaign.ticketCount ?? 0);
    const redeemed = stats?.redeemed != null ? Number(stats.redeemed) : 0;
    const remaining = Math.max(promoCodes - redeemed, 0);

    return {
      ...campaign,
      purpose: purposeFromCampaign(campaign),
      discount: formatDiscountDisplay(
        campaign.discountType,
        campaign.discountValue,
        campaign.offerTitle || '—',
      ),
      promoCodes,
      redeemed,
      remaining,
      startAt: campaign.startsAt || campaign.createdAt || null,
      endAt: campaign.endsAt || campaign.expiresAt || campaign.eventDate || null,
      endLabel: formatCampaignExpiryLabel(campaign),
    };
  });
}
