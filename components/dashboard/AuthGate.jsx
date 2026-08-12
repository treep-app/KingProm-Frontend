'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { fetchMe, hasAdminKey } from '../../lib/api/admin';
import { setSession } from '../../lib/auth';
import { createPermissionChecker } from '../../lib/permissions';
import { getCurrentUser } from '../../lib/currentUser';
import EmptyState from './EmptyState';
import DashboardSessionSkeleton from './DashboardSessionSkeleton';
import { Button } from './ui';
import { ShieldOff } from 'lucide-react';

/**
 * Requires a backend-validated session (GET /api/admin/auth/me).
 * Syncs the operator profile/role from the server into session storage.
 *
 * Optional `permission` is UX-only. Real authorization is enforced by the API.
 */
export default function AuthGate({ children, permission = null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      setReady(false);
      setForbidden(false);

      if (!hasAdminKey()) {
        router.replace(`/dashboard/login?next=${encodeURIComponent(pathname || '/dashboard')}`);
        return;
      }

      const { ok, status, data } = await fetchMe();
      if (cancelled) return;

      if (!ok || status === 401) {
        router.replace(`/dashboard/login?next=${encodeURIComponent(pathname || '/dashboard')}`);
        return;
      }

      // Trust backend operator/role/org over any stale client copy
      if (data?.operator) {
        setSession({
          operator: data.operator,
          memberships: data.memberships || [],
          authType: data.authType === 'api_key' ? 'api_key' : 'operator',
        });
      }

      if (permission) {
        const user = {
          ...getCurrentUser(),
          ...(data?.operator || {}),
          role: data?.operator?.role || getCurrentUser()?.role,
        };
        const checker = createPermissionChecker(user);
        if (!checker.can(permission)) {
          setForbidden(true);
          setReady(true);
          return;
        }
      }

      setReady(true);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [router, pathname, permission]);

  if (!ready) {
    return <DashboardSessionSkeleton label="Loading dashboard…" />;
  }

  if (forbidden) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          icon={ShieldOff}
          title="You don’t have access"
          description="Your account is signed in, but this area isn’t available for your role. The server still enforces permissions on every API call."
          action={
            <Button href="/dashboard" variant="secondary">
              Back to dashboard
            </Button>
          }
        />
      </div>
    );
  }

  return children;
}
