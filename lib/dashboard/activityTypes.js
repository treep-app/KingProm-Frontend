import {
  Ticket,
  BadgeCheck,
  Megaphone,
  Mail,
  TimerOff,
  Settings,
  UserPlus,
  Activity,
} from 'lucide-react';

/**
 * Shared activity / audit event type registry.
 * Used by Recent Activity and (later) Audit Log.
 */
export const ACTIVITY_TYPES = {
  PROMO_CODES_CREATED: {
    label: 'Promo codes created',
    icon: Ticket,
    tone: 'accent',
  },
  VOUCHER_REDEEMED: {
    label: 'Voucher redeemed',
    icon: BadgeCheck,
    tone: 'success',
  },
  CAMPAIGN_CREATED: {
    label: 'Campaign created',
    icon: Megaphone,
    tone: 'accent',
  },
  EMAIL_CAMPAIGN_SCHEDULED: {
    label: 'Email scheduled',
    icon: Mail,
    tone: 'accent',
  },
  CAMPAIGN_EXPIRED: {
    label: 'Campaign expired',
    icon: TimerOff,
    tone: 'warning',
  },
  SETTINGS_UPDATED: {
    label: 'Settings updated',
    icon: Settings,
    tone: 'neutral',
  },
  TEAM_MEMBER_ADDED: {
    label: 'Team member added',
    icon: UserPlus,
    tone: 'neutral',
  },
};

export function getActivityTypeMeta(type) {
  return (
    ACTIVITY_TYPES[type] || {
      label: 'Activity',
      icon: Activity,
      tone: 'neutral',
    }
  );
}

export const ACTIVITY_TONE_CLASSES = {
  accent: 'bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
  neutral: 'bg-[var(--dash-surface-2)] text-[var(--dash-ink-soft)]',
};
