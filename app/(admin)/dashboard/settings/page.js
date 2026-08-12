'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  PageContainer,
  PageHeader,
} from '../../../../components/dashboard/ui';
import { useWorkspace } from '../../../../components/dashboard/WorkspaceProvider';
import { fetchMe, logout } from '../../../../lib/api/admin';
import {
  clearLegacyAdminKey,
  getStoredOperator,
  hasLegacyAdminKey,
  setLegacyAdminKey,
} from '../../../../lib/auth';
import { useToast } from '../../../../components/dashboard/ToastProvider';

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const { tenant, branding, user } = useWorkspace();
  const [operator, setOperator] = useState(getStoredOperator());
  const [authType, setAuthType] = useState('');
  const [keyDraft, setKeyDraft] = useState('');
  const [legacyPresent, setLegacyPresent] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLegacyPresent(hasLegacyAdminKey());
    fetchMe().then(({ ok, data }) => {
      if (ok) {
        setOperator(data.operator);
        setAuthType(data.authType || '');
      }
    });
  }, []);

  function saveKey(event) {
    event.preventDefault();
    if (!keyDraft.trim()) {
      toast.error('Enter a key to store, or clear the existing one.');
      return;
    }
    setLegacyAdminKey(keyDraft);
    setKeyDraft('');
    setLegacyPresent(true);
    setSaved(true);
    toast.success('Legacy API key saved for this browser session only');
    window.setTimeout(() => setSaved(false), 2000);
  }

  function clearKey() {
    clearLegacyAdminKey();
    setKeyDraft('');
    setLegacyPresent(false);
    toast.info('Legacy API key removed from this session');
  }

  function handleLogout() {
    logout();
    router.replace('/dashboard/login');
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title="Settings"
        description="Operator session and optional legacy API key for tooling."
        actions={
          <Button type="button" variant="secondary" onClick={handleLogout}>
            Sign out
          </Button>
        }
      />

      <section className="dash-panel p-6" aria-labelledby="settings-signed-in">
        <h2 id="settings-signed-in" className="text-sm font-semibold text-[var(--dash-ink)]">
          Signed in
        </h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--dash-muted)]">Name</dt>
            <dd className="mt-0.5 font-medium text-[var(--dash-ink)]">
              {operator?.name || user?.name || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--dash-muted)]">Email</dt>
            <dd className="mt-0.5 font-medium text-[var(--dash-ink)]">
              {operator?.email || user?.email || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--dash-muted)]">Role</dt>
            <dd className="mt-0.5 font-medium text-[var(--dash-ink)]">
              {operator?.role || user?.role || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--dash-muted)]">Auth</dt>
            <dd className="mt-0.5 font-medium text-[var(--dash-ink)]">
              {authType === 'api_key' || user?.authType === 'legacy'
                ? 'Legacy API key (session)'
                : 'Operator session (JWT)'}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-[var(--dash-muted)]">
          Role comes from the server on each session check. Hiding a menu item in the UI is not
          authorization — admin APIs enforce access.
        </p>
      </section>

      <section className="dash-panel p-6" aria-labelledby="settings-legacy-key">
        <h2 id="settings-legacy-key" className="text-sm font-semibold text-[var(--dash-ink)]">
          Legacy admin API key
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-[var(--dash-muted)]">
          Optional escape hatch for scripts. Prefer operator sign-in. Never put this value in{' '}
          <code className="text-[var(--dash-ink-soft)]">NEXT_PUBLIC_*</code>, git, or frontend
          source. Stored in <code className="text-[var(--dash-ink-soft)]">sessionStorage</code>{' '}
          only for this browser tab session.
        </p>

        {legacyPresent ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-2)]/60 px-3 py-2.5 text-sm">
            <span className="font-medium text-[var(--dash-ink)]">Key on file for this session</span>
            <span className="font-mono text-[var(--dash-muted)]">••••••••••••</span>
            <Button type="button" variant="secondary" size="sm" onClick={clearKey}>
              Clear key
            </Button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--dash-muted)]">No legacy key stored in this session.</p>
        )}

        <form onSubmit={saveKey} className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
              {legacyPresent ? 'Replace ADMIN_API_KEY' : 'ADMIN_API_KEY'}
            </span>
            <input
              type="password"
              autoComplete="off"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              placeholder="Paste key to store for this session"
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--dash-accent)]"
            />
          </label>
          <div className="flex items-center gap-3">
            <Button type="submit">Save for session</Button>
            {saved ? (
              <span className="text-xs font-medium text-emerald-700" role="status">
                Saved
              </span>
            ) : null}
          </div>
        </form>
      </section>

      <section className="dash-panel p-6" aria-labelledby="settings-workspace">
        <h2 id="settings-workspace" className="text-sm font-semibold text-[var(--dash-ink)]">
          Workspace
        </h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--dash-muted)]">Business</dt>
            <dd className="mt-0.5 font-medium text-[var(--dash-ink)]">{tenant.name}</dd>
          </div>
          <div>
            <dt className="text-[var(--dash-muted)]">Product</dt>
            <dd className="mt-0.5 font-medium text-[var(--dash-ink)]">
              {tenant.product} / VCMS {tenant.plan}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--dash-muted)]">Guest app</dt>
            <dd className="mt-0.5 font-medium text-[var(--dash-ink)]">/golden-ticket</dd>
          </div>
          <div>
            <dt className="text-[var(--dash-muted)]">Brand site</dt>
            <dd className="mt-0.5 font-medium text-[var(--dash-ink)]">
              <a
                href={branding.guestSiteUrl}
                className="underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)]"
                target="_blank"
                rel="noreferrer"
              >
                {branding.guestSiteUrl}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-[var(--dash-muted)]">Auth model</dt>
            <dd className="mt-0.5 font-medium text-[var(--dash-ink)]">
              Operator JWT (+ optional legacy key)
            </dd>
          </div>
          <div>
            <dt className="text-[var(--dash-muted)]">Tenant id</dt>
            <dd className="mt-0.5 font-mono text-[13px] font-medium text-[var(--dash-ink)]">
              {tenant.id}
            </dd>
          </div>
        </dl>
      </section>
    </PageContainer>
  );
}
