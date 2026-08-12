/**
 * Shared campaign create/edit form state, validation, and API payload builders.
 */

import {
  normalizeCodePrefix,
  resolveGenerateQuantity,
  suggestPrefixFromPurpose,
  validateCodeGenerationFields,
} from './campaignCodeGeneration';
import {
  buildOfferTitleFromDiscount,
  validateDiscountFields,
} from './campaignDiscount';
import {
  dateInputToEndIso,
  dateInputToStartIso,
  toDateInputValue,
  validateValidityFields,
} from './campaignDates';
import {
  CAMPAIGN_PURPOSE_OTHER,
  parsePurposeFromDescription,
  purposeToDescription,
} from './campaignPurposes';
import { resolveMaxUsesForPayload, validateUsageFields } from './campaignUsage';

export const CREATE_WIZARD_STEPS = [
  { id: 'basic', title: 'Basic information' },
  { id: 'discount', title: 'Discount' },
  { id: 'validity', title: 'Validity' },
  { id: 'usage', title: 'Usage rules' },
  { id: 'codes', title: 'Promo codes' },
  { id: 'review', title: 'Review' },
];

export function defaultCampaignDates() {
  const start = new Date();
  const end = new Date();
  end.setUTCDate(end.getUTCDate() + 30);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export function createEmptyCampaignForm() {
  return {
    id: '',
    name: '',
    purpose: '',
    purposeOther: '',
    discountType: 'PERCENTAGE',
    discountValue: '20',
    ...defaultCampaignDates(),
    usageMode: 'SINGLE',
    maxUses: '1',
    generateEnabled: true,
    quantityPreset: 100,
    customQuantity: '',
    codePrefix: 'HOTEL',
    prefixLocked: false,
    offerSubtitle: 'On your next overnight stay or event booking',
    offerTerms: '',
    status: 'DRAFT',
    expiryMode: 'weekly',
    expiresIn: '1w',
    expiresAt: '',
    eventName: '',
    eventDate: '',
    isDefault: false,
    templateId: '',
  };
}

export function formFromCampaign(campaign) {
  const { purpose, purposeOther } = parsePurposeFromDescription(campaign.description);
  const usageMode = campaign.usageMode || 'SINGLE';
  return {
    ...createEmptyCampaignForm(),
    id: campaign.id || '',
    name: campaign.name || '',
    purpose,
    purposeOther,
    discountType: campaign.discountType || 'CUSTOM',
    discountValue: campaign.discountValue || campaign.offerTitle || '',
    startDate: toDateInputValue(campaign.startsAt) || defaultCampaignDates().startDate,
    endDate: toDateInputValue(campaign.endsAt) || defaultCampaignDates().endDate,
    usageMode,
    maxUses:
      usageMode === 'SINGLE'
        ? '1'
        : usageMode === 'UNLIMITED'
          ? ''
          : String(campaign.maxUses ?? '2'),
    generateEnabled: false,
    codePrefix:
      campaign.codePrefix ||
      suggestPrefixFromPurpose(purpose, purposeOther, campaign.name),
    prefixLocked: Boolean(campaign.codePrefix),
    offerSubtitle: campaign.offerSubtitle || '',
    offerTerms: campaign.offerTerms || '',
    status: campaign.status || 'ACTIVE',
    expiryMode: campaign.expiryMode || 'weekly',
    expiresIn: campaign.expiresIn || '',
    expiresAt: campaign.expiresAt ? String(campaign.expiresAt).slice(0, 16) : '',
    eventName: campaign.eventName || '',
    eventDate: campaign.eventDate ? String(campaign.eventDate).slice(0, 16) : '',
    isDefault: Boolean(campaign.isDefault),
    templateId: campaign.templateId || '',
  };
}

export function applyCampaignFormField(prev, key, value) {
  const next = { ...prev, [key]: value };
  if (key === 'usageMode') {
    if (value === 'SINGLE') next.maxUses = '1';
    if (value === 'UNLIMITED') next.maxUses = '';
    if (value === 'MULTIPLE' && (!prev.maxUses || prev.maxUses === '1')) {
      next.maxUses = '5';
    }
  }
  if (key === 'discountType') next.discountValue = '';
  if (key === 'codePrefix') {
    next.prefixLocked = true;
    next.codePrefix = normalizeCodePrefix(value);
  }
  if ((key === 'purpose' || key === 'purposeOther' || key === 'name') && !prev.prefixLocked) {
    next.codePrefix = suggestPrefixFromPurpose(
      key === 'purpose' ? value : next.purpose,
      key === 'purposeOther' ? value : next.purposeOther,
      key === 'name' ? value : next.name,
    );
  }
  return next;
}

/**
 * Validate a subset of steps, or all fields when stepId is null/'all'/'review'.
 */
export function validateCampaignForm(form, stepId = 'all') {
  const errors = {};
  const scope = stepId === 'review' || stepId === 'all' || !stepId ? 'all' : stepId;

  if (scope === 'all' || scope === 'basic') {
    if (!form.name.trim()) errors.name = 'Promo name is required.';
    else if (form.name.trim().length < 2) {
      errors.name = 'Promo name must be at least 2 characters.';
    }
    if (!form.purpose) errors.purpose = 'Select a purpose.';
    else if (form.purpose === CAMPAIGN_PURPOSE_OTHER && !form.purposeOther.trim()) {
      errors.purposeOther = 'Describe the purpose for Other.';
    }
  }

  if (scope === 'all' || scope === 'discount') {
    Object.assign(
      errors,
      validateDiscountFields({
        discountType: form.discountType,
        discountValue: form.discountValue,
      }),
    );
  }

  if (scope === 'all' || scope === 'validity') {
    Object.assign(
      errors,
      validateValidityFields({
        startDate: form.startDate,
        endDate: form.endDate,
      }),
    );
  }

  if (scope === 'all' || scope === 'usage') {
    Object.assign(
      errors,
      validateUsageFields({
        usageMode: form.usageMode,
        maxUses: form.maxUses,
      }),
    );
  }

  if (scope === 'all' || scope === 'codes') {
    Object.assign(
      errors,
      validateCodeGenerationFields({
        generateEnabled: form.generateEnabled,
        quantityPreset: form.quantityPreset,
        customQuantity: form.customQuantity,
        codePrefix: form.codePrefix,
      }),
    );
  }

  return errors;
}

/**
 * Build API payload. When deferGeneration is true, omit codeGeneration
 * so the client can redirect and generate after create (avoids long waits).
 */
export function buildCampaignPayload(form, { editing = false, deferGeneration = false } = {}) {
  const offerTitle = buildOfferTitleFromDiscount(form.discountType, form.discountValue);
  const prefix = normalizeCodePrefix(form.codePrefix);
  const quantity = resolveGenerateQuantity({
    quantityPreset: form.quantityPreset,
    customQuantity: form.customQuantity,
    generateEnabled: form.generateEnabled,
  });

  const includeGeneration =
    !editing && form.generateEnabled && quantity > 0 && !deferGeneration;

  return {
    name: form.name.trim(),
    description: purposeToDescription(form.purpose, form.purposeOther),
    offerTitle,
    offerSubtitle: form.offerSubtitle.trim(),
    offerTerms: form.offerTerms.trim(),
    discountType: form.discountType,
    discountValue: String(form.discountValue || '').trim(),
    startsAt: dateInputToStartIso(form.startDate),
    endsAt: dateInputToEndIso(form.endDate),
    usageMode: form.usageMode,
    maxUses: resolveMaxUsesForPayload(form.usageMode, form.maxUses),
    codePrefix: prefix,
    status: form.status,
    expiryMode: form.expiryMode,
    expiresIn: form.expiresIn.trim() || null,
    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    eventName: form.eventName.trim() || null,
    eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : null,
    isDefault: form.isDefault,
    templateId: form.templateId.trim() || null,
    ...(!editing && form.id.trim() ? { id: form.id.trim() } : {}),
    ...(includeGeneration
      ? {
          codeGeneration: {
            quantity,
            prefix,
          },
        }
      : {}),
  };
}

export function getGenerateRequestFromForm(form) {
  if (!form.generateEnabled) return null;
  const quantity = resolveGenerateQuantity({
    quantityPreset: form.quantityPreset,
    customQuantity: form.customQuantity,
    generateEnabled: true,
  });
  if (!Number.isInteger(quantity) || quantity < 1) return null;
  return {
    quantity,
    prefix: normalizeCodePrefix(form.codePrefix),
  };
}

/** Defer server generation when quantity is large (no async job queue yet). */
export const DEFER_GENERATION_THRESHOLD = 100;
