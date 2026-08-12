export default function TicketCTA({
  storeName = 'Blue Top Villa',
  storePhone = '055 917 1787',
  browseUrl = 'https://www.bluetopvilla.com/',
  compact = false,
}) {
  const tel = `tel:${storePhone.replace(/\s+/g, '')}`;
  const bookUrl = browseUrl.includes('bluetopvilla')
    ? browseUrl.replace(/\/?$/, '/')
    : 'https://www.bluetopvilla.com/';

  return (
    <section
      className={`w-full rounded-2xl border border-white/10 bg-slate-950/70 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${
        compact ? 'px-5 py-5' : 'px-6 py-7 sm:px-8 sm:py-8'
      }`}
    >
      <p className="text-[15px] leading-relaxed text-white/85">
        Book your stay or plan an unforgettable event with us in Kasoa.
      </p>
      <p className="mt-4 text-[18px] font-semibold tracking-tight text-white">Call {storeName}</p>
      <a
        href={tel}
        className="mt-1 inline-block text-[20px] font-semibold tracking-tight text-[hsl(var(--gold))] underline underline-offset-4"
      >
        {storePhone}
      </a>

      <div className={`mt-6 grid gap-3 ${compact ? '' : 'sm:grid-cols-2'}`}>
        <a href={tel} className="app-press btn-gold h-12 w-full px-6 text-[15px]">
          Call now
        </a>
        <a
          href={`${bookUrl}#book`}
          target="_blank"
          rel="noreferrer"
          className="app-press btn-gold h-12 w-full px-6 text-[15px]"
        >
          Book a Room
        </a>
        <a
          href={bookUrl}
          target="_blank"
          rel="noreferrer"
          className={`app-press btn-outline-light h-12 w-full px-6 text-[15px] ${
            compact ? '' : 'sm:col-span-2'
          }`}
        >
          Plan an Event
        </a>
      </div>
    </section>
  );
}
