'use client';

import { useState } from 'react';
import * as integrationsService from '../../lib/api/integrationsService';
import { messageFromApiResult } from '../../lib/api/errors';
import { formatDate } from '../../lib/format';
import { Sheet, Button } from './ui';

export default function IntegrationEventDrawer({ event, open, onClose, onRetried }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleRetry() {
    if (!event) return;
    setBusy(true);
    setError('');
    const result = await integrationsService.retryIntegrationEvent(event.id);
    setBusy(false);
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Retry failed.'));
      return;
    }
    onRetried?.(result.data?.event);
  }

  return (
    <Sheet
      open={open}
      onClose={() => {
        if (!busy) onClose?.();
      }}
      title="Event details"
      description={event ? `${event.provider} · ${event.eventType}` : ''}
      busy={busy}
      wide
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            Close
          </Button>
          {event?.status === 'failed' ? (
            <Button loading={busy} disabled={busy} onClick={handleRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      }
    >
      {!event ? null : (
        <div className="space-y-4 text-sm">
          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">
              {error}
            </div>
          ) : null}
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase text-[var(--dash-muted)]">Provider</dt>
              <dd className="mt-1 font-medium">{event.provider}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--dash-muted)]">Status</dt>
              <dd className="mt-1 font-medium">{event.status}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--dash-muted)]">External event ID</dt>
              <dd className="mt-1 font-mono text-xs">{event.externalEventId || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--dash-muted)]">Received</dt>
              <dd className="mt-1">{formatDate(event.receivedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--dash-muted)]">Processed</dt>
              <dd className="mt-1">{event.processedAt ? formatDate(event.processedAt) : '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--dash-muted)]">Retries</dt>
              <dd className="mt-1">
                {event.retryCount}/{event.maxRetries}
              </dd>
            </div>
          </dl>
          {event.errorMessage ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
              <p className="font-medium">{event.errorCategory || 'Error'}</p>
              <p className="mt-1">{event.errorMessage}</p>
            </div>
          ) : null}
          <div>
            <p className="text-xs uppercase text-[var(--dash-muted)]">Payload summary</p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--dash-surface-2)] p-3 text-xs">
              {JSON.stringify(event.payloadSummary || {}, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-xs uppercase text-[var(--dash-muted)]">Processing result</p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--dash-surface-2)] p-3 text-xs">
              {JSON.stringify(event.result || {}, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </Sheet>
  );
}
