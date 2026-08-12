/**
 * Public API barrel — keeps existing scratch imports stable.
 *
 * Prefer for dashboard work:
 *   components → hooks → campaignService / promoCodeService → backend
 */

export { verifyTicket, redeemTicket } from './api/scratch';
export {
  login,
  logout,
  fetchMe,
  sendTicket,
  listTickets,
  getTicket,
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  generateCampaignPromoCodes,
  getAnalyticsSummary,
  getAdminKey,
  hasAdminKey,
  AdminApiNotImplementedError,
} from './api/admin';
export * as campaignService from './api/campaignService';
export * as promoCodeService from './api/promoCodeService';
export { DASHBOARD_MODULES } from './dashboard/modules';
export { formatDate, formatDateTime, formatTimeRemaining } from './format';
export {
  messageFromApiResult,
  messageFromCaughtError,
  messageFromGenerationError,
  fieldErrorsFromApiResult,
  classifyApiResult,
  safeApiMessage,
  isAuthFailure,
  isNotFound,
} from './api/errors';
