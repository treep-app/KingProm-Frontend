'use client';

import { useCallback, useEffect, useState } from 'react';
import { hasAdminKey } from '../../lib/api/client';
import * as integrationsService from '../../lib/api/integrationsService';
import { messageFromApiResult } from '../../lib/api/errors';
import { PERMISSIONS } from '../../lib/permissions';
import { formatDate } from '../../lib/format';
import AlertBanner from './AlertBanner';
import AuthGate from './AuthGate';
import IntegrationEventDrawer from './IntegrationEventDrawer';
import {
  Button,
  LoadingState,
  PageContainer,
  PageHeader,
} from './ui';

function IntegrationLogsInner() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const reload = useCallback(async () => {
    if (!hasAdminKey()) {
      setLoading(false);
      setError('Sign in required.');
      return;
    }
    setLoading(true);
    const result = await integrationsService.listIntegrationEvents();
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to load events.'));
      setEvents([]);
    } else {
      setEvents(result.data.events || []);
      setError('');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Integration logs" description="Inbound events from connected providers." />
        <LoadingState rows={5} label="Loading events…" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Integration logs"
        description="Inbound events from connected providers."
        actions={
          <Button href="/dashboard/settings/integrations" variant="secondary">
            Back to integrations
          </Button>
        }
      />
      {error ? <AlertBanner>{error}</AlertBanner> : null}
      {events.length === 0 ? (
        <p className="text-sm text-[var(--dash-muted)]">
          No integration events yet. Connected providers will appear here when webhooks arrive.
        </p>
      ) : (
        <div className="dash-panel overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--dash-border)] text-xs uppercase text-[var(--dash-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Received</th>
                <th className="px-4 py-3 font-medium">Processed</th>
                <th className="px-4 py-3 font-medium">Error</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-[var(--dash-border)] last:border-0">
                  <td className="px-4 py-3 font-medium">{event.provider}</td>
                  <td className="px-4 py-3">{event.eventType}</td>
                  <td className="px-4 py-3">{event.status}</td>
                  <td className="px-4 py-3 text-[var(--dash-muted)]">
                    {formatDate(event.receivedAt)}
                  </td>
                  <td className="px-4 py-3 text-[var(--dash-muted)]">
                    {event.processedAt ? formatDate(event.processedAt) : '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--dash-muted)]">
                    {event.errorMessage || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(event)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <IntegrationEventDrawer
        event={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onRetried={async () => {
          setSelected(null);
          await reload();
        }}
      />
    </PageContainer>
  );
}

export default function IntegrationLogsPage() {
  return (
    <AuthGate permission={PERMISSIONS.INTEGRATIONS_READ}>
      <IntegrationLogsInner />
    </AuthGate>
  );
}
