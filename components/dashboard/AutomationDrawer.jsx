'use client';

import { useEffect, useState } from 'react';
import * as integrationsService from '../../lib/api/integrationsService';
import { messageFromApiResult } from '../../lib/api/errors';
import { Sheet, Button } from './ui';

export default function AutomationDrawer({
  open,
  automation,
  triggers = [],
  actions = [],
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    triggerType: 'booking.created',
    conditionField: '',
    conditionOp: 'gt',
    conditionValue: '',
    actionType: 'add_customer_tag',
    actionTag: 'vip',
    actionNote: '',
    actionMessage: '',
    status: 'active',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (automation) {
      const condition = automation.conditions?.[0] || {};
      const action = automation.actions?.[0] || {};
      setForm({
        name: automation.name || '',
        description: automation.description || '',
        triggerType: automation.triggerType || 'booking.created',
        conditionField: condition.field || '',
        conditionOp: condition.op || 'gt',
        conditionValue: condition.value != null ? String(condition.value) : '',
        actionType: action.type || 'add_customer_tag',
        actionTag: action.tag || 'vip',
        actionNote: action.note || '',
        actionMessage: action.message || '',
        status: automation.status || 'active',
      });
    } else {
      setForm({
        name: '',
        description: '',
        triggerType: triggers[0] || 'booking.created',
        conditionField: '',
        conditionOp: 'gt',
        conditionValue: '',
        actionType: actions[0] || 'add_customer_tag',
        actionTag: 'vip',
        actionNote: '',
        actionMessage: '',
        status: 'active',
      });
    }
    setError('');
  }, [open, automation, triggers, actions]);

  async function handleSave(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    const conditions = [];
    if (form.conditionField && form.conditionValue !== '') {
      conditions.push({
        field: form.conditionField,
        op: form.conditionOp,
        value: form.conditionField === 'amount'
          ? Number(form.conditionValue)
          : form.conditionValue,
      });
    }

    const action = { type: form.actionType };
    if (form.actionType === 'add_customer_tag') action.tag = form.actionTag;
    if (form.actionType === 'create_customer_note') action.note = form.actionNote;
    if (form.actionType === 'notify_staff') action.message = form.actionMessage;

    const payload = {
      name: form.name,
      description: form.description,
      triggerType: form.triggerType,
      conditions,
      actions: [action],
      status: form.status,
    };

    const result = automation
      ? await integrationsService.updateAutomation(automation.id, payload)
      : await integrationsService.createAutomation(payload);

    setBusy(false);
    if (!result.ok) {
      setError(messageFromApiResult(result, 'Unable to save automation.'));
      return;
    }
    onSaved?.(result.data?.automation);
  }

  return (
    <Sheet
      open={open}
      onClose={() => {
        if (!busy) onClose?.();
      }}
      title={automation ? 'Edit automation' : 'New automation'}
      description="When an event happens, optionally check a condition, then run an action."
      busy={busy}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button form="automation-form" type="submit" loading={busy} disabled={busy}>
            Save automation
          </Button>
        </div>
      }
    >
      <form id="automation-form" className="space-y-4" onSubmit={handleSave}>
        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </div>
        ) : null}
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">When</span>
          <select
            value={form.triggerType}
            onChange={(e) => setForm((p) => ({ ...p, triggerType: e.target.value }))}
            className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
          >
            {triggers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-2 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">If field</span>
            <select
              value={form.conditionField}
              onChange={(e) => setForm((p) => ({ ...p, conditionField: e.target.value }))}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
            >
              <option value="">Always</option>
              <option value="amount">Amount</option>
              <option value="currency">Currency</option>
              <option value="product">Product</option>
              <option value="tag">Tag</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Op</span>
            <select
              value={form.conditionOp}
              onChange={(e) => setForm((p) => ({ ...p, conditionOp: e.target.value }))}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
            >
              <option value="gt">&gt;</option>
              <option value="gte">&gt;=</option>
              <option value="lt">&lt;</option>
              <option value="eq">=</option>
              <option value="contains">contains</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Value</span>
            <input
              value={form.conditionValue}
              onChange={(e) => setForm((p) => ({ ...p, conditionValue: e.target.value }))}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Then</span>
          <select
            value={form.actionType}
            onChange={(e) => setForm((p) => ({ ...p, actionType: e.target.value }))}
            className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
          >
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        {form.actionType === 'add_customer_tag' ? (
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Tag</span>
            <input
              value={form.actionTag}
              onChange={(e) => setForm((p) => ({ ...p, actionTag: e.target.value }))}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
            />
          </label>
        ) : null}
        {form.actionType === 'create_customer_note' ? (
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Note</span>
            <input
              value={form.actionNote}
              onChange={(e) => setForm((p) => ({ ...p, actionNote: e.target.value }))}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
            />
          </label>
        ) : null}
        {form.actionType === 'notify_staff' ? (
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">Message</span>
            <input
              value={form.actionMessage}
              onChange={(e) => setForm((p) => ({ ...p, actionMessage: e.target.value }))}
              className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 text-sm"
            />
          </label>
        ) : null}
      </form>
    </Sheet>
  );
}
