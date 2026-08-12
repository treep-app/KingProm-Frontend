import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Ticket,
  Megaphone,
  Users,
  BadgeCheck,
  Mail,
  LayoutTemplate,
  Palette,
  UserCog,
  ScrollText,
  FileBarChart,
  ScanLine,
  CreditCard,
  Plug,
  Workflow,
  KeyRound,
} from 'lucide-react';

/**
 * Dashboard IA — matches product navigation spec.
 * `status: 'live'` → existing implementation; `planned` → route stub only.
 */
export const DASHBOARD_NAV_GROUPS = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        exact: true,
        status: 'live',
      },
    ],
  },
  {
    id: 'promotions',
    label: 'Promotions',
    items: [
      {
        href: '/dashboard/campaigns',
        label: 'Campaigns',
        icon: Megaphone,
        status: 'live',
      },
      {
        href: '/dashboard/promo-codes',
        label: 'Promo Codes',
        icon: Ticket,
        status: 'live',
      },
      {
        href: '/dashboard/redeem',
        label: 'Redeem',
        icon: ScanLine,
        status: 'live',
      },
      {
        href: '/dashboard/redemptions',
        label: 'Redemptions',
        icon: BadgeCheck,
        status: 'live',
      },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    items: [
      {
        href: '/dashboard/customers',
        label: 'Customers',
        icon: Users,
        status: 'live',
      },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    items: [
      {
        href: '/dashboard/email-campaigns',
        label: 'Email Campaigns',
        icon: Mail,
        status: 'live',
      },
      {
        href: '/dashboard/templates',
        label: 'Templates',
        icon: LayoutTemplate,
        status: 'live',
      },
    ],
  },
  {
    id: 'insights',
    label: 'Insights',
    items: [
      {
        href: '/dashboard/analytics',
        label: 'Analytics',
        icon: BarChart3,
        status: 'live',
      },
      {
        href: '/dashboard/reports',
        label: 'Reports',
        icon: FileBarChart,
        status: 'live',
      },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    items: [
      {
        href: '/dashboard/branding',
        label: 'Branding',
        icon: Palette,
        status: 'live',
      },
      {
        href: '/dashboard/team',
        label: 'Team & Roles',
        icon: UserCog,
        status: 'live',
      },
      {
        href: '/dashboard/settings/business',
        label: 'Business profile',
        icon: Settings,
        status: 'live',
      },
      {
        href: '/dashboard/settings/billing',
        label: 'Billing',
        icon: CreditCard,
        status: 'live',
      },
      {
        href: '/dashboard/settings/integrations',
        label: 'Integrations',
        icon: Plug,
        status: 'live',
      },
      {
        href: '/dashboard/automations',
        label: 'Automations',
        icon: Workflow,
        status: 'live',
      },
      {
        href: '/dashboard/settings/api',
        label: 'API & webhooks',
        icon: KeyRound,
        status: 'live',
      },
      {
        href: '/dashboard/audit-log',
        label: 'Audit Log',
        icon: ScrollText,
        status: 'planned',
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      {
        href: '/dashboard/settings',
        label: 'Settings',
        icon: Settings,
        status: 'live',
      },
      {
        href: '/dashboard/settings/users',
        label: 'Users',
        icon: UserCog,
        status: 'live',
      },
    ],
  },
];

export const DASHBOARD_NAV = DASHBOARD_NAV_GROUPS.flatMap((group) => group.items);

export function matchNavItem(pathname) {
  const sorted = [...DASHBOARD_NAV].sort((a, b) => b.href.length - a.href.length);
  return (
    sorted.find((item) =>
      item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
    ) || null
  );
}

export function breadcrumbForPath(pathname) {
  const item = matchNavItem(pathname);
  if (!item) {
    return [{ href: '/dashboard', label: 'Dashboard' }];
  }
  const group = DASHBOARD_NAV_GROUPS.find((g) => g.items.some((i) => i.href === item.href));
  const crumbs = [{ href: '/dashboard', label: 'Dashboard' }];
  if (group?.label && group.id !== 'overview') {
    crumbs.push({ href: item.href, label: group.label });
  }
  if (!(item.exact || item.href === '/dashboard')) {
    crumbs.push({ href: item.href, label: item.label });
  }
  return crumbs;
}

/** @deprecated use getCurrentTenant() from lib/tenant */
export { WORKSPACE } from '../tenant';
