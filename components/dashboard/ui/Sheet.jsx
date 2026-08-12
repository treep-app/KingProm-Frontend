'use client';

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

/**
 * Accessible right-side drawer / mobile sheet.
 * Desktop: fixed-width panel from the right. Mobile: near full-screen.
 */
export default function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer = null,
  wide = false,
  busy = false,
}) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previousFocus.current = document.activeElement;
    const panel = panelRef.current;
    const focusable = panel?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus?.();

    function onKey(event) {
      if (event.key === 'Escape' && !busy) {
        event.preventDefault();
        onClose?.();
      }
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      previousFocus.current?.focus?.();
    };
  }, [open, busy, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] transition-opacity"
        aria-label="Close panel"
        disabled={busy}
        onClick={() => {
          if (!busy) onClose?.();
        }}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        className={`relative z-10 flex h-full w-full flex-col border-l border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-2xl transition-transform duration-200 ease-out ${
          wide ? 'sm:max-w-xl lg:max-w-2xl' : 'sm:max-w-md lg:max-w-lg'
        }`}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--dash-border)] px-5 py-4">
          <div className="min-w-0">
            {title ? (
              <h2
                id={titleId}
                className="truncate text-lg font-semibold text-[var(--dash-ink)]"
              >
                {title}
              </h2>
            ) : null}
            {description ? (
              <p id={descId} className="mt-1 text-sm text-[var(--dash-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={onClose}
            aria-label="Close"
            className="shrink-0"
          >
            <X className="size-4" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <footer className="shrink-0 border-t border-[var(--dash-border)] px-5 py-4">
            {footer}
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
