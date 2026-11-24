import { resolveWordmark } from './tenant';

/**
 * Build BrandLogo branding from scratch-card API venue payload.
 */
export function brandingFromGuestVenue(venue = {}) {
  const apiBranding = venue.branding || {};
  const displayName = apiBranding.displayName || venue.storeName || 'Workspace';
  const fromName = resolveWordmark(displayName, apiBranding);

  return {
    displayName,
    wordmarkPrimary: apiBranding.wordmarkPrimary || fromName.wordmarkPrimary,
    wordmarkAccent: apiBranding.wordmarkAccent || fromName.wordmarkAccent,
  };
}