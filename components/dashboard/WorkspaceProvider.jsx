'use client';

import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import {
  getCurrentTenant,
  getTenantBranding,
  resolveWordmark,
} from '../../lib/tenant';
import { getCurrentUser } from '../../lib/currentUser';
import { createPermissionChecker } from '../../lib/permissions';
import { SESSION_CHANGED_EVENT } from '../../lib/auth';

const WorkspaceContext = createContext(null);

function subscribeToSession(onStoreChange) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => onStoreChange();
  window.addEventListener('storage', handler);
  window.addEventListener(SESSION_CHANGED_EVENT, handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(SESSION_CHANGED_EVENT, handler);
  };
}

function readUserSnapshot() {
  return JSON.stringify(getCurrentUser());
}

function getServerUserSnapshot() {
  return JSON.stringify({
    id: null,
    email: '',
    name: 'Guest',
    role: 'anonymous',
    authType: 'anonymous',
    isAuthenticated: false,
  });
}

/**
 * Provides tenant, user, branding, and permission helpers to the dashboard tree.
 *
 * `can()` is for progressive UX only. Backend authz is authoritative.
 * `tenant` is branding/workspace display context — never send tenant.id as an
 * API scope parameter. Data isolation must be enforced by the backend session.
 */
export function WorkspaceProvider({ children }) {
  const userJson = useSyncExternalStore(
    subscribeToSession,
    readUserSnapshot,
    getServerUserSnapshot,
  );

  const value = useMemo(() => {
    const catalogTenant = getCurrentTenant();
    const user = JSON.parse(userJson);
    const org = user.organization;
    const displayName = org?.name || catalogTenant.branding.displayName;
    const wordmark = resolveWordmark(displayName, catalogTenant.branding);
    const tenant = org
      ? {
          ...catalogTenant,
          id: org.slug || org.id || catalogTenant.id,
          name: org.name || catalogTenant.name,
          slug: org.slug || catalogTenant.slug,
          plan: org.subscriptionPlan || catalogTenant.plan,
          organizationId: org.id,
          industry: org.industry,
          status: org.status,
          branding: {
            ...catalogTenant.branding,
            displayName,
            wordmarkPrimary: wordmark.wordmarkPrimary,
            wordmarkAccent: wordmark.wordmarkAccent,
          },
        }
      : catalogTenant;
    const branding = getTenantBranding(tenant);
    const permissions = createPermissionChecker(user);
    return {
      tenant,
      organization: org,
      memberships: user.memberships || [],
      user,
      branding,
      permissions,
      can: (permission) => permissions.can(permission),
      canAccessRoute: (pathname) => permissions.canAccessRoute(pathname),
    };
  }, [userJson]);

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    const tenant = getCurrentTenant();
    const user = getCurrentUser();
    const branding = getTenantBranding(tenant);
    const permissions = createPermissionChecker(user);
    return {
      tenant,
      organization: user.organization || null,
      memberships: user.memberships || [],
      user,
      branding,
      permissions,
      can: (permission) => permissions.can(permission),
      canAccessRoute: (pathname) => permissions.canAccessRoute(pathname),
    };
  }
  return ctx;
}

export function useTenant() {
  return useWorkspace().tenant;
}

export function useCurrentUser() {
  return useWorkspace().user;
}

export function useBranding() {
  return useWorkspace().branding;
}

export function useCan() {
  return useWorkspace().can;
}

/** Campaign action capabilities from the existing role → permission matrix. */
export function useCampaignPermissions() {
  const { permissions } = useWorkspace();
  return permissions.campaigns;
}

/** Promo-code action capabilities from the existing role → permission matrix. */
export function usePromoCodePermissions() {
  const { permissions } = useWorkspace();
  return permissions.promoCodes;
}

/** Customer action capabilities from the existing role → permission matrix. */
export function useCustomerPermissions() {
  const { permissions } = useWorkspace();
  return permissions.customers;
}

/** Template action capabilities from the existing role → permission matrix. */
export function useTemplatePermissions() {
  const { permissions } = useWorkspace();
  return permissions.templates;
}

/** Branding action capabilities from the existing role → permission matrix. */
export function useBrandingPermissions() {
  const { permissions } = useWorkspace();
  return permissions.branding;
}

/** Email-campaign action capabilities from the existing role → permission matrix. */
export function useEmailCampaignPermissions() {
  const { permissions } = useWorkspace();
  return permissions.emailCampaigns;
}

/** Redemption action capabilities from the existing role → permission matrix. */
export function useRedemptionPermissions() {
  const { permissions } = useWorkspace();
  return permissions.redemptions;
}
