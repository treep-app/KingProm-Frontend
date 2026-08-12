const STYLES = {
  ISSUED: 'bg-sky-50 text-sky-800 ring-sky-200',
  REVEALED: 'bg-amber-50 text-amber-900 ring-amber-200',
  UNUSED: 'bg-sky-50 text-sky-800 ring-sky-200',
  ASSIGNED: 'bg-violet-50 text-violet-800 ring-violet-200',
  REDEEMED: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  EXPIRED: 'bg-slate-100 text-slate-700 ring-slate-200',
  ACTIVE: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  DRAFT: 'bg-slate-100 text-slate-700 ring-slate-200',
  PAUSED: 'bg-amber-50 text-amber-900 ring-amber-200',
  ARCHIVED: 'bg-rose-50 text-rose-800 ring-rose-200',
  // Reserved for future backend statuses — styled, unused until API supports them
  SCHEDULED: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  SENDING: 'bg-sky-50 text-sky-800 ring-sky-200',
  COMPLETED: 'bg-slate-100 text-slate-700 ring-slate-200',
  CANCELLED: 'bg-rose-50 text-rose-800 ring-rose-200',
  FAILED: 'bg-rose-50 text-rose-800 ring-rose-200',
  ERROR: 'bg-rose-50 text-rose-800 ring-rose-200',
  VALID: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  INVALID: 'bg-rose-50 text-rose-800 ring-rose-200',
  default: 'bg-slate-100 text-slate-700 ring-slate-200',
};

const LABELS = {
  ISSUED: 'Issued',
  REVEALED: 'Revealed',
  UNUSED: 'Unused',
  ASSIGNED: 'Assigned',
  REDEEMED: 'Redeemed',
  EXPIRED: 'Expired',
  ACTIVE: 'Active',
  DRAFT: 'Draft',
  PAUSED: 'Paused',
  ARCHIVED: 'Archived',
  SCHEDULED: 'Scheduled',
  SENDING: 'Sending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
  ERROR: 'Error',
  VALID: 'Valid',
  INVALID: 'Invalid',
};

/** Status chip — label text carries meaning; color is supplementary. */
export default function StatusBadge({ status = '' }) {
  const key = String(status || '').toUpperCase();
  const style = STYLES[key] || STYLES.default;
  const label = LABELS[key] || key || 'Unknown';

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${style}`}
    >
      {label}
    </span>
  );
}
