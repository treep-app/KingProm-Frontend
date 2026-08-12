'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import * as billingService from '../lib/api/billingService';
import { messageFromApiResult } from '../lib/api/errors';
import {
  formatMoney,
  formatLimit,
  PLAN_FEATURE_ROWS,
  planCellValue,
} from '../lib/billingDisplay';

export default function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const result = await billingService.getPlans({ publicCatalog: true });
      if (cancelled) return;
      if (!result.ok) {
        setError(messageFromApiResult(result, 'Unable to load pricing.'));
        setPlans([]);
      } else {
        setPlans(result.data.plans || []);
        setError('');
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--dash-bg)] text-[var(--dash-ink)]">
      <header className="border-b border-[var(--dash-border)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="inline-flex items-center">
            <span className="font-display text-lg font-bold tracking-tight text-[var(--dash-ink)]">
              King<span className="text-[hsl(var(--gold))]">Prom</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/dashboard/login" className="text-[var(--dash-muted)] hover:text-[var(--dash-ink)]">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[var(--dash-navy)] px-3 py-2 font-medium text-white"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
            Pricing
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Plans for hospitality promo teams
          </h1>
          <p className="mt-3 text-base text-[var(--dash-muted)]">
            Start free, upgrade when you grow. Hotels, restaurants, events, and venues
            on one subscription platform.
          </p>
        </div>

        {error ? (
          <p className="mt-8 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-10 text-sm text-[var(--dash-muted)]">Loading plans…</p>
        ) : (
          <>
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan) => {
                const price =
                  plan.id === 'enterprise'
                    ? 'Contact sales'
                    : plan.priceCents > 0
                      ? `${formatMoney(plan.priceCents, plan.currency)}/mo`
                      : '$0/mo';
                return (
                  <article
                    key={plan.id}
                    className={`rounded-xl border bg-white p-5 shadow-sm ${
                      plan.highlight
                        ? 'border-[var(--dash-navy)] ring-1 ring-[var(--dash-navy)]'
                        : 'border-[var(--dash-border)]'
                    }`}
                  >
                    <h2 className="text-lg font-semibold">{plan.name}</h2>
                    <p className="mt-2 text-2xl font-semibold tabular-nums">{price}</p>
                    <p className="mt-2 text-sm text-[var(--dash-muted)]">{plan.description}</p>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li>✓ {formatLimit(plan.limits?.customers)} customers</li>
                      <li>✓ {formatLimit(plan.limits?.vouchers)} promo codes</li>
                      <li>✓ {formatLimit(plan.limits?.users)} users</li>
                      {plan.features?.emailCampaigns ? <li>✓ Email campaigns</li> : null}
                      {plan.features?.advancedReports ? <li>✓ Advanced analytics</li> : null}
                    </ul>
                    <div className="mt-6">
                      {plan.id === 'enterprise' ? (
                        <a
                          href="mailto:hello@kingprom.com?subject=Enterprise%20plan"
                          className="inline-flex rounded-lg border border-[var(--dash-border-strong)] px-3 py-2 text-sm font-medium"
                        >
                          Contact sales
                        </a>
                      ) : (
                        <Link
                          href="/signup"
                          className="inline-flex rounded-lg bg-[var(--dash-navy)] px-3 py-2 text-sm font-medium text-white"
                        >
                          {plan.priceCents > 0 ? 'Get started' : 'Start free'}
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <section className="mt-16">
              <h2 className="text-xl font-semibold">Compare features</h2>
              <p className="mt-1 text-sm text-[var(--dash-muted)]">
                Limits are enforced by the backend for every organization.
              </p>
              <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--dash-border)] bg-white">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-[var(--dash-border)] bg-[var(--dash-surface-2)] text-xs uppercase text-[var(--dash-muted)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Feature</th>
                      {plans.map((p) => (
                        <th key={p.id} className="px-4 py-3 font-medium">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PLAN_FEATURE_ROWS.map((row) => (
                      <tr key={row.key} className="border-b border-[var(--dash-border)] last:border-0">
                        <td className="px-4 py-3 font-medium">{row.label}</td>
                        {plans.map((p) => (
                          <td key={p.id} className="px-4 py-3 tabular-nums text-[var(--dash-muted)]">
                            {planCellValue(p, row)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
