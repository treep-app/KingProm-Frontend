'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, X } from 'lucide-react';
import BrandLogo from '../BrandLogo';
import { DASHBOARD_NAV_GROUPS } from '../../lib/dashboard/nav';
import { logout } from '../../lib/api/admin';
import { ROUTE_PERMISSIONS } from '../../lib/permissions';
import { PLATFORM } from '../../lib/platform';
import { useWorkspace } from './WorkspaceProvider';

const PREFETCH_HREFS = new Set([
  '/dashboard',
  '/dashboard/campaigns',
  '/dashboard/customers',
  '/dashboard/promo-codes',
  '/dashboard/redemptions',
  '/dashboard/analytics',
]);

function NavItem({ item, onNavigate }) {
  const pathname = usePathname();
  const active = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  const planned = item.status === 'planned';
  const shouldPrefetch = PREFETCH_HREFS.has(item.href);

  return (
    <Link
      href={item.href}
      prefetch={shouldPrefetch}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)] focus-visible:ring-offset-2 lg:min-h-10 lg:rounded-lg lg:py-2 lg:text-[13.5px] ${
        active
          ? 'bg-[var(--dash-nav-active)] text-[var(--dash-ink)] shadow-[inset_3px_0_0_0_var(--dash-accent)]'
          : 'text-[var(--dash-muted)] hover:bg-[var(--dash-surface-2)] hover:text-[var(--dash-ink)]'
      }`}
    >
      <Icon
        className={`size-[18px] shrink-0 ${
          active
            ? 'text-[var(--dash-accent)]'
            : 'text-[var(--dash-muted)] group-hover:text-[var(--dash-ink-soft)]'
        }`}
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="flex-1 truncate">{item.label}</span>
      {planned ? (
        <span className="rounded bg-[var(--dash-surface-2)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
          Soon
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Permanent sidebar from lg up; slide-over drawer on mobile/tablet.
 */
export default function DashboardSidebar({ open = false, onClose }) {
  const router = useRouter();
  const { tenant, user, canAccessRoute } = useWorkspace();

  function handleLogout() {
    logout();
    onClose?.();
    router.replace('/dashboard/login');
  }

  // UX filter only — APIs still authorize every request.
  const navGroups = DASHBOARD_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (!ROUTE_PERMISSIONS[item.href]) return true;
      return canAccessRoute(item.href);
    }),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-[2px] transition lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        id="dashboard-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw,20rem)] flex-col border-r border-[var(--dash-border)] bg-[var(--dash-sidebar)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] transition-transform duration-200 ease-out lg:static lg:w-[260px] lg:translate-x-0 lg:pt-0 lg:pb-0 ${
          open ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'
        }`}
        aria-label="Primary"
      >
        <div className="flex h-14 min-h-14 items-center justify-between gap-3 border-b border-[var(--dash-border)] px-4">
          <Link
            href="/dashboard"
            className="min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)] focus-visible:ring-offset-2"
            onClick={onClose}
            aria-label={`${PLATFORM.name} dashboard home`}
          >
            <BrandLogo
              size="sm"
              variant="light"
              branding={PLATFORM.branding}
              className="!text-[1.35rem]"
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-11 items-center justify-center rounded-xl text-[var(--dash-muted)] hover:bg-[var(--dash-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)] focus-visible:ring-offset-2 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="border-b border-[var(--dash-border)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dash-muted)]">
            Business
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-[var(--dash-ink)]">{tenant.name}</p>
          <p className="truncate text-xs text-[var(--dash-muted)]">
            on {PLATFORM.name}
          </p>
        </div>

        <nav
          className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 py-4 [-webkit-overflow-scrolling:touch]"
          aria-label="Dashboard"
        >
          {navGroups.map((group) => (
            <div key={group.id} role="group" aria-labelledby={`nav-group-${group.id}`}>
              {group.label ? (
                <p
                  id={`nav-group-${group.id}`}
                  className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dash-muted)]"
                >
                  {group.label}
                </p>
              ) : null}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.href} item={item} onNavigate={onClose} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-3 border-t border-[var(--dash-border)] p-4">
          {user?.isAuthenticated ? (
            <div>
              <p className="truncate text-xs font-semibold text-[var(--dash-ink)]">
                {user.name || 'Operator'}
              </p>
              {user.email ? (
                <p className="truncate text-[11px] text-[var(--dash-muted)]">{user.email}</p>
              ) : null}
            </div>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left text-sm font-medium text-[var(--dash-muted)] transition hover:bg-[var(--dash-surface-2)] hover:text-[var(--dash-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)] focus-visible:ring-offset-2 lg:min-h-10 lg:rounded-lg lg:text-xs"
          >
            <LogOut className="size-3.5" aria-hidden />
            Sign out
          </button>
          <Link
            href="/"
            className="block min-h-10 rounded-md py-2 text-xs font-medium text-[var(--dash-muted)] transition hover:text-[var(--dash-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)] focus-visible:ring-offset-2"
            onClick={onClose}
          >
            ← Guest promo site
          </Link>
        </div>
      </aside>
    </>
  );
}
