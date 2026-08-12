'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

/**
 * Per-row campaign actions menu.
 * Only pass actions the caller has already authorized for the current role.
 */
export default function CampaignRowActions({ actions = [] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;

    function onPointer(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!actions.length) return null;

  return (
    <div ref={rootRef} className="relative inline-flex justify-end">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--dash-muted)] hover:bg-[var(--dash-surface-2)] hover:text-[var(--dash-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)]"
      >
        <MoreHorizontal className="size-4" aria-hidden />
        <span className="sr-only">Campaign actions</span>
      </button>

      {open ? (
        <ul
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[10.5rem] rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] py-1 shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          {actions.map((action) => (
            <li key={action.id} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={action.disabled}
                title={action.title || undefined}
                onClick={() => {
                  if (action.disabled) return;
                  setOpen(false);
                  action.onSelect?.();
                }}
                className={`flex w-full px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  action.danger
                    ? 'text-rose-700 hover:bg-rose-50'
                    : 'text-[var(--dash-ink)] hover:bg-[var(--dash-surface-2)]'
                }`}
              >
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
