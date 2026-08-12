'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { hasAdminKey } from '../../lib/api/client';
import * as integrationsService from '../../lib/api/integrationsService';
import { messageFromApiResult } from '../../lib/api/errors';
import { PERMISSIONS, createPermissionChecker } from '../../lib/permissions';
import { getCurrentUser } from '../../lib/currentUser';
import { formatDate } from '../../lib/format';
import AlertBanner from './AlertBanner';
import AuthGate from './AuthGate';
import AutomationDrawer from './AutomationDrawer';
import {
  Button,
  LoadingState,
  PageContainer,
  PageHeader,
  SectionHeader,
} from './ui';

function AutomationsInner() {
  const [automations, setAutomations] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [meta, setMeta] = useState({ triggers: [], actions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const canManage = useMemo(
    () => createPermissionChecker(getCurrentUser()).can(PERMISSIONS.INTEGRATIONS_WRITE),
    [],
  );

  const reload = useCallback(async () => {
    if (!hasAdminKey()) {
      setLoading(false);
      setError('Sign in required.');
      return;
    }
    setLoading(true);
    const [autoRes, execRes] = await Promise.all([
      integrationsService.listAutomations(),
      integrationsService.listAutomationExecutions(),
    ]);
    if (!autoRes.ok) {
      setError(messageFromApiResult(autoRes, 'Unable to load automations.'));
      setAutomations([]);
    } else {
      setAutomations(autoRes.data.automations || []);
      setMeta({
        triggers: autoRes.data.triggers || [],
        actions: autoRes.data.actions || [],
      });
      setError('');
    }
    if (execRes.ok) setExecutions(execRes.data.executions || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleArchive(id) {
    if (!canManage) return;
    if (!window.confirm('Archive this automation?')) return;
    const result = await integrationsService.archiveAutomation(id);
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to archive.'));
      return;
    }
    await reload();
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Automations" description="When → If → Then rules for integration events." />
        <LoadingState rows={5} label="Loading automations…" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Automations"
        description="Simple When / If / Then rules. Complex workflow builders come later."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/dashboard/settings/integrations" variant="secondary">
              Integrations
            </Button>
            <Button
              disabled={!canManage}
              onClick={() => {
                setEditing(null);
                setDrawerOpen(true);
              }}
            >
              New automation
            </Button>
          </div>
        }
      />
      {error ? <AlertBanner>{error}</AlertBanner> : null}

      {automations.length === 0 ? (
        <p className="text-sm text-[var(--dash-muted)]">
          No automations yet. Create a rule like: when a booking is created, add a customer tag.
        </p>
      ) : (
        <div className="grid gap-3">
          {automations.map((auto) => (
            <article key={auto.id} className="dash-panel p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[var(--dash-ink)]">{auto.name}</h3>
                  <p className="mt-1 text-sm text-[var(--dash-muted)]">
                    When <span className="font-medium text-[var(--dash-ink)]">{auto.triggerType}</span>
                    {auto.conditions?.length
                      ? ` · ${auto.conditions.length} condition(s)`
                      : ' · always'}
                    {` · ${auto.actions?.length || 0} action(s)`}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-[var(--dash-muted)]">
                    {auto.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={!canManage}
                    onClick={() => {
                      setEditing(auto);
                      setDrawerOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!canManage}
                    onClick={() => handleArchive(auto.id)}
                  >
                    Archive
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <SectionHeader title="Execution log" description="Recent automation runs for this organization." />
      {executions.length === 0 ? (
        <p className="text-sm text-[var(--dash-muted)]">No automation executions yet.</p>
      ) : (
        <div className="dash-panel overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--dash-border)] text-xs uppercase text-[var(--dash-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Automation</th>
                <th className="px-4 py-3 font-medium">Trigger</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Started</th>
                <th className="px-4 py-3 font-medium">Error</th>
              </tr>
            </thead>
            <tbody>
              {executions.map((exec) => (
                <tr key={exec.id} className="border-b border-[var(--dash-border)] last:border-0">
                  <td className="px-4 py-3 font-medium">{exec.automationName}</td>
                  <td className="px-4 py-3">{exec.triggerType}</td>
                  <td className="px-4 py-3">{exec.status}</td>
                  <td className="px-4 py-3 text-[var(--dash-muted)]">
                    {formatDate(exec.startedAt)}
                  </td>
                  <td className="px-4 py-3 text-[var(--dash-muted)]">
                    {exec.errorMessage || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AutomationDrawer
        open={drawerOpen}
        automation={editing}
        triggers={meta.triggers}
        actions={meta.actions}
        onClose={() => setDrawerOpen(false)}
        onSaved={async () => {
          setDrawerOpen(false);
          await reload();
        }}
      />
    </PageContainer>
  );
}

export default function AutomationsPage() {
  return (
    <AuthGate permission={PERMISSIONS.INTEGRATIONS_READ}>
      <AutomationsInner />
    </AuthGate>
  );
}
