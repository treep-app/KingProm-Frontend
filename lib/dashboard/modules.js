import { BarChart3, Megaphone, Settings, Ticket, Users } from 'lucide-react';

/** Live workspace modules shown on the dashboard overview. */
export const WORKSPACE_MODULES = [
  {
    id: 'promo-codes',
    href: '/dashboard/promo-codes',
    title: 'Promo codes',
    description: 'Search, issue, resend, and track voucher lifecycle.',
    status: 'ready',
    icon: Ticket,
  },
  {
    id: 'campaigns',
    href: '/dashboard/campaigns',
    title: 'Campaigns',
    description: 'Offer copy, expiry rules, and campaign branding.',
    status: 'ready',
    icon: Megaphone,
  },
  {
    id: 'customers',
    href: '/dashboard/customers',
    title: 'Customers',
    description: 'Guest profiles, tags, and promo assignment.',
    status: 'ready',
    icon: Users,
  },
  {
    id: 'analytics',
    href: '/dashboard/analytics',
    title: 'Analytics',
    description: 'Campaign, redemption, email, and customer performance.',
    status: 'ready',
    icon: BarChart3,
  },
  {
    id: 'settings',
    href: '/dashboard/settings',
    title: 'Settings',
    description: 'Session, legacy API key, workspace info.',
    status: 'ready',
    icon: Settings,
  },
];

/** @deprecated Prefer WORKSPACE_MODULES or DASHBOARD_NAV */
export const DASHBOARD_MODULES = WORKSPACE_MODULES.map((m) => ({
  id: m.id,
  href: m.href,
  label: m.title,
  description: m.description,
  status: m.status,
}));
