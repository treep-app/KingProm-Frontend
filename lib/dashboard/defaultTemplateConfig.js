/**
 * Default voucher template config — mirrors backend defaultConfig().
 */

export function defaultConfig() {
  return {
    primaryColor: '#D99D26',
    secondaryColor: '#091B34',
    accentColor: '#FFFFFF',
    logoAssetId: null,
    backgroundAssetId: null,
    background: {
      position: 'center',
      size: 'cover',
      overlayOpacity: 0.5,
    },
    typography: {
      headingStyle: 'serif',
      bodyStyle: 'sans',
    },
    layout: {
      qrPosition: 'right',
    },
    experience: {
      revealEffect: 'fireworks',
      revealMode: 'scratch',
    },
    content: {
      header: '{{business.name}}',
      title: '{{campaign.name}}',
      offer: '{{discount.value}}',
      description: '{{campaign.description}}',
      validityLabel: 'Valid until',
      validityValue: '{{promo.expiry}}',
      promoCode: '{{promo.code}}',
      customerLabel: 'Customer',
      customerValue: '{{customer.fullName}}',
      terms: '{{voucher.terms}}',
      footer: '{{business.emailFooter}}',
    },
  };
}

export default defaultConfig;
