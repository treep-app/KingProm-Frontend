/**
 * Audience segment presets for email campaigns.
 * Mirrors backend meta.segments with a client-side fallback.
 */

export const FALLBACK_EMAIL_SEGMENTS = [
  { id: 'all', label: 'All Customers', audience: { type: 'all', status: 'ACTIVE' } },
  { id: 'vip', label: 'VIP', audience: { type: 'segment', tag: 'VIP', status: 'ACTIVE' } },
  {
    id: 'repeat',
    label: 'Repeat Guests',
    audience: { type: 'segment', tag: 'Repeat Guest', status: 'ACTIVE' },
  },
  {
    id: 'corporate',
    label: 'Corporate',
    audience: { type: 'segment', tag: 'Corporate', status: 'ACTIVE' },
  },
  {
    id: 'birthday',
    label: 'Birthday',
    audience: { type: 'segment', tag: 'Birthday', status: 'ACTIVE' },
  },
  {
    id: 'wedding',
    label: 'Wedding',
    audience: { type: 'segment', tag: 'Wedding', status: 'ACTIVE' },
  },
  {
    id: 'never_redeemed',
    label: 'Never Redeemed',
    audience: { type: 'segment', status: 'ACTIVE', promoActivity: 'never_redeemed' },
  },
  {
    id: 'has_redeemed',
    label: 'Redeemed Before',
    audience: { type: 'segment', status: 'ACTIVE', promoActivity: 'has_redeemed' },
  },
];

/**
 * @param {Array<{ id: string, label: string, audience: object }>} [metaSegments]
 */
export function resolveEmailSegments(metaSegments) {
  if (Array.isArray(metaSegments) && metaSegments.length) return metaSegments;
  return FALLBACK_EMAIL_SEGMENTS;
}

export function findSegmentById(segments, id) {
  return (segments || FALLBACK_EMAIL_SEGMENTS).find((s) => s.id === id) || null;
}

export function audienceSummary(audience, segments = FALLBACK_EMAIL_SEGMENTS) {
  if (!audience || audience.type === 'all') return 'All customers';
  if (audience.type === 'manual') return 'Manual selection';
  if (audience.promoActivity === 'never_redeemed') return 'Never redeemed';
  if (audience.promoActivity === 'has_redeemed') return 'Redeemed before';
  if (audience.tag) return audience.tag;
  const match = segments.find(
    (s) => JSON.stringify(s.audience) === JSON.stringify(audience),
  );
  return match?.label || 'Segment';
}
