'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { hasAdminKey } from '../../lib/api/client';
import * as organizationService from '../../lib/api/organizationService';
import { messageFromApiResult } from '../../lib/api/errors';
import { INDUSTRY_OPTIONS, PERMISSIONS } from '../../lib/permissions';
import { formatDate, formatNumber } from '../../lib/format';
import { DASH_SELECT_COMPACT_CLASS } from '../../lib/dashboard/styles';
import AlertBanner from './AlertBanner';
import AuthGate from './AuthGate';
import {
  Button,
  LoadingState,
  PageContainer,
  PageHeader,
  SectionHeader,
} from './ui';

function BusinessSettingsInner() {
  const [organization, setOrganization] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({
    name: '',
    industry: 'hotel',
    website: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    currency: 'GHS',
    timezone: 'Africa/Accra',
  });

  const reload = useCallback(async () => {
    if (!hasAdminKey()) {
      setLoading(false);
      setError('Sign in required.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await organizationService.getCurrentOrganization();
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to load business profile.'));
      setOrganization(null);
    } else {
      const org = result.data.organization;
      setOrganization(org);
      setUsage(result.data.usage || null);
      setForm({
        name: org.name || '',
        industry: org.industry || 'hotel',
        website: org.website || '',
        email: org.email || '',
        phone: org.phone || '',
        address: org.address || '',
        country: org.country || '',
        currency: org.currency || 'GHS',
        timezone: org.timezone || 'Africa/Accra',
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    setError('');
    const result = await organizationService.updateOrganization(form);
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to save business profile.'));
    } else {
      setNotice('Business profile saved.');
      setOrganization(result.data.organization);
    }
    setSaving(false);
  }

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Business profile" description="Organization settings for this workspace." />
        <LoadingState rows={5} label="Loading business profile…" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Business profile"
        description="Organization settings for this workspace."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/dashboard/settings/billing" variant="secondary">
              Billing
            </Button>
            <Button href="/dashboard/branding" variant="secondary">
              Change branding
            </Button>
            <Button href="/dashboard/team" variant="secondary">
              Manage users
            </Button>
          </div>
        }
      />

      {error ? <AlertBanner>{error}</AlertBanner> : null}
      {notice ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}

      {organization ? (
        <section className="dash-panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
                {organization.industry}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[var(--dash-ink)]">
                {organization.name}
              </h2>
              <p className="mt-1 text-sm text-[var(--dash-muted)]">
                Plan: {organization.subscriptionPlan} · Status: {organization.status} · Created{' '}
                {formatDate(organization.createdAt)}
              </p>
            </div>
            <Button href="/dashboard/settings/billing" variant="secondary">
              Manage billing
            </Button>
          </div>
        </section>
      ) : null}

      <form onSubmit={handleSave} className="dash-panel grid gap-4 p-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
            Business name
          </span>
          <input
            required
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Industry</span>
          <select
            value={form.industry}
            onChange={(e) => setField('industry', e.target.value)}
            className={DASH_SELECT_COMPACT_CLASS}
          >
            {INDUSTRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Website</span>
          <input
            value={form.website}
            onChange={(e) => setField('website', e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Phone</span>
          <input
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Address</span>
          <textarea
            rows={2}
            value={form.address}
            onChange={(e) => setField('address', e.target.value)}
            className="w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Country</span>
          <input
            value={form.country}
            onChange={(e) => setField('country', e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Currency</span>
          <input
            value={form.currency}
            onChange={(e) => setField('currency', e.target.value.toUpperCase())}
            className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Timezone</span>
          <input
            value={form.timezone}
            onChange={(e) => setField('timezone', e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
          />
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save business profile'}
          </Button>
        </div>
      </form>

      <SectionHeader title="Usage" description="Live workspace usage. Limits are enforced in Billing." />
      {usage ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ['Customers', usage.customers],
            ['Vouchers', usage.vouchers],
            ['Emails sent', usage.emailsSent],
            ['Redemptions', usage.redemptions],
            ['Users', usage.users],
          ].map(([label, value]) => (
            <div key={label} className="dash-panel px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--dash-muted)]">
                {label}
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--dash-ink)]">
                {formatNumber(value)}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <p className="text-sm text-[var(--dash-muted)]">
        See plan limits and upgrade options in{' '}
        <Link href="/dashboard/settings/billing" className="font-medium text-[var(--dash-ink)] underline">
          Billing
        </Link>
        .
      </p>

      <p className="text-sm text-[var(--dash-muted)]">
        Visual identity lives in{' '}
        <Link href="/dashboard/branding" className="font-medium text-[var(--dash-ink)] underline">
          Branding
        </Link>
        .
      </p>
    </PageContainer>
  );
}

export default function BusinessSettingsPage() {
  return (
    <AuthGate permission={PERMISSIONS.SETTINGS_READ}>
      <BusinessSettingsInner />
    </AuthGate>
  );
}
