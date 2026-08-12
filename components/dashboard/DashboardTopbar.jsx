'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Building2, ChevronDown, Menu } from 'lucide-react';
import { logout } from '../../lib/api/admin';
import * as organizationService from '../../lib/api/organizationService';
import { setSession } from '../../lib/auth';
import Breadcrumbs from './ui/Breadcrumbs';
import { useWorkspace } from './WorkspaceProvider';

export default function DashboardTopbar({ title, pathname, navOpen = false, onMenuClick }) {
  const router = useRouter();
  const { tenant, user, memberships = [] } = useWorkspace();
  const [menuOpen, setMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const menuRef = useRef(null);
  const menuId = useId();

  const initials =
    (user?.name || user?.email || tenant.name)
      .split(/\s+|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'WS';

  useEffect(() => {
    function onDocClick(event) {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    }
    function onKey(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  function handleLogout() {
    logout();
    router.replace('/dashboard/login');
  }

  async function handleSwitch(organizationId) {
    if (!organizationId || organizationId === user?.tenantId) {
      setMenuOpen(false);
      return;
    }
    setSwitching(true);
    const result = await organizationService.switchOrganization(organizationId);
    if (result.ok && result.data?.token) {
      setSession({
        token: result.data.token,
        operator: result.data.operator,
        memberships: result.data.memberships || [],
        authType: 'operator',
      });
      setMenuOpen(false);
      router.refresh();
      window.location.href = '/dashboard';
      return;
    }
    setSwitching(false);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--dash-border)] bg-[color-mix(in_srgb,var(--dash-bg)_92%,white)] pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex min-h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-[var(--dash-muted)] hover:bg-[var(--dash-surface)] hover:text-[var(--dash-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)] focus-visible:ring-offset-2 lg:hidden"
          aria-label="Open navigation"
          aria-controls="dashboard-sidebar"
          aria-expanded={navOpen}
        >
          <Menu className="size-5" aria-hidden />
        </button>

        <div className="min-w-0 flex-1">
          <Breadcrumbs
            pathname={pathname || '/dashboard'}
            className="mb-0.5 hidden md:flex"
          />
          <p className="truncate text-[15px] font-semibold tracking-tight text-[var(--dash-ink)] sm:text-base lg:text-[17px]">
            {title}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
          <button
            type="button"
            className="relative hidden size-11 items-center justify-center rounded-xl text-[var(--dash-muted)] hover:bg-[var(--dash-surface)] hover:text-[var(--dash-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)] focus-visible:ring-offset-2 sm:inline-flex"
            aria-label="Notifications (coming soon)"
            title="Notifications coming soon"
            disabled
          >
            <Bell className="size-[18px]" strokeWidth={1.75} aria-hidden />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl px-1 hover:bg-[var(--dash-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)] focus-visible:ring-offset-2 sm:min-h-10 sm:px-2"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label="Organization and account menu"
            >
              <span
                className="flex size-9 items-center justify-center rounded-full bg-[var(--dash-navy)] text-xs font-semibold text-white sm:size-8"
                aria-hidden
              >
                {initials}
              </span>
              <span className="hidden max-w-[10rem] truncate text-left text-xs md:block">
                <span className="block font-semibold text-[var(--dash-ink)]">{tenant.name}</span>
                <span className="block truncate text-[var(--dash-muted)]">
                  {user?.name || user?.email || 'Account'}
                </span>
              </span>
              <ChevronDown className="hidden size-3.5 text-[var(--dash-muted)] md:block" aria-hidden />
            </button>

            {menuOpen ? (
              <div
                id={menuId}
                role="menu"
                className="absolute right-0 mt-1.5 w-[min(calc(100vw-1.5rem),17rem)] overflow-hidden rounded-xl border border-[var(--dash-border)] bg-white py-1 shadow-lg"
              >
                <div className="border-b border-[var(--dash-border)] px-3 py-2.5">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-[var(--dash-ink)]">
                    <Building2 className="size-3.5 shrink-0" aria-hidden />
                    {tenant.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-[var(--dash-muted)]">
                    {user?.email || 'Signed in'} · {user?.role || 'member'}
                  </p>
                </div>

                {memberships.length > 1 ? (
                  <div className="border-b border-[var(--dash-border)] py-1">
                    <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
                      Switch business
                    </p>
                    {memberships.map((m) => (
                      <button
                        key={m.organizationId}
                        type="button"
                        role="menuitem"
                        disabled={switching}
                        className="block w-full px-3 py-2.5 text-left text-sm text-[var(--dash-ink-soft)] hover:bg-[var(--dash-surface-2)] disabled:opacity-50"
                        onClick={() => handleSwitch(m.organizationId)}
                      >
                        {m.name}
                        {m.organizationId === user?.tenantId ? (
                          <span className="ml-2 text-[10px] font-semibold uppercase text-emerald-700">
                            Current
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}

                <Link
                  role="menuitem"
                  href="/dashboard/settings/business"
                  className="block px-3 py-3 text-sm text-[var(--dash-ink-soft)] hover:bg-[var(--dash-surface-2)]"
                  onClick={() => setMenuOpen(false)}
                >
                  Business settings
                </Link>
                <Link
                  role="menuitem"
                  href="/dashboard/team"
                  className="block px-3 py-3 text-sm text-[var(--dash-ink-soft)] hover:bg-[var(--dash-surface-2)]"
                  onClick={() => setMenuOpen(false)}
                >
                  Users
                </Link>
                <Link
                  role="menuitem"
                  href="/dashboard/branding"
                  className="block px-3 py-3 text-sm text-[var(--dash-ink-soft)] hover:bg-[var(--dash-surface-2)]"
                  onClick={() => setMenuOpen(false)}
                >
                  Branding
                </Link>
                <Link
                  role="menuitem"
                  href="/dashboard/settings"
                  className="block px-3 py-3 text-sm text-[var(--dash-ink-soft)] hover:bg-[var(--dash-surface-2)]"
                  onClick={() => setMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-3 py-3 text-left text-sm text-[var(--dash-ink-soft)] hover:bg-[var(--dash-surface-2)]"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
