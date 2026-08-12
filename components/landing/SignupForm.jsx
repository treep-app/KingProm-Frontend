'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BrandLogo from '../BrandLogo';
import LandingAuthRedirect from './LandingAuthRedirect';
import { signup } from '../../lib/api/admin';
import {
  messageFromApiResult,
  messageFromCaughtError,
} from '../../lib/api/errors';
import { PLATFORM } from '../../lib/platform';

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        organizationName: organizationName.trim(),
      });
      if (!result.ok) {
        setError(
          messageFromApiResult(
            result,
            'Unable to create your account. Check the form and try again.',
          ),
        );
        return;
      }
      router.replace('/dashboard');
    } catch (err) {
      setError(
        messageFromCaughtError(err, 'Network error. Check your connection and try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[var(--dash-bg)] text-[var(--dash-ink)]">
      <LandingAuthRedirect />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[var(--dash-muted)] transition hover:text-[var(--dash-ink)]"
        >
          <span aria-hidden>←</span>
          Back to home
        </Link>

        <Link href="/" className="inline-flex w-fit" aria-label={`${PLATFORM.name} home`}>
          <BrandLogo size="md" branding={PLATFORM.branding} variant="light" />
        </Link>

        <form onSubmit={handleSubmit} className="dash-panel mt-8 space-y-4 p-6" noValidate>
          <div>
            <h1 className="text-lg font-semibold text-[var(--dash-ink)]">Create your account</h1>
            <p className="mt-1 text-sm text-[var(--dash-muted)]">
              Start on the Free plan — campaigns, vouchers, customers, and QR redemption.
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
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
              Your name
            </span>
            <input
              required
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--dash-accent)]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
              Business name
            </span>
            <input
              required
              type="text"
              autoComplete="organization"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--dash-accent)]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Email</span>
            <input
              required
              type="email"
              autoComplete="email"
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
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--dash-accent)]"
            />
            <span className="mt-1 block text-xs text-[var(--dash-muted)]">At least 8 characters</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="dash-btn-primary w-full disabled:opacity-50"
          >
            {submitting ? 'Creating account…' : 'Start Free'}
          </button>

          <p className="text-center text-sm text-[var(--dash-muted)]">
            Already have an account?{' '}
            <Link
              href="/dashboard/login"
              className="font-medium text-[var(--dash-navy)] underline-offset-2 hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
