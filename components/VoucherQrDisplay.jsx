'use client';

import { ScanLine } from 'lucide-react';

/**
 * Staff scan target for guest voucher pass (encodes validation URL / token).
 */
export default function VoucherQrDisplay({ qrPngDataUrl, promoCode }) {
  if (!qrPngDataUrl) return null;

  return (
    <div className="mt-8 w-full rounded-2xl bg-white px-6 py-6 text-center shadow-lg">
      <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
        <ScanLine className="size-4 text-neutral-400" aria-hidden />
        Scan at checkout
      </p>
      <QrImage qrPngDataUrl={qrPngDataUrl} promoCode={promoCode} />
      <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
        Staff scan this code with the redeem scanner, or enter the promo code below.
      </p>
    </div>
  );
}

function QrImage({ qrPngDataUrl, promoCode }) {
  return (
    <img
      src={qrPngDataUrl}
      width={200}
      height={200}
      alt={promoCode ? `QR code for promo ${promoCode}` : 'Voucher QR code for staff scan'}
      className="mx-auto mt-4 size-[200px] rounded-xl border border-neutral-200 bg-white p-2"
    />
  );
}