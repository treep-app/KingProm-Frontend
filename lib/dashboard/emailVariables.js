/**
 * Email campaign personalization variables — mirrors backend whitelist.
 */

export const ALLOWED_EMAIL_VARIABLES = [
  'customer.firstName',
  'customer.fullName',
  'business.name',
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
  'voucher.terms',
];

export const EMAIL_VARIABLE_LABELS = {
  'customer.firstName': 'Customer first name',
  'customer.fullName': 'Customer full name',
  'business.name': 'Business name',
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
  'voucher.terms': 'Voucher terms',
};

export const EMAIL_VARIABLE_OPTIONS = ALLOWED_EMAIL_VARIABLES.map((key) => ({
  key,
  label: EMAIL_VARIABLE_LABELS[key] || key,
  token: `{{${key}}}`,
}));

export function emailVariableToken(key) {
  return `{{${key}}}`;
}
