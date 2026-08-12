/**
 * Admin API facade.
 *
 * Prefer domain services for new code:
 *   - lib/api/campaignService
 *   - lib/api/promoCodeService
 *   - lib/api/customerService
 *   - hooks/useCampaigns, useCampaign, usePromoCodes, usePromoCode, useCustomers, …
 *
 * This module keeps auth helpers + backward-compatible re-exports.
 */

import { clearSession } from '../auth';
import {
  AdminApiNotImplementedError,
  adminFetch,
  adminHeaders,
  getAdminKey,
  getLegacyAdminKey,
  hasAdminKey,
  setSession,
} from './client';

export {
  AdminApiNotImplementedError,
  getAdminKey,
  hasAdminKey,
  getLegacyAdminKey,
};

export {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  generateCampaignPromoCodes,
  getAnalyticsSummary,
} from './campaignService';

export {
  getDashboardAnalytics,
  getRedemptionsSeries,
  exportAnalyticsReport,
} from './analyticsService';

export {
  getBranding,
  updateBranding,
  uploadBrandingLogo,
  removeBrandingLogo,
  getBrandingPreview,
  fetchAssetBlobUrl,
} from './brandingService';

export {
  getTemplateMeta,
  listTemplates,
  listActiveTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  duplicateTemplate,
  archiveTemplate,
  setDefaultTemplate,
  uploadTemplateLogo,
  uploadTemplateBackground,
  previewTemplateConfig,
} from './templateService';

export {
  listTickets,
  listPromoCodes,
  getTicket,
  getPromoCode,
  sendTicket,
  issuePromoCode,
  exportPromoCodes,
  cancelPromoCode,
  assignPromoCodeCustomer,
} from './promoCodeService';

export {
  getEmailCampaignMeta,
  listEmailCampaigns,
  getEmailCampaign,
  createEmailCampaign,
  updateEmailCampaign,
  deleteEmailCampaign,
  duplicateEmailCampaign,
  previewEmailCampaignAudience,
  validateEmailCampaign,
  previewEmailCampaign,
  sendEmailCampaignTest,
  scheduleEmailCampaign,
  sendEmailCampaignNow,
  cancelEmailCampaign,
  pauseEmailCampaign,
  resumeEmailCampaign,
  listEmailCampaignRecipients,
  getEmailCampaignAnalytics,
  processEmailCampaignJobs,
} from './emailCampaignService';

export {
  listRedemptionLocations,
  validateRedemption,
  redeemVoucher,
  listRedemptions,
  getRedemption,
  getTicketQr,
  downloadTicketQrPng,
  downloadTicketQrSvg,
  triggerBlobDownload,
} from './redemptionService';

export {
  getCustomerStats,
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  archiveCustomer,
  checkDuplicates,
  getCustomerActivity,
  addCustomerNote,
  getCustomerPromoCodes,
  assignPromo,
  listAvailablePromoCodes,
  previewImport,
  commitImport,
} from './customerService';

/** POST /api/admin/auth/login */
export async function login({ email, password }) {
  const result = await adminFetch('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (result.ok && result.data?.token) {
    setSession({
      token: result.data.token,
      operator: result.data.operator,
      memberships: result.data.memberships || [],
      authType: 'operator',
    });
  }
  return result;
}

/** POST /api/admin/auth/signup — self-serve Free plan workspace */
export async function signup({ email, password, name, organizationName, industry }) {
  const result = await adminFetch('/api/admin/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      name,
      organizationName,
      industry,
    }),
  });
  if (result.ok && result.data?.token) {
    setSession({
      token: result.data.token,
      operator: result.data.operator,
      memberships: result.data.memberships || [],
      authType: 'operator',
    });
  }
  return result;
}

/** GET /api/admin/auth/me */
export async function fetchMe() {
  const result = await adminFetch('/api/admin/auth/me', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
  if (result.ok && result.data?.operator) {
    setSession({
      operator: result.data.operator,
      memberships: result.data.memberships || [],
      authType: result.data.authType === 'api_key' ? 'api_key' : 'operator',
    });
  }
  return result;
}

export {
  getCurrentOrganization,
  updateOrganization,
  getUsage,
  getPlans,
  switchOrganization,
} from './organizationService';

export {
  listTeam,
  inviteMember,
  revokeInvitation,
  changeMemberRole,
  removeMember,
  acceptInvitation,
} from './teamService';

export function logout() {
  clearSession();
}
