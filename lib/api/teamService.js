import { adminFetch, adminHeaders, omitClientTenantOverrides } from './client';

/** GET /api/admin/team */
export async function listTeam() {
  return adminFetch('/api/admin/team', {
    headers: adminHeaders(),
    cache: 'no-store',
  });
}

/** POST /api/admin/team/invitations */
export async function inviteMember({ email, role = 'operator' } = {}) {
  const body = omitClientTenantOverrides({ email, role });
  return adminFetch('/api/admin/team/invitations', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(body),
  });
}

/** DELETE /api/admin/team/invitations/:id */
export async function revokeInvitation(invitationId) {
  return adminFetch(
    `/api/admin/team/invitations/${encodeURIComponent(invitationId)}`,
    {
      method: 'DELETE',
      headers: adminHeaders(),
    },
  );
}

/** PATCH /api/admin/team/members/:operatorId */
export async function changeMemberRole(operatorId, role) {
  return adminFetch(`/api/admin/team/members/${encodeURIComponent(operatorId)}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify({ role }),
  });
}

/** DELETE /api/admin/team/members/:operatorId */
export async function removeMember(operatorId) {
  return adminFetch(`/api/admin/team/members/${encodeURIComponent(operatorId)}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
}

/** POST /api/admin/invitations/accept (public) */
export async function acceptInvitation({ token, name, password } = {}) {
  return adminFetch('/api/admin/invitations/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, name, password }),
  });
}
