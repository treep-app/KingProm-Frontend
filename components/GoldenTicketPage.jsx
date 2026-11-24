'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, MapPin } from 'lucide-react';
import BrandLogo from './BrandLogo';
import ExpiryBadge from './ExpiryBadge';
import ScratchTicket from './ScratchTicket';
import TicketActionBar from './TicketActionBar';
import TicketCTA from './TicketCTA';
import TicketLoadingPlaceholder from './TicketLoadingPlaceholder';
import TicketStatusView from './TicketStatusView';
import { formatDate } from '../lib/format';
import { redeemTicket, verifyTicket } from '../lib/api/scratch';
import { brandingFromGuestVenue } from '../lib/guestBranding';
import { normalizeExperience } from '../lib/revealEffects';

export default function GoldenTicketPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState(null);
  const [error, setError] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [redeemedAt, setRedeemedAt] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      if (!token) {
        if (cancelled) return;
        setOffer(null);
        setError({
          status: 'INVALID',
          message: 'This link is missing its secure ticket token. Open the original email invite.',
        });
        setLoading(false);
        return;
      }

      try {
        const { data } = await verifyTicket(token);
        if (cancelled) return;

        if (data.status === 'ACTIVE') {
          setOffer(data);
          setError(null);
        } else {
          setOffer(null);
          setError(data);
          if (data.status === 'REDEEMED') {
            setRedeemed(true);
            setRedeemedAt(data.redeemedAt || null);
          }
        }
      } catch {
        if (cancelled) return;
        setError({
          status: 'ERROR',
          message: 'Unable to reach the ticket service. Please try again.',
        });
      } finally {
        // Always clear loading for this generation; React ignores setState after unmount.
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleRedeem() {
    if (!token || redeeming || redeemed) return;
    setRedeeming(true);
    try {
      const { ok, data } = await redeemTicket(token);
      if (data.status === 'REDEEMED') {
        setRedeemed(true);
        setRedeemedAt(data.redeemedAt || null);
        if (!ok) setError(data);
        else setError(null);
      } else {
        setError(data);
      }
    } catch {
      setError({ status: 'ERROR', message: 'Redemption failed. Please try again.' });
    } finally {
      setRedeeming(false);
    }
  }

  if (loading) {
    return <TicketLoadingPlaceholder />;
  }

  if (error?.status === 'EXPIRED') {
    return (
      <TicketStatusView
        status="EXPIRED"
        message={error.message}
        expiresAt={error.expiresAt}
        storeName={error.storeName}
        storePhone={error.storePhone}
        browseUrl={error.browseUrl}
        branding={brandingFromGuestVenue(error)}
      />
    );
  }

  if (error?.status === 'REDEEMED' && !offer) {
    return (
      <TicketStatusView
        status="REDEEMED"
        message={error.message}
        redeemedAt={redeemedAt || error.redeemedAt}
        storeName={error.storeName}
        storePhone={error.storePhone}
        browseUrl={error.browseUrl}
        branding={brandingFromGuestVenue(error)}
      />
    );
  }

  if (error && !offer && error.status !== 'ACTIVE') {
    return (
      <TicketStatusView
        status={error.status === 'ERROR' ? 'ERROR' : 'INVALID'}
        message={error.message}
        storeName={error.storeName}
        storePhone={error.storePhone}
        browseUrl={error.browseUrl}
        branding={brandingFromGuestVenue(error)}
      />
    );
  }

  const guestBranding = offer ? brandingFromGuestVenue(offer) : null;
  const storeLabel = offer?.storeName || guestBranding?.displayName || 'the venue';
  const experience = normalizeExperience(offer?.experience);
  const isTapReveal = experience.revealMode === 'tap';

  if (redeemed) {
    return (
      <main className="promo-stage flex min-h-screen flex-col">
        <header className="app-safe-top border-b border-white/8 px-5 py-4 md:px-6 md:py-5">
          <div className="mx-auto flex max-w-md items-center justify-between md:max-w-6xl">
            <BrandLogo size="md" branding={guestBranding} />
            <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
              Redeemed
            </span>
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-10 text-center md:max-w-xl md:px-6 md:py-12">
          <CheckCircle2 className="size-14 text-emerald-400" />
          <h1 className="mt-4 font-display text-4xl text-[var(--brand-gold)] sm:text-5xl">
            Redeemed successfully
          </h1>
          <p className="mt-3 text-white/70">Show this confirmation at {storeLabel}.</p>
          {offer?.promoCode && (
            <div className="mt-8 rounded-full bg-white px-8 py-3 text-xl font-semibold tracking-wide text-[#222]">
              Promo code: {offer.promoCode}
            </div>
          )}
          {redeemedAt && (
            <p className="mt-4 text-sm text-white/50">Redeemed on {formatDate(redeemedAt)}</p>
          )}
          <div className="mt-10 w-full">
            <TicketCTA
              storeName={offer?.storeName}
              storePhone={offer?.storePhone}
              browseUrl={offer?.browseUrl}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="promo-stage relative md:min-h-screen">
      {/* Mobile: fixed-height app shell | Desktop: normal document flow */}
      <div className="relative flex h-[100dvh] flex-col overflow-hidden overscroll-y-none md:h-auto md:min-h-screen md:overflow-visible">
        <header className="app-safe-top shrink-0 border-b border-white/8 px-4 py-3 md:px-6 md:py-5">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3 md:max-w-6xl">
            <BrandLogo size="md" branding={guestBranding} />
            {offer?.locationLabel ? (
              <div className="hidden items-center gap-2 text-sm text-white/55 md:flex">
                <MapPin className="size-4 text-[var(--brand-gold)]" />
                <span>{offer.locationLabel}</span>
              </div>
            ) : null}
            <p className="rounded-full border border-cyan-400/35 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200 md:border-[var(--brand-gold)]/40 md:bg-[var(--brand-gold)]/10 md:px-3 md:text-xs md:text-[var(--brand-gold)]">
              <span className="md:hidden">Exclusive</span>
              <span className="hidden md:inline">Exclusive offer</span>
            </p>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-y-auto overscroll-y-none px-4 pb-[7.5rem] pt-4 md:max-w-6xl md:flex-none md:overflow-visible md:px-8 md:pb-14 md:pt-14">
          <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-12 lg:gap-16">
            <section className="promo-fade flex flex-col items-center md:items-end">
              <div className="w-full max-w-sm sm:max-w-md md:max-w-[420px]">
                <ScratchTicket
                  offerTitle={offer.offerTitle}
                  offerSubtitle={offer.offerSubtitle}
                  promoCode={offer.promoCode}
                  storeName={storeLabel}
                  revealEffect={experience.revealEffect}
                  revealMode={experience.revealMode}
                  onRevealed={() => setRevealed(true)}
                />
              </div>
            </section>

            <section className="promo-fade-delay pb-4 text-center md:mx-0 md:max-w-xl md:pb-0 md:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300 md:text-xs md:text-[var(--brand-gold)]">
                {storeLabel} · Golden Ticket
              </p>
              <h1 className="mt-2 font-display text-[1.75rem] leading-tight text-white md:mt-3 md:text-4xl lg:text-5xl">
                {isTapReveal ? 'Tap to reveal your offer' : 'Scratch to reveal your offer'}
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/70 md:mx-0 md:mt-4 md:max-w-none md:text-lg">
                <span className="md:hidden">
                  Offer for <span className="font-semibold text-white">{offer.email}</span>.{' '}
                  {isTapReveal ? 'Tap' : 'Scratch'}, reveal your code, then redeem before it expires.
                </span>
                <span className="hidden md:inline">
                  A personalized offer for{' '}
                  <span className="font-semibold text-white">{offer.email}</span>.{' '}
                  {isTapReveal
                    ? 'Tap the foil — watch the reveal effect — then redeem before it expires.'
                    : 'Scratch the foil, reveal your promo code, then redeem before it expires.'}
                </span>
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-white/55 md:mt-6 md:justify-start md:gap-3 md:text-sm">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  Single use
                </span>
                <ExpiryBadge expiresAt={offer.expiresAt} />
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  1 email · 1 ticket
                </span>
              </div>

              <div className="mt-8 hidden md:block">
                <TicketCTA
                  storeName={offer.storeName}
                  storePhone={offer.storePhone}
                  browseUrl={offer.browseUrl}
                />
              </div>

              {revealed && (
                <button
                  type="button"
                  onClick={handleRedeem}
                  disabled={redeeming}
                  className="app-press btn-gold mt-5 hidden h-14 w-full md:inline-flex"
                >
                  {redeeming ? 'Redeeming…' : 'Redeem Now'}
                </button>
              )}

              {offer.terms && (
                <p className="mx-auto mt-5 max-w-sm text-[10px] leading-relaxed text-white/35 md:mx-0 md:mt-6 md:max-w-none md:text-[11px] md:text-white/40">
                  {offer.terms}
                </p>
              )}
            </section>
          </div>
        </div>

        {/* Sticky action bar — mobile only */}
        <div className="md:hidden">
          <TicketActionBar
            storePhone={offer.storePhone}
            revealed={revealed}
            redeeming={redeeming}
            onRedeem={handleRedeem}
          />
        </div>

      </div>
    </main>
  );
}
