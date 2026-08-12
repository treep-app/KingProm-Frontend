'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BrandLogo from '../../../../components/BrandLogo';
import { login } from '../../../../lib/api/admin';
import {
  messageFromApiResult,
  messageFromCaughtError,
} from '../../../../lib/api/errors';
import { PLATFORM } from '../../../../lib/platform';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = await login({ email: email.trim(), password });
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--dash-bg)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <BrandLogo
            size="md"
            variant="light"
            branding={PLATFORM.branding}
            className="!text-[1.75rem]"
          />
          <p className="mt-3 text-sm text-[var(--dash-muted)]">
            Welcome back to {PLATFORM.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="dash-panel space-y-4 p-6" noValidate>
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
