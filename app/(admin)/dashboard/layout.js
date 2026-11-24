'use client';

import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import { ToastProvider } from '../../../components/dashboard/ToastProvider';
import AuthGate from '../../../components/dashboard/AuthGate';
import GuestVoucherLinkRedirect from '../../../components/dashboard/GuestVoucherLinkRedirect';
import { WorkspaceProvider } from '../../../components/dashboard/WorkspaceProvider';
import { hasAdminKey } from '../../../lib/api/client';
import TicketLoadingPlaceholder from '../../../components/TicketLoadingPlaceholder';

function DashboardLayoutInner({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLoginOrInvite =
    pathname === '/dashboard/login' || pathname === '/dashboard/invite';

  const hasGuestVoucherQuery =
    Boolean(searchParams.get('v')) || Boolean(searchParams.get('token'));

  const isLegacyGuestRedeemLink =
    pathname === '/dashboard/redeem' && !hasAdminKey() && hasGuestVoucherQuery;

  if (isLoginOrInvite) {
    return (
      <WorkspaceProvider>
        <ToastProvider>{children}</ToastProvider>
      </WorkspaceProvider>
    );
  }

  if (isLegacyGuestRedeemLink) {
    return <GuestVoucherLinkRedirect />;
  }

  return (
    <WorkspaceProvider>
      <ToastProvider>
        <AuthGate>
          <DashboardShell>{children}</DashboardShell>
        </AuthGate>
      </ToastProvider>
    </WorkspaceProvider>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <Suspense fallback={<TicketLoadingPlaceholder message="Loading workspace…" />}>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}