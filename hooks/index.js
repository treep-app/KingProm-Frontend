/**
 * Dashboard data hooks — sit between UI components and API services.
 *
 * pages/components → hooks → services (campaignService / promoCodeService) → backend
 */

export { useCampaigns } from './useCampaigns';
export { useCampaign } from './useCampaign';
export { usePromoCodes } from './usePromoCodes';
export { usePromoCode } from './usePromoCode';
export { useCustomers } from './useCustomers';
export { useCustomer } from './useCustomer';
export { useCustomerStats } from './useCustomerStats';
export { useTemplates } from './useTemplates';
export { useTemplate } from './useTemplate';
export { useBrandingSettings } from './useBranding';
export { useActiveTemplates } from './useActiveTemplates';
export { useEmailCampaigns } from './useEmailCampaigns';
export { useEmailCampaign } from './useEmailCampaign';
export { useRedemptions } from './useRedemptions';
export { useRedemption } from './useRedemption';
