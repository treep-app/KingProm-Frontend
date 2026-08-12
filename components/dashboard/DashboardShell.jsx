'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopbar from './DashboardTopbar';
import { matchNavItem } from '../../lib/dashboard/nav';

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const navItem = matchNavItem(pathname);
  const title = navItem?.label || 'Dashboard';

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(event) {
      if (event.key === 'Escape') setNavOpen(false);
    }
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [navOpen]);

  return (
    <div className="dashboard-shell flex min-h-dvh min-w-0 overflow-x-hidden bg-[var(--dash-bg)] text-[var(--dash-ink)]">
      <a href="#main-content" className="dash-skip-link">
        Skip to main content
      </a>
      <DashboardSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          title={title}
          pathname={pathname}
          navOpen={navOpen}
          onMenuClick={() => setNavOpen(true)}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="dash-main min-w-0 flex-1 overflow-x-hidden px-3 py-4 outline-none sm:px-5 sm:py-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
