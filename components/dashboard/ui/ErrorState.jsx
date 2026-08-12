import { AlertCircle } from 'lucide-react';

/**
 * Consistent error panel for failed dashboard fetches.
 */
export default function ErrorState({
  title = 'Something went wrong',
  message = 'Unable to load this section.',
  action = null,
  className = '',
}) {
  return (
    <div
      className={[
        'dash-panel flex flex-col items-center px-6 py-12 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="alert"
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-200">
        <AlertCircle className="size-5" strokeWidth={1.75} />
      </div>
      <h3 className="text-base font-semibold text-[var(--dash-ink)]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--dash-muted)]">{message}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
