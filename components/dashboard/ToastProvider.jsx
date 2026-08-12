'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, { tone = 'info', duration = 4200 } = {}) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, tone }]);
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      push,
      success: (message, opts) => push(message, { ...opts, tone: 'success' }),
      error: (message, opts) => push(message, { ...opts, tone: 'error', duration: opts?.duration ?? 5600 }),
      info: (message, opts) => push(message, { ...opts, tone: 'info' }),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(100vw-2rem,22rem)] flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm shadow-lg backdrop-blur ${
              toast.tone === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                : toast.tone === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-950'
                  : 'border-[var(--dash-border)] bg-white text-[var(--dash-ink)]'
            }`}
          >
            <p className="flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded-md p-0.5 opacity-60 hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
