'use client';

import { Phone } from 'lucide-react';

/**
 * Thumb-reach glass action bar — Call + Redeem.
 */
export default function TicketActionBar({
  storePhone = '055 917 1787',
  revealed = false,
  redeeming = false,
  onRedeem,
}) {
  const tel = `tel:${String(storePhone).replace(/\s+/g, '')}`;

  return (
    <div className="ticket-action-bar pointer-events-none absolute inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <div className="pointer-events-auto mx-auto w-full">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/80 p-2 shadow-[0_-8px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <a
            href={tel}
            className="app-press btn-outline-light h-12 min-w-0 flex-1 gap-2 px-3 text-sm"
          >
            <Phone className="size-4 shrink-0" aria-hidden />
            <span className="truncate">Call Store</span>
          </a>

          <button
            type="button"
            onClick={onRedeem}
            disabled={!revealed || redeeming}
            className="app-press btn-gold h-12 min-w-0 flex-[1.15] px-3 text-sm disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/45 disabled:shadow-none"
          >
            {redeeming ? 'Redeeming…' : revealed ? 'Redeem Now' : 'Scratch to unlock'}
          </button>
        </div>
      </div>
    </div>
  );
}
