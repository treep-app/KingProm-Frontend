/**
 * Whitelisted voucher template variables + safe substitution.
 * Never evaluate template content as JavaScript.
 */

const VARIABLE_RE = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

export const ALLOWED_VARIABLES = [
  'business.name',
  'business.logo',
  'business.phone',
  'business.email',
  'business.website',
  'business.address',
  'business.emailFooter',
  'campaign.name',
  'campaign.description',
  'discount.value',
  'promo.code',
  'promo.expiry',
  'customer.firstName',
  'customer.fullName',
  'voucher.terms',
];

/** Human labels for the insert-variable UI. */
export const VARIABLE_LABELS = {
  'business.name': 'Business name',
  'business.logo': 'Business logo URL',
  'business.phone': 'Business phone',
  'business.email': 'Business email',
  'business.website': 'Business website',
  'business.address': 'Business address',
  'business.emailFooter': 'Email footer',
  'campaign.name': 'Campaign name',
  'campaign.description': 'Campaign description',
  'discount.value': 'Discount value',
  'promo.code': 'Promo code',
  'promo.expiry': 'Promo expiry',
  'customer.firstName': 'Customer first name',
  'customer.fullName': 'Customer full name',
  'voucher.terms': 'Voucher terms',
};

export const ALLOWED_VARIABLE_OPTIONS = ALLOWED_VARIABLES.map((key) => ({
  key,
  label: VARIABLE_LABELS[key] || key,
  token: `{{${key}}}`,
}));

/**
 * Sample context for previews — clearly fictional, not real customer data.
 */
export const SAMPLE_PREVIEW_CONTEXT = {
  business: {
    name: 'Blue Top Villa',
    logo: '',
    phone: '055 917 1787',
    email: 'info@example.com',
    website: 'https://example.com',
    address: 'Sample Address',
    emailFooter: 'Thank you for choosing Blue Top Villa.',
  },
  campaign: {
    name: 'Christmas Offer',
    description: 'Enjoy a special seasonal discount on your next stay.',
  },
  discount: {
    value: '20% OFF',
  },
  promo: {
    code: 'HOTEL-QW82P9',
    expiry: '31 December 2026',
  },
  customer: {
    firstName: 'John',
    fullName: 'John Doe',
  },
  voucher: {
    terms: 'Terms & Conditions apply. Sample preview data only.',
  },
};

/**
 * Build preview context, optionally merging branding defaults.
 * @param {Record<string, unknown>} [branding]
 */
export function buildSamplePreviewContext(branding = {}) {
  return {
    business: {
      name: branding.businessName || SAMPLE_PREVIEW_CONTEXT.business.name,
      logo: branding.logoUrl || '',
      phone: branding.phone || SAMPLE_PREVIEW_CONTEXT.business.phone,
      email: branding.email || SAMPLE_PREVIEW_CONTEXT.business.email,
      website: branding.website || SAMPLE_PREVIEW_CONTEXT.business.website,
      address: branding.address || SAMPLE_PREVIEW_CONTEXT.business.address,
      emailFooter:
        branding.emailFooter || SAMPLE_PREVIEW_CONTEXT.business.emailFooter,
    },
    campaign: { ...SAMPLE_PREVIEW_CONTEXT.campaign },
    discount: { ...SAMPLE_PREVIEW_CONTEXT.discount },
    promo: { ...SAMPLE_PREVIEW_CONTEXT.promo },
    customer: { ...SAMPLE_PREVIEW_CONTEXT.customer },
    voucher: {
      terms:
        branding.defaultTerms || SAMPLE_PREVIEW_CONTEXT.voucher.terms,
    },
  };
}

/**
 * Safe variable substitution — whitelist only, no eval.
 * @param {string} template
 * @param {Record<string, unknown>} [context]
 */
export function renderTemplateString(template, context = {}) {
  return String(template || '').replace(VARIABLE_RE, (_, key) => {
    if (!ALLOWED_VARIABLES.includes(key)) return '';
    const parts = key.split('.');
    let cur = context;
    for (const part of parts) {
      if (cur == null || typeof cur !== 'object') return '';
      cur = cur[part];
    }
    if (cur == null) return '';
    return String(cur);
  });
}

export function variableToken(key) {
  return `{{${key}}}`;
}
