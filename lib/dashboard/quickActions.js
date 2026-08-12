import { Megaphone, Ticket, UserPlus, Mail, BadgeCheck, ScanLine } from 'lucide-react';
import { PERMISSIONS } from '../permissions';

/**
 * Dashboard quick actions.
 * `status: 'live'` → real module; `planned` → reserved route / Coming Soon placeholder.
 * `permission` is optional UX gating via the existing role matrix.
 */
export const QUICK_ACTIONS = [
  {
    id: 'create-campaign',
    label: 'Create Campaign',
    description: 'Define a new offer and expiry rules',
    href: '/dashboard/campaigns/new',
    icon: Megaphone,
    status: 'live',
    permission: PERMISSIONS.CAMPAIGNS_CREATE,
  },
  {
    id: 'generate-promo-codes',
    label: 'Generate Promo Codes',
    description: 'Issue vouchers to guests',
    href: '/dashboard/promo-codes',
    icon: Ticket,
    status: 'live',
    permission: PERMISSIONS.PROMO_CODES_GENERATE,
  },
  {
    id: 'add-customer',
    label: 'Add Customer',
    description: 'Create a guest profile',
    href: '/dashboard/customers/new',
    icon: UserPlus,
    status: 'live',
    permission: PERMISSIONS.CUSTOMERS_CREATE,
  },
  {
    id: 'create-email-campaign',
    label: 'Create Email Campaign',
    description: 'Schedule a marketing send',
    href: '/dashboard/email-campaigns/new',
    icon: Mail,
    status: 'live',
    permission: PERMISSIONS.EMAIL_CAMPAIGNS_CREATE,
  },
  {
    id: 'redeem-voucher',
    label: 'Redeem Voucher',
    description: 'Scan a QR code or enter a promo code',
    href: '/dashboard/redeem',
    icon: ScanLine,
    status: 'live',
    permission: PERMISSIONS.REDEMPTIONS_REDEEM,
  },
  {
    id: 'view-redemptions',
    label: 'View Redemptions',
    description: 'Review claimed vouchers',
    href: '/dashboard/redemptions',
    icon: BadgeCheck,
    status: 'live',
    permission: PERMISSIONS.REDEMPTIONS_VIEW,
  },
];
