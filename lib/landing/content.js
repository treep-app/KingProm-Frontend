/**
 * Static marketing copy for the KingProm landing page.
 * Claims only reflect shipped product capabilities.
 */

export const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#solutions', label: 'Solutions' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#integrations', label: 'Integrations' },
  { href: '#resources', label: 'Resources' },
];

export const BENEFITS = [
  {
    title: 'Create',
    body: 'Build campaigns and digital vouchers with clear offers and rules.',
  },
  {
    title: 'Distribute',
    body: 'Send offers through email campaigns and connected systems.',
  },
  {
    title: 'Redeem',
    body: 'Validate vouchers instantly with QR codes or promo codes.',
  },
  {
    title: 'Measure',
    body: 'Track redemptions, engagement, and campaign performance.',
  },
  {
    title: 'Automate',
    body: 'Trigger promotions from bookings, orders, and CRM events.',
  },
];

export const SOLUTIONS = [
  {
    title: 'Hotels',
    body: 'Create booking offers, stay upgrades, and guest vouchers.',
  },
  {
    title: 'Restaurants',
    body: 'Reward guests and drive repeat visits with targeted offers.',
  },
  {
    title: 'Events',
    body: 'Issue digital event vouchers and attendee promotions.',
  },
  {
    title: 'Retail',
    body: 'Run discount campaigns and customer reward programs.',
  },
  {
    title: 'Hospitality',
    body: 'Centralize customer engagement across venues and teams.',
  },
];

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create',
    body: 'Build your campaign and define the offer.',
  },
  {
    step: '02',
    title: 'Generate',
    body: 'Create unique promo codes and QR vouchers.',
  },
  {
    step: '03',
    title: 'Distribute',
    body: 'Send vouchers to customers by email or integrations.',
  },
  {
    step: '04',
    title: 'Redeem & track',
    body: 'Staff redeem offers while you measure results.',
  },
];

export const FEATURES = [
  {
    title: 'Campaign management',
    body: 'Create and manage promotional campaigns in one workspace.',
  },
  {
    title: 'Digital vouchers',
    body: 'Generate unique vouchers and promo codes at scale.',
  },
  {
    title: 'QR redemption',
    body: 'Let staff validate offers instantly at the desk or door.',
  },
  {
    title: 'Customer management',
    body: 'Organize guests and understand who engages with offers.',
  },
  {
    title: 'Email campaigns',
    body: 'Send personalized promotional campaigns to your audience.',
  },
  {
    title: 'Analytics',
    body: 'See redemption rates, engagement, and campaign performance.',
  },
  {
    title: 'Automation',
    body: 'Trigger promotions from bookings, orders, and CRM events.',
  },
  {
    title: 'Integrations',
    body: 'Connect KingProm to email, CRM, PMS, POS, and APIs.',
  },
];

/** Honest integration categories — labels match Phase 10 catalog status. */
export const INTEGRATION_CARDS = [
  { title: 'CRM', detail: 'HubSpot ready · Salesforce coming soon', soon: false },
  { title: 'Hotel PMS', detail: 'Generic booking webhooks', soon: false },
  { title: 'Restaurant POS', detail: 'Generic order webhooks', soon: false },
  { title: 'Payments', detail: 'Stripe billing', soon: false },
  { title: 'Email', detail: 'KingProm Email, Brevo, SendGrid', soon: false },
  { title: 'SMS', detail: 'Messaging adapters', soon: true },
  { title: 'WhatsApp', detail: 'Business messaging', soon: true },
  { title: 'Events', detail: 'Generic ticketing webhooks', soon: false },
  { title: 'Developer APIs', detail: 'API keys, scopes, outbound webhooks', soon: false },
];

export const AUTOMATION_FLOW = [
  'Customer books a stay',
  'KingProm receives the booking event',
  'Customer is identified',
  'Eligible campaign is selected',
  'Voucher is generated',
  'Customer receives the offer',
  'Customer redeems',
  'Analytics update',
];

export const SECURITY_POINTS = [
  'Secure authentication',
  'Tenant-isolated organization data',
  'Role-based access control',
  'Audit logging',
  'Secure voucher validation',
  'API keys, scopes, and signed webhooks',
];

export const FAQ_ITEMS = [
  {
    q: 'What is KingProm?',
    a: 'KingProm is a digital promotion and voucher management platform for businesses. Create campaigns, issue promo codes and QR vouchers, redeem offers, and measure results.',
  },
  {
    q: 'Can I start for free?',
    a: 'Yes. Sign up for a Free plan workspace with core campaign, voucher, customer, and QR redemption tools. Plan limits are enforced by the platform.',
  },
  {
    q: 'Can I create QR vouchers?',
    a: 'Yes. KingProm supports QR-based vouchers and staff redemption workflows.',
  },
  {
    q: 'Can I connect KingProm to other systems?',
    a: 'Yes on Professional and Enterprise plans — email, CRM, hotel PMS webhooks, restaurant POS webhooks, event ticketing webhooks, API keys, and outbound webhooks. SMS and WhatsApp are Coming Soon.',
  },
  {
    q: 'Can I upgrade my plan?',
    a: 'Yes. After you sign in, manage subscriptions from billing settings. Stripe powers paid plan upgrades.',
  },
  {
    q: 'Can multiple staff members use one account?',
    a: 'Yes. Invite teammates according to your plan seat limits and organization roles.',
  },
];

export const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '#features', label: 'Features' },
      { href: '#pricing', label: 'Pricing' },
      { href: '#integrations', label: 'Integrations' },
      { href: '/pricing', label: 'Plan details' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { href: '#solutions', label: 'Hotels' },
      { href: '#solutions', label: 'Restaurants' },
      { href: '#solutions', label: 'Events' },
      { href: '#solutions', label: 'Retail' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: 'mailto:hello@kingprom.com', label: 'Contact' },
      { href: '/dashboard/login', label: 'Login' },
      { href: '/signup', label: 'Get started' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '#resources', label: 'Overview' },
      { href: '/dashboard/settings/api', label: 'API settings' },
      { href: '/dashboard/settings/integrations', label: 'Integrations' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '#legal', label: 'Privacy' },
      { href: '#legal', label: 'Terms' },
      { href: '#legal', label: 'Cookies' },
    ],
  },
];
