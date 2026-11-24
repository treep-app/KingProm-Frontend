/**
 * Merge signed-in organization + workspace branding API for template previews.
 */

export function workspacePreviewBranding(tenant, workspaceBranding) {
  const displayName =
    workspaceBranding?.businessName ||
    tenant?.name ||
    tenant?.branding?.displayName ||
    '';

  return {
    businessName: displayName,
    displayName,
    name: displayName,
    phone: workspaceBranding?.phone || '',
    email: workspaceBranding?.email || '',
    website: workspaceBranding?.website || tenant?.branding?.guestSiteUrl || '',
    address: workspaceBranding?.address || '',
    emailFooter: workspaceBranding?.emailFooter || '',
    defaultTerms: workspaceBranding?.defaultTerms || '',
    logoUrl: workspaceBranding?.logoUrl || '',
  };
}