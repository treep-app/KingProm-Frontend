'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PlatformLogo from '../../../../components/PlatformLogo';
import { acceptInvitation } from '../../../../lib/api/teamService';
import { setSession } from '../../../../lib/auth';
import {
  messageFromApiResult,
  messageFromCaughtError,
} from '../../../../lib/api/errors';
import { PLATFORM } from '../../../../lib/platform';

function InviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!token) {
      setError('Invitation token is missing.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await acceptInvitation({ token, name, password });
      if (!result.ok) {
        setError(messageFromApiResult(result, 'Unable to accept invitation.'));
        return;
      }
      setSession({
        token: result.data.token,
        operator: result.data.operator,
        memberships: result.data.memberships || [
          {
            organizationId: result.data.organization?.id,
            name: result.data.organization?.name,
            slug: result.data.organization?.slug,
            role: result.data.operator?.role,
            status: result.data.organization?.status,
          },
        ],
        authType: 'operator',
      });
      router.replace('/dashboard');
    } catch (err) {
      setError(messageFromCaughtError(err, 'Network error. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--dash-bg)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex justify-center">
            <PlatformLogo size="md" priority />
          </div>
          <p className="mt-3 text-sm text-[var(--dash-muted)]">
            Accept your {PLATFORM.name} team invitation
          </p>
        </div>
        <form onSubmit={handleSubmit} className="dash-panel space-y-4 p-6">
          <div>
            <h1 className="text-lg font-semibold text-[var(--dash-ink)]">Join organization</h1>
            <p className="mt-1 text-sm text-[var(--dash-muted)]">
              Create your password to join this KingProm workspace.
            </p>
          </div>
          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
              {error}
            </div>
          ) : null}
          {!token ? (
            <p className="text-sm text-rose-700">This invite link is invalid.</p>
          ) : null}
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
              Password
            </span>
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={submitting || !token}
            className="dash-btn-primary w-full disabled:opacity-50"
          >
            {submitting ? 'Joining…' : 'Accept invitation'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-[var(--dash-muted)]">
          Loading…
        </div>
      }
    >
      <InviteForm />
    </Suspense>
  );
}
