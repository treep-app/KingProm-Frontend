'use client';

import { usePathname } from 'next/navigation';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import { ToastProvider } from '../../../components/dashboard/ToastProvider';
import AuthGate from '../../../components/dashboard/AuthGate';
import { WorkspaceProvider } from '../../../components/dashboard/WorkspaceProvider';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const isPublic =
    pathname === '/dashboard/login' || pathname === '/dashboard/invite';

  if (isPublic) {
    return (
      <WorkspaceProvider>
        <ToastProvider>{children}</ToastProvider>
      </WorkspaceProvider>
    );
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
