'use client';

import { useState } from 'react';
import Link from 'next/link';
import BrandLogo from '../BrandLogo';
import { PLATFORM } from '../../lib/platform';
import {
  BENEFITS,
  HOW_IT_WORKS,
  SOLUTIONS,
  FAQ_ITEMS,
  FOOTER_LINKS,
} from '../../lib/landing/content';
import { MARKETING_PLANS } from '../../lib/landing/plans';
import { formatMoney } from '../../lib/billingDisplay';
import { CtaButton, PricingCard, FAQItem } from './LandingPrimitives';
import LandingNavbar from './LandingNavbar';
import ProductPreview from './ProductPreview';
import LandingAuthRedirect from './LandingAuthRedirect';
import LandingThemeProvider, { useLandingTheme } from './LandingThemeProvider';

const CORE_PLANS = MARKETING_PLANS.filter((p) => p.id !== 'enterprise');
const ENTERPRISE = MARKETING_PLANS.find((p) => p.id === 'enterprise');

function LandingContent() {
  const [openFaq, setOpenFaq] = useState(0);
  const { theme } = useLandingTheme();
  const logoVariant = theme === 'dark' ? 'dark' : 'light';

  return (
    <>
      <LandingAuthRedirect />
      <LandingNavbar />

      {/* Hero — Dribbble-style airy SaaS composition */}
      <section className="landing-hero">
        <div className="landing-hero-bg" aria-hidden />
        <div className="landing-container landing-hero-grid">
          <div className="landing-fade-up">
            <p className="landing-eyebrow">Promo platform for modern businesses</p>
            <h1>
              Turn promotions
              <br />
              into revenue
            </h1>
            <p className="landing-lead">
              Create digital vouchers, promo codes, and campaigns that drive bookings, purchases,
              and repeat visits — in one clean workspace.
            </p>
            <div className="landing-hero-cta">
              <CtaButton href="/signup">Start Free</CtaButton>
              <CtaButton href="/dashboard/login" variant="secondary">
                Login
              </CtaButton>
            </div>
            <ul className="landing-trust-row">
              <li>Free plan</li>
              <li>No credit card</li>
              <li>QR redemption</li>
            </ul>
          </div>

          <div className="landing-fade-up landing-fade-up-delay landing-hero-visual">
            <ProductPreview />
          </div>
        </div>
      </section>

      {/* Logo / audience strip */}
      <section className="landing-audience">
        <div className="landing-container">
          <p>Trusted by teams in</p>
          <div>
            {SOLUTIONS.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Bento benefits */}
      <section id="product" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-head">
            <p className="landing-eyebrow">Product</p>
            <h2>Everything you need to run promotions</h2>
            <p>From campaign creation to QR redemption and analytics — without the clutter.</p>
          </div>

          <div className="landing-bento">
            {BENEFITS.map((b) => (
              <article key={b.title}>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </article>
            ))}
          </div>

          <ol className="landing-steps">
            {HOW_IT_WORKS.map((step) => (
              <li key={step.step}>
                <span>{step.step}</span>
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="landing-section-head landing-section-head-row">
            <div>
              <p className="landing-eyebrow">Pricing</p>
              <h2>Simple plans that scale with you</h2>
              <p>Start free. Upgrade when your campaigns grow.</p>
            </div>
            <Link href="/pricing" className="landing-text-link">
              Compare features →
            </Link>
          </div>

          <div className="landing-pricing-grid">
            {CORE_PLANS.map((plan) => (
              <PricingCard key={plan.id} plan={plan} formatMoney={formatMoney} compact />
            ))}
          </div>

          {ENTERPRISE ? (
            <div className="landing-enterprise">
              <div>
                <strong>Enterprise</strong>
                <p>Custom limits, SSO-ready controls, and dedicated support.</p>
              </div>
              <CtaButton href={ENTERPRISE.ctaHref} variant="secondary">
                Contact Sales
              </CtaButton>
            </div>
          ) : null}
        </div>
      </section>

      {/* Final CTA + FAQ */}
      <section className="landing-section">
        <div className="landing-container landing-close">
          <div className="landing-cta-panel">
            <h2>Launch your next promotion today</h2>
            <p>Create a Free KingProm workspace in under a minute.</p>
            <div className="landing-hero-cta">
              <CtaButton href="/signup">Start Free</CtaButton>
              <CtaButton href="/dashboard/login" variant="secondary">
                Login
              </CtaButton>
            </div>
          </div>

          <div id="resources" className="landing-faq">
            {FAQ_ITEMS.map((item, index) => (
              <FAQItem
                key={item.q}
                item={item}
                open={openFaq === index}
                onToggle={() => setOpenFaq((cur) => (cur === index ? -1 : index))}
              />
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container">
          <div>
            <BrandLogo
              size="sm"
              branding={PLATFORM.branding}
              variant={logoVariant}
              className="!text-xl"
            />
            <p>
              © 2026 {PLATFORM.name} · {PLATFORM.domain}
            </p>
          </div>
          <nav aria-label="Footer">
            {FOOTER_LINKS.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}

export default function LandingPage() {
  return (
    <LandingThemeProvider>
      <LandingContent />
    </LandingThemeProvider>
  );
}
