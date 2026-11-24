'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Clock3, ShieldAlert } from 'lucide-react';
import BrandLogo from './BrandLogo';
import TicketLoadingPlaceholder from './TicketLoadingPlaceholder';
import { validateVoucherPass } from '../lib/api/voucher';
import { brandingFromGuestVenue } from '../lib/guestBranding';
import { formatDate } from '../lib/format';
import VoucherQrDisplay from './VoucherQrDisplay';

function StatusBadge({ status }) {
  const key = String(status || '').toUpperCase();
  const map = {
    VALID: 'text-emerald-300 border-emerald-300/40 bg-emerald-300/10',
    REDEEMED: 'text-slate-300 border-slate-300/30 bg-slate-300/10',
    EXPIRED: 'text-amber-300 border-amber-300/40 bg-amber-300/10',
    INVALID: 'text-rose-300 border-rose-300/40 bg-rose-300/10',
  };
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
        map[key] || map.INVALID
      }`}
    >
      {key || 'UNKNOWN'}
    </span>
  );
}

export default function VoucherPassPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const scratchToken = searchParams.get('token');
      const v = searchParams.get('v');
      const guestJwt = scratchToken || v;

      if (guestJwt && guestJwt.split('.').length === 3) {
        router.replace(`/golden-ticket?token=${encodeURIComponent(guestJwt)}`);
        return;
      }

      const key = v || scratchToken;
      if (!key) {
        if (!cancelled) {
          setError({
            message: 'This link is missing a voucher code. Open the original email or QR.',
          });
          setLoading(false);
        }
        return;
      }

      const { ok, data } = await validateVoucherPass({ v, token: scratchToken });
      if (cancelled) return;

      if (data?.status === 'REDIRECT' && data.redirect === 'golden-ticket' && guestJwt) {
        router.replace(`/golden-ticket?token=${encodeURIComponent(guestJwt)}`);
        return;
      }

      if (!ok && !data?.result) {
        setError({
          message: data?.message || 'Unable to load this voucher.',
        });
        setPayload(null);
      } else {
        setPayload(data);
        setError(null);
      }
      setLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  if (loading) {
    return <TicketLoadingPlaceholder message="Loading your voucher…" />;
  }

  const branding = payload?.venue ? brandingFromGuestVenue(payload.venue) : null;
  const storeName =
    payload?.venue?.storeName || branding?.displayName || 'Your host';
  const result = String(payload?.result || '').toUpperCase();
  const voucher = payload?.voucher;

  return (
    <main className="promo-stage flex min-h-screen flex-col">
      <header className="app-safe-top border-b border-white/8 px-5 py-4">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <BrandLogo size="md" branding={branding} />
          {result ? <StatusBadge status={result} /> : null}
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-10">
        {error ? (
          <div className="text-center">
            <ShieldAlert className="mx-auto size-12 text-rose-400" />
            <h1 className="mt-4 font-display text-3xl text-white">Invalid link</h1>
            <p className="mt-3 text-sm text-white/70">{error.message}</p>
          </div>
        ) : (
          <>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
              {storeName}
            </p>
            <h1 className="mt-2 text-center font-display text-3xl text-white">
              {result === 'VALID' ? 'Your voucher' : payload?.message || 'Voucher'}
            </h1>

            {result === 'VALID' ? (
              <VoucherQrDisplay
                qrPngDataUrl={payload?.qrPngDataUrl}
                promoCode={voucher?.promoCode}
              />
            ) : null}

            {voucher?.promoCode && result === 'VALID' ? (
              <PromoCodeDisplay code={voucher.promoCode} />
            ) : null}

            {voucher?.offer ? (
              <p className="mt-4 text-center text-lg text-white/85">{voucher.offer}</p>
            ) : null}

            {voucher?.expiresAt && (
              <p className="mt-2 text-center text-sm text-white/55">
                Valid until {formatDate(voucher.expiresAt)}
              </p>
            )}

            {result === 'VALID' ? (
              <p className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white/70">
                Show this screen at check-in. Staff scan the code above or type your promo code.
              </p>
            ) : null}

            {result === 'REDEEMED' ? (
              <p className="mt-6 flex items-center justify-center gap-2 text-sm text-white/70">
                <CheckCircle2 className="size-5 text-emerald-400" />
                This voucher has already been used.
              </p>
            ) : null}

            {result === 'EXPIRED' ? (
              <p className="mt-6 flex items-center justify-center gap-2 text-sm text-white/70">
                <Clock3 className="size-5 text-amber-400" />
                This offer has expired.
              </p>
            ) : null}

            {payload?.message && result !== 'VALID' ? (
              <p className="mt-4 text-center text-sm text-white/60">{payload.message}</p>
            ) : null}
          </>
        )}

        <div className="mt-auto pt-10 text-center text-xs text-white/40">
          <p>
            Staff member?{' '}
            <Link
              href={
                searchParams.get('v')
                  ? `/dashboard/login?next=${encodeURIComponent(
                      `/dashboard/redeem?v=${encodeURIComponent(searchParams.get('v'))}`,
                    )}`
                  : '/dashboard/login'
              }
              className="text-[var(--brand-gold)] underline-offset-2 hover:underline"
            >
              Sign in to redeem
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function PromoCodeDisplay({ code }) {
  return (
    <div className="mt-5 rounded-2xl bg-white px-6 py-5 text-center shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
        Promo code
      </p>
      <p className="mt-2 font-mono text-3xl font-bold tracking-widest text-neutral-900">{code}</p>
    </div>
  );
}