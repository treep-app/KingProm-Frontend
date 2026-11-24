import { DEFAULT_BUSINESS_NAME } from '../lib/businessDefaults';

export default function TicketCTA({
  storeName = DEFAULT_BUSINESS_NAME,
  storePhone = '',
  browseUrl = '',
  compact = false,
}) {
  const tel = storePhone ? `tel:${storePhone.replace(/\s+/g, '')}` : '';
  const siteUrl = browseUrl?.trim() || '';

  return (
    <section
      className={`w-full rounded-2xl border border-white/10 bg-slate-950/70 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${
        compact ? 'px-5 py-5' : 'px-6 py-7 sm:px-8 sm:py-8'
      }`}
    >
      <p className="text-[15px] leading-relaxed text-white/85">
        Questions about this offer? Contact {storeName} to book or redeem in person.
      </p>
      {storePhone ? (
        <>
          <p className="mt-4 text-[18px] font-semibold tracking-tight text-white">Call {storeName}</p>
          <a
            href={tel}
            className="mt-1 inline-block text-[20px] font-semibold tracking-tight text-[hsl(var(--gold))] underline underline-offset-4"
          >
            {storePhone}
          </a>
        </>
      ) : null}

      <div className={`mt-6 grid gap-3 ${compact ? '' : 'sm:grid-cols-2'}`}>
        {storePhone ? (
          <a href={tel} className="app-press btn-gold h-12 w-full px-6 text-[15px]">
            Call now
          </a>
        ) : null}
        {siteUrl ? (
          <a
            href={siteUrl}
            target="_blank"
            rel="noreferrer"
            className={`app-press btn-gold h-12 w-full px-6 text-[15px] ${
              !storePhone ? 'sm:col-span-2' : ''
            }`}
          >
            Visit website
          </a>
        ) : null}
        {siteUrl ? (
          <a
            href={siteUrl}
            target="_blank"
            rel="noreferrer"
            className={`app-press btn-outline-light h-12 w-full px-6 text-[15px] ${
              compact ? '' : 'sm:col-span-2'
            }`}
          >
            Learn more
          </a>
        ) : null}
      </div>
    </section>
  );
}