/**
 * KingProm platform identity (SaaS brand).
 * Distinct from tenant/business branding (e.g. Blue Top Villa).
 */

export const PLATFORM = {
  name: 'KingProm',
  domain: 'kingprom.com',
  url: 'https://kingprom.com',
  description:
    'KingProm is a voucher, promo code, campaign, customer engagement, and redemption platform for businesses.',
  shortDescription: 'Voucher, promo, and redemption platform for businesses',
  /** Set once DNS/mailbox exists — do not invent unverified inboxes in UI copy. */
  salesEmail: 'hello@kingprom.com',
  branding: {
    displayName: 'KingProm',
    wordmarkPrimary: 'King',
    wordmarkAccent: 'Prom',
    tagline: 'Promo platform',
    guestSiteUrl: 'https://kingprom.com',
    /** Trimmed transparent wordmark for nav / auth */
    logoUrl: '/brand/kingprom-logo.png',
    /** Square mark for favicon-sized uses */
    markUrl: '/brand/kingprom-mark.png',
    /** 1200×630 social share card */
    ogImageUrl: '/brand/og-share.png',
  },
};

export default PLATFORM;
