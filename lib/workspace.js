import { getCurrentTenant, getTenantBranding } from './tenant';
import { getCurrentUser } from './currentUser';
import { createPermissionChecker } from './permissions';

/**
 * Single workspace snapshot for the active tenant + signed-in user.
 * Prefer WorkspaceProvider / useWorkspace() in React trees.
 */
export function getWorkspace() {
  const tenant = getCurrentTenant();
  const user = getCurrentUser();
  const branding = getTenantBranding(tenant);
  const permissions = createPermissionChecker(user);

  return {
    tenant,
    user,
    branding,
    permissions,
    can: permissions.can.bind(permissions),
  };
}
