/**
 * Phase 2 data-model map — conceptual fields vs backend reality.
 * Do not invent schema columns here; this is documentation for integrators.
 *
 * Scratch-card guest flow reuses the same `campaigns` + `tickets` tables.
 */

export const CAMPAIGN_FIELD_MAP = {
  id: { status: 'exists', column: 'id' },
  tenantId: {
    status: 'missing',
    note: 'Single-tenant deploy today. See backend/src/security/tenantIsolation.js',
  },
  title: { status: 'exists', column: 'name', api: 'name' },
  description: { status: 'exists', column: 'description' },
  purpose: {
    status: 'mapped',
    column: 'description',
    note: 'Purpose stored in description until a dedicated column exists',
  },
  discountType: { status: 'exists', column: 'discount_type' },
  discountValue: { status: 'exists', column: 'discount_value' },
  startDate: { status: 'exists', column: 'starts_at', api: 'startsAt' },
  endDate: { status: 'exists', column: 'ends_at', api: 'endsAt' },
  usageType: { status: 'exists', column: 'usage_mode', api: 'usageMode' },
  maxUsage: { status: 'exists', column: 'max_uses', api: 'maxUses' },
  status: { status: 'exists', column: 'status' },
  createdBy: { status: 'missing', note: 'UI shows em dash until operators authorship exists' },
  createdAt: { status: 'exists', column: 'created_at' },
  updatedAt: { status: 'exists', column: 'updated_at' },
};

export const PROMO_CODE_FIELD_MAP = {
  id: { status: 'exists', table: 'tickets', column: 'id' },
  tenantId: { status: 'missing' },
  campaignId: { status: 'exists', column: 'campaign_id' },
  customerId: {
    status: 'mapped',
    column: 'user_id',
    api: 'userId',
    note: 'Guest UUID from issue flow — not a CRM customer entity',
  },
  code: { status: 'exists', column: 'promo_code', api: 'code|promoCode' },
  status: {
    status: 'mapped',
    note: 'DB: ISSUED/REVEALED/REDEEMED/EXPIRED → admin: UNUSED/ASSIGNED/REDEEMED/EXPIRED',
  },
  usageCount: {
    status: 'derived',
    api: 'timesRedeemed',
    note: '0 or 1 from redemption status; not a counter column',
  },
  usageLimit: { status: 'derived', note: 'From campaign usageMode/maxUses' },
  expiry: { status: 'exists', column: 'expires_at', api: 'expiresAt' },
  createdAt: { status: 'exists', column: 'created_at' },
  updatedAt: { status: 'missing' },
};
