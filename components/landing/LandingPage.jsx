'use client';

import { useState } from 'react';
import Link from 'next/link';
import BrandLogo from '../BrandLogo';
import { PLATFORM } from '../../lib/platform';
import {
  BENEFITS,
  SOLUTIONS,
  HOW_IT_WORKS,
  FEATURES,
  FAQ_ITEMS,
  FOOTER_COLUMNS,
} from '../../lib/landing/content';
import {
  MARKETING_PLANS,
  ANNUAL_BILLING_AVAILABLE,
} from '../../lib/landing/plans';
import { formatMoney } from '../../lib/billingDisplay';
import {
  SectionHeader,
  CtaButton,
  PricingCard,
  FAQItem,
} from './LandingPrimitives';
import LandingNavbar from './LandingNavbar';
import ProductPreview from './ProductPreview';
import LandingAuthRedirect from './LandingAuthRedirect';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="landing-page min-h-screen bg-[var(--dash-bg)] text-[var(--dash-ink)]">
      <LandingAuthRedirect />
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(165deg,hsl(var(--navy-dark))_0%,hsl(var(--navy))_48%,#1e3a5f_100%)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 50% at 70% 20%, hsl(var(--gold) / 0.18), transparent 55%), radial-gradient(ellipse 60% 40% at 10% 80%, rgb(6 182 212 / 0.12), transparent 50%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-10 sm:px-6 sm:pb-14 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-10">
          <div className="landing-fade-up">
            <BrandLogo size="lg" branding={PLATFORM.branding} variant="dark" as="p" />
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:leading-[1.1]">
              Turn promotions into revenue
            </h1>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-white/75">
              Create digital vouchers, promo codes, and campaigns that drive bookings, purchases,
              and repeat business.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <CtaButton href="/signup">Start Free</CtaButton>
              <CtaButton
                href="/dashboard/login"
                variant="secondary"
                className="!border-white/30 !bg-transparent !text-white hover:!bg-white/10"
              >
                Login
              </CtaButton>
            </div>
          </div>
          <div className="landing-fade-up landing-fade-up-delay min-w-0">
            <ProductPreview />
          </div>
        </div>
      </section>

      {/* Benefits strip */}
      <section className="border-b border-[var(--dash-border)] bg-white">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:grid-cols-5 sm:px-6 sm:py-10">
          {BENEFITS.map((b) => (
            <div key={b.title}>
              <h2 className="text-sm font-semibold text-[var(--dash-navy)]">{b.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-[var(--dash-muted)] sm:text-sm">
                {b.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Product flow + features */}
      <section id="features" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <SectionHeader
            title="From campaign to redemption"
            description="Create offers, generate codes and QR vouchers, distribute them, then redeem and measure — in one workspace."
          />
          <ol className="mt-8 grid gap-4 sm:grid-cols-4">
            {HOW_IT_WORKS.map((step) => (
              <li key={step.step}>
                <p className="font-display text-2xl font-semibold text-[var(--dash-gold)]">
                  {step.step}
                </p>
                <h3 className="mt-1 text-base font-semibold text-[var(--dash-ink)]">{step.title}</h3>
                <p className="mt-1 text-sm text-[var(--dash-muted)]">{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.slice(0, 8).map((f) => (
              <article
                key={f.title}
                className="rounded-xl border border-[var(--dash-border)] bg-white px-4 py-3"
              >
                <h3 className="text-sm font-semibold text-[var(--dash-ink)]">{f.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--dash-muted)]">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="scroll-mt-24 border-y border-[var(--dash-border)] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <SectionHeader
            title="Built for hospitality and retail"
            description="Hotels, restaurants, events, retail, and venue teams."
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {SOLUTIONS.map((s) => (
              <span
                key={s.title}
                className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 py-2 text-sm font-medium text-[var(--dash-ink-soft)]"
                title={s.body}
              >
                {s.title}
              </span>
            ))}
          </div>
          <p className="mt-4 max-w-2xl text-sm text-[var(--dash-muted)]">
            Automate voucher delivery from bookings and orders, connect email/CRM/PMS/POS
            integrations on Professional+, and track what actually redeems.
          </p>
          <p id="integrations" className="mt-2 scroll-mt-24 text-sm">
            <Link
              href="/dashboard/settings/integrations"
              className="font-medium text-[var(--dash-navy)] underline-offset-2 hover:underline"
            >
              See integrations →
            </Link>
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Pricing"
              title="Start free. Upgrade when you grow."
              description="Limits match the live KingProm billing catalog."
            />
            <Link
              href="/pricing"
              className="text-sm font-medium text-[var(--dash-navy)] underline-offset-2 hover:underline"
            >
              Compare all features →
            </Link>
          </div>
          {!ANNUAL_BILLING_AVAILABLE ? (
            <p className="mt-3 text-xs font-medium text-[var(--dash-muted)]">Billed monthly</p>
          ) : null}
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {MARKETING_PLANS.map((plan) => (
              <PricingCard key={plan.id} plan={plan} formatMoney={formatMoney} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ + trust */}
      <section id="resources" className="scroll-mt-24 border-y border-[var(--dash-border)] bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="FAQ" title="Common questions" />
            <div className="mt-4">
              {FAQ_ITEMS.slice(0, 5).map((item, index) => (
                <FAQItem
                  key={item.q}
                  item={item}
                  open={openFaq === index}
                  onToggle={() => setOpenFaq((cur) => (cur === index ? -1 : index))}
                />
              ))}
            </div>
          </div>
          <div>
            <SectionHeader
              eyebrow="Trust"
              title="Built for business"
              description="Secure auth, tenant-isolated data, roles, audit logging, and signed APIs — without unverified compliance claims."
            />
            <div className="mt-8 rounded-2xl bg-[hsl(var(--navy-dark))] px-6 py-8 text-center">
              <h3 className="font-display text-2xl font-semibold text-white">
                Ready to get started?
              </h3>
              <p className="mt-2 text-sm text-white/70">
                Create your Free workspace in under a minute.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <CtaButton href="/signup">Start Free</CtaButton>
                <CtaButton
                  href="/dashboard/login"
                  variant="secondary"
                  className="!border-white/30 !bg-transparent !text-white hover:!bg-white/10"
                >
                  Login
                </CtaButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="legal" className="bg-[hsl(var(--navy-dark))] text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-1">
              <BrandLogo size="sm" branding={PLATFORM.branding} variant="dark" />
              <p className="mt-3 text-sm text-white/55">{PLATFORM.domain}</p>
            </div>
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
                  {col.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={col.title + link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-white/70 transition hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-8 border-t border-white/10 pt-5 text-sm text-white/45">
            © 2026 {PLATFORM.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
