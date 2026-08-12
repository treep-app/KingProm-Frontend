import Link from 'next/link';
import { breadcrumbForPath } from '../../../lib/dashboard/nav';

/**
 * Reusable breadcrumb trail. Uses dashboard nav IA by default.
 */
export default function Breadcrumbs({
  pathname = '/dashboard',
  crumbs: crumbsProp = null,
  className = '',
}) {
  const crumbs = crumbsProp || breadcrumbForPath(pathname);

  return (
    <nav
      aria-label="Breadcrumb"
      className={['flex items-center gap-1.5 text-xs text-[var(--dash-muted)]', className]
        .filter(Boolean)
        .join(' ')}
    >
      {crumbs.map((crumb, index) => {
        const last = index === crumbs.length - 1;
        return (
          <span key={`${crumb.href}-${crumb.label}`} className="flex min-w-0 items-center gap-1.5">
            {index > 0 ? <span aria-hidden>/</span> : null}
            {last ? (
              <span className="truncate font-medium text-[var(--dash-ink-soft)]">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="truncate hover:text-[var(--dash-ink)]">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
