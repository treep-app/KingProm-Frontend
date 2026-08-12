'use client';

import { useEffect, useId } from 'react';
import { Button } from './ui';

/**
 * Accessible confirm dialog for destructive / irreversible actions.
 * Prefer this over window.confirm().
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return undefined;

    function onKey(event) {
      if (event.key === 'Escape' && !busy) onCancel?.();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        aria-label="Dismiss"
        disabled={busy}
        onClick={() => {
          if (!busy) onCancel?.();
        }}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-xl sm:p-6"
      >
        <h2 id={titleId} className="text-lg font-semibold text-[var(--dash-ink)]">
          {title}
        </h2>
        {description ? (
          <p id={descId} className="mt-2 text-sm text-[var(--dash-muted)]">
            {description}
          </p>
        ) : null}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant}
            disabled={busy}
            autoFocus
            onClick={onConfirm}
            className="w-full sm:w-auto"
          >
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
