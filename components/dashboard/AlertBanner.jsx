import Link from 'next/link';
import { alertPropsFromApiResult } from '../../lib/api/errors';
import { DASH_ALERT_CLASS } from '../../lib/dashboard/styles';

export default function AlertBanner({
  children,
  href = null,
  linkLabel = null,
  className = '',
}) {
  return (
    <div className={[DASH_ALERT_CLASS, className].filter(Boolean).join(' ')} role="status">
      {children}
      {href && linkLabel ? (
        <>
          {' '}
          <Link href={href} className="font-semibold underline underline-offset-2">
            {linkLabel}
          </Link>
        </>
      ) : null}
    </div>
  );
}

/**
 * Banner driven by a normalized API result — sign-in link only for 401.
 */
export function ApiErrorBanner({ result, message, fallback = 'Something went wrong.' }) {
  const alert = alertPropsFromApiResult(result, fallback);
  return (
    <AlertBanner href={alert.href} linkLabel={alert.linkLabel}>
      {message || alert.message}
    </AlertBanner>
  );
}
