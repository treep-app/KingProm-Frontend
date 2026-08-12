import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  PartyPopper,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import TicketCTA from './TicketCTA';
import { formatDate } from '../lib/api';

const SITE = 'https://www.bluetopvilla.com';

const COPY = {
  EXPIRED: {
    eyebrow: 'Offer ended',
    title: 'This Golden Ticket has expired',
    body: 'The scratch window for this exclusive offer has closed. You can still book a stay or plan an event with us — rooms and celebrations are waiting in Kasoa.',
    icon: Clock3,
    accent: 'text-amber-300',
    ring: 'border-amber-300/30 bg-amber-300/10',
    badge: 'Expired',
  },
  REDEEMED: {
    eyebrow: 'Already used',
    title: 'This ticket was already redeemed',
    body: "Thanks for celebrating with Blue Top Villa. This voucher can't be reused, but we'd love to welcome you back for another stay or event.",
    icon: CheckCircle2,
    accent: 'text-emerald-300',
    ring: 'border-emerald-300/30 bg-emerald-300/10',
    badge: 'Redeemed',
  },
  INVALID: {
    eyebrow: 'Link issue',
    title: 'This ticket link isn’t valid',
    body: 'The link may be incomplete, outdated, or opened without its secure token. Open the original email link, or contact us and we’ll help you out.',
    icon: ShieldAlert,
    accent: 'text-rose-300',
    ring: 'border-rose-300/30 bg-rose-300/10',
    badge: 'Unavailable',
  },
  ERROR: {
    eyebrow: 'Temporary issue',
    title: 'We couldn’t load your ticket',
    body: 'Something went wrong while validating your Golden Ticket. Please try again in a moment, or reach out and our team will assist you.',
    icon: ShieldAlert,
    accent: 'text-rose-300',
    ring: 'border-rose-300/30 bg-rose-300/10',
    badge: 'Try again',
  },
};

export default function TicketStatusView({
  status = 'INVALID',
  message,
  expiresAt,
  redeemedAt,
  storeName,
  storePhone,
  browseUrl,
}) {
  const config = COPY[status] || COPY.INVALID;
  const Icon = config.icon;

  return (
    <main className="promo-stage flex min-h-screen flex-col">
      <header className="promo-fade border-b border-white/8 px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <BrandLogo size="md" />
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${config.ring} ${config.accent}`}
          >
            {config.badge}
          </span>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-5 py-12 md:grid-cols-[0.95fr_1.05fr] md:items-center md:gap-14 md:px-8 md:py-16">
        <section className="promo-fade flex justify-center md:justify-end">
          <div className="relative w-full max-w-[380px]">
            <div className="ticket-mask gold-foil absolute inset-0 opacity-45 blur-[1px]" />
            <div className="ticket-mask relative overflow-hidden bg-[#121820] shadow-[0_28px_80px_rgba(0,0,0,0.5)] ring-1 ring-[var(--brand-gold)]/25">
              <div className="flex aspect-[320/420] flex-col items-center justify-center px-8 text-center">
                <div
                  className={`mb-5 flex size-16 items-center justify-center rounded-full border ${config.ring}`}
                >
                  <Icon className={`size-8 ${config.accent}`} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                  Golden Ticket
                </p>
                <p className="mt-3 font-display text-3xl text-white/90">Blue Top Villa</p>
                <div className="mt-6 h-px w-24 bg-white/15" />
                <p className={`mt-6 text-sm font-semibold uppercase tracking-[0.18em] ${config.accent}`}>
                  {config.badge}
                </p>
                {expiresAt && status === 'EXPIRED' && (
                  <p className="mt-3 text-sm text-white/55">
                    Ended {formatDate(expiresAt)}
                  </p>
                )}
                {redeemedAt && status === 'REDEEMED' && (
                  <p className="mt-3 text-sm text-white/55">
                    Redeemed {formatDate(redeemedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="promo-fade-delay mx-auto w-full max-w-xl md:mx-0">
          <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${config.accent}`}>
            {config.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-white sm:text-5xl">
            {config.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
            {config.body}
          </p>
          {message && message !== config.title && (
            <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
              {message}
            </p>
          )}

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <Perk
              icon={Sparkles}
              label="Rooms from GHS 280"
            />
            <Perk
              icon={PartyPopper}
              label="Weddings & parties"
            />
            <Perk
              icon={CalendarClock}
              label="Book any time"
            />
          </div>

          <div className="mt-8">
            <TicketCTA
              storeName={storeName}
              storePhone={storePhone}
              browseUrl={browseUrl || SITE}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function Perk({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm text-white/70">
      <Icon className="size-4 shrink-0 text-[var(--brand-gold)]" />
      <span>{label}</span>
    </div>
  );
}
