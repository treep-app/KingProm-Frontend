'use client';

import { useCallback, useEffect, useState } from 'react';
import { hasAdminKey } from '../../lib/api/client';
import * as teamService from '../../lib/api/teamService';
import { messageFromApiResult } from '../../lib/api/errors';
import { ORG_ROLE_OPTIONS, PERMISSIONS } from '../../lib/permissions';
import { formatDateTime } from '../../lib/format';
import { DASH_SELECT_COMPACT_CLASS } from '../../lib/dashboard/styles';
import AlertBanner from './AlertBanner';
import AuthGate from './AuthGate';
import {
  Button,
  DataTable,
  EmptyState,
  LoadingState,
  PageContainer,
  PageHeader,
  useCan,
} from './ui';

function TeamManagerInner() {
  const can = useCan();
  const canManage = can(PERMISSIONS.TEAM_WRITE) || can('*');
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('operator');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const reload = useCallback(async () => {
    if (!hasAdminKey()) {
      setLoading(false);
      setError('Sign in required.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await teamService.listTeam();
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to load team.'));
      setMembers([]);
      setInvitations([]);
    } else {
      setMembers(result.data.members || []);
      setInvitations(result.data.invitations || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleInvite(event) {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    setError('');
    const result = await teamService.inviteMember({ email, role });
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to send invitation.'));
    } else {
      setNotice(
        result.data.email?.sent
          ? `Invitation sent to ${email}.`
          : `Invitation created for ${email}. Share the accept link if email is disabled.`,
      );
      setEmail('');
      await reload();
    }
    setBusy(false);
  }

  async function handleRoleChange(operatorId, nextRole) {
    setBusy(true);
    setError('');
    const result = await teamService.changeMemberRole(operatorId, nextRole);
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to change role.'));
    } else {
      await reload();
    }
    setBusy(false);
  }

  async function handleRemove(operatorId) {
    if (!window.confirm('Remove this team member?')) return;
    setBusy(true);
    const result = await teamService.removeMember(operatorId);
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to remove member.'));
    } else {
      await reload();
    }
    setBusy(false);
  }

  async function handleRevoke(invitationId) {
    setBusy(true);
    const result = await teamService.revokeInvitation(invitationId);
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to revoke invitation.'));
    } else {
      await reload();
    }
    setBusy(false);
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      cell: (row) => (
        <div>
          <p className="font-medium text-[var(--dash-ink)]">{row.name || '—'}</p>
          <p className="text-xs text-[var(--dash-muted)]">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (row) =>
        canManage && row.role !== 'owner' ? (
          <select
            className={DASH_SELECT_COMPACT_CLASS}
            value={row.role}
            disabled={busy}
            onChange={(e) => handleRoleChange(row.operatorId, e.target.value)}
          >
            {ORG_ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="capitalize">{row.role}</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <span className="capitalize">{row.status.toLowerCase()}</span>,
    },
    {
      key: 'lastLogin',
      header: 'Last login',
      cell: (row) => (
        <span className="text-[var(--dash-muted)]">
          {row.lastLoginAt ? formatDateTime(row.lastLoginAt) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (row) =>
        canManage && row.role !== 'owner' ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => handleRemove(row.operatorId)}
          >
            Remove
          </Button>
        ) : null,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Team"
        description="Invite colleagues and manage organization roles."
      />

      {error ? <AlertBanner>{error}</AlertBanner> : null}
      {notice ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}

      {canManage ? (
        <form onSubmit={handleInvite} className="dash-panel grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
              Email
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--dash-accent)]"
              placeholder="colleague@hotel.com"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
              Role
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={DASH_SELECT_COMPACT_CLASS}
            >
              {ORG_ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={busy || !email.trim()}>
            {busy ? 'Sending…' : 'Invite user'}
          </Button>
        </form>
      ) : null}

      {loading ? (
        <LoadingState rows={4} label="Loading team…" />
      ) : members.length === 0 ? (
        <EmptyState
          title="Invite your team to collaborate."
          description="Add marketers, reception staff, and managers for this business."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={members}
          minWidth="720px"
          mobileCard={(row) => (
            <div>
              <p className="font-medium text-[var(--dash-ink)]">{row.name || row.email}</p>
              <p className="mt-1 text-xs text-[var(--dash-muted)]">
                {row.role} · {row.status}
              </p>
            </div>
          )}
        />
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Pending invitations</h2>
        {invitations.length === 0 ? (
          <p className="text-sm text-[var(--dash-muted)]">No pending invitations.</p>
        ) : (
          <div className="dash-panel divide-y divide-[var(--dash-border)]">
            {invitations.map((invite) => (
              <div
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[var(--dash-ink)]">{invite.email}</p>
                  <p className="text-xs text-[var(--dash-muted)]">
                    {invite.role} · expires {formatDateTime(invite.expiresAt)}
                  </p>
                </div>
                {canManage ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => handleRevoke(invite.id)}
                  >
                    Revoke
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
}

export default function TeamManager() {
  return (
    <AuthGate permission={PERMISSIONS.TEAM_READ}>
      <TeamManagerInner />
    </AuthGate>
  );
}
