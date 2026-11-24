'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import PlatformLogo from '../../../../components/PlatformLogo';
import { login } from '../../../../lib/api/admin';
import { setSession } from '../../../../lib/api/client';
import {
  messageFromApiResult,
  messageFromCaughtError,
} from '../../../../lib/api/errors';
import { PLATFORM } from '../../../../lib/platform';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const [step, setStep] = useState('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [memberships, setMemberships] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function completeLogin(organizationId) {
    setSubmitting(true);
    setError('');
    try {
      const result = await login({
        email: email.trim(),
        password,
        organizationId,
        commitSession: true,
      });
      if (!result.ok) {
        setError(
          messageFromApiResult(result, 'Unable to sign in. Check your email and password.'),
        );
        return;
      }
      router.replace(next.startsWith('/dashboard') ? next : '/dashboard');
    } catch (err) {
      setError(
        messageFromCaughtError(err, 'Network error. Check your connection and try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCredentialsSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = await login({
        email: email.trim(),
        password,
        commitSession: false,
      });
      if (!result.ok) {
        setError(
          messageFromApiResult(result, 'Unable to sign in. Check your email and password.'),
        );
        return;
      }

      const list = result.data?.memberships || [];
      if (list.length > 1) {
        setMemberships(list);
        setStep('organization');
        return;
      }

      if (result.data?.token) {
        setSession({
          token: result.data.token,
          operator: result.data.operator,
          memberships: list,
          authType: 'operator',
        });
      }
      router.replace(next.startsWith('/dashboard') ? next : '/dashboard');
    } catch (err) {
      setError(
        messageFromCaughtError(err, 'Network error. Check your connection and try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleBackToCredentials() {
    setStep('credentials');
    setMemberships([]);
    setError('');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--dash-bg)] px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--dash-muted)] transition hover:text-[var(--dash-ink)]"
        >
          <span aria-hidden>←</span>
          Back to home
        </Link>

        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex justify-center" aria-label={`${PLATFORM.name} home`}>
            <PlatformLogo size="md" priority />
          </Link>
          <p className="mt-3 text-sm text-[var(--dash-muted)]">
            Welcome back to {PLATFORM.name}
          </p>
        </div>

        {step === 'organization' ? (
          <div className="dash-panel space-y-4 p-6">
            <div>
              <h1 className="text-lg font-semibold text-[var(--dash-ink)]">Choose workspace</h1>
              <p className="mt-1 text-sm text-[var(--dash-muted)]">
                This account belongs to more than one business. Select where to sign in.
              </p>
            </div>

            {error ? (
              <div
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <ul className="space-y-2">
              {memberships.map((m) => (
                <li key={m.organizationId}>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => completeLogin(m.organizationId)}
                    className="flex w-full items-center justify-between rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-4 py-3 text-left transition hover:border-[var(--dash-accent)] hover:bg-[var(--dash-surface)] disabled:opacity-50"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-[var(--dash-ink)]">
                        {m.name || 'Workspace'}
                      </span>
                      <span className="text-xs capitalize text-[var(--dash-muted)]">
                        {m.role || 'member'}
                      </span>
                    </span>
                    <span className="text-xs text-[var(--dash-muted)]">→</span>
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={handleBackToCredentials}
              className="w-full text-center text-sm text-[var(--dash-muted)] hover:text-[var(--dash-ink)]"
            >
              ← Use a different account
            </button>
          </div>
        ) : (
          <form onSubmit={handleCredentialsSubmit} className="dash-panel space-y-4 p-6" noValidate>
            <div>
              <h1 className="text-lg font-semibold text-[var(--dash-ink)]">Sign in</h1>
              <p className="mt-1 text-sm text-[var(--dash-muted)]">
                Operator accounts are separate from guest ticket links.
              </p>
            </div>

            {error ? (
              <div
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Email</span>
              <input
                required
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--dash-accent)]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                Password
              </span>
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--dash-accent)]"
              />
            </label>

            <button type="submit" disabled={submitting} className="dash-btn-primary w-full disabled:opacity-50">
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="text-center text-sm text-[var(--dash-muted)]">
              New to {PLATFORM.name}?{' '}
              <a
                href="/signup"
                className="font-medium text-[var(--dash-navy)] underline-offset-2 hover:underline"
              >
                Create a free account
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-[var(--dash-muted)]">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}