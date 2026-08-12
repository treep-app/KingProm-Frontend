'use client';

import { useEffect, useState } from 'react';
import * as customerService from '../../lib/api/customerService';
import {
  fieldErrorsFromApiResult,
  messageFromApiResult,
} from '../../lib/api/errors';
import { DASH_INPUT_CLASS } from '../../lib/dashboard/styles';
import { useToast } from './ToastProvider';
import { Button, Sheet } from './ui';

const EMPTY = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
};

/**
 * Lightweight Add Customer drawer for the customers list.
 * Full multi-field create/edit remains on /customers/new and /edit.
 */
export default function CustomerQuickCreateDrawer({ open, onClose, onSuccess }) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY);
    setErrors({});
    setBusy(false);
  }, [open]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.firstName.trim()) {
      nextErrors.firstName = 'First name is required.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setBusy(true);
    const result = await customerService.createCustomer({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
    });
    setBusy(false);

    if (!result.ok) {
      const apiFields = fieldErrorsFromApiResult(result);
      if (Object.keys(apiFields).length) setErrors(apiFields);
      toast.error(
        messageFromApiResult(result, 'Unable to create customer.', {
          resource: 'customer',
        }),
      );
      return;
    }

    toast.success('Customer created');
    onSuccess?.(result.data?.customer);
    onClose?.();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add customer"
      description="Create a contact without leaving this page."
      busy={busy}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="quick-create-customer"
            loading={busy}
            disabled={busy}
            className="w-full sm:w-auto"
          >
            Add customer
          </Button>
        </div>
      }
    >
      <form id="quick-create-customer" className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="qc-first" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
              First name
            </label>
            <input
              id="qc-first"
              value={form.firstName}
              onChange={(e) => setField('firstName', e.target.value)}
              className={DASH_INPUT_CLASS}
              disabled={busy}
            />
            {errors.firstName ? (
              <p className="mt-1 text-xs text-rose-700">{errors.firstName}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="qc-last" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
              Last name
            </label>
            <input
              id="qc-last"
              value={form.lastName}
              onChange={(e) => setField('lastName', e.target.value)}
              className={DASH_INPUT_CLASS}
              disabled={busy}
            />
          </div>
        </div>
        <div>
          <label htmlFor="qc-email" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
            Email
          </label>
          <input
            id="qc-email"
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            className={DASH_INPUT_CLASS}
            disabled={busy}
          />
          {errors.email ? (
            <p className="mt-1 text-xs text-rose-700">{errors.email}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="qc-phone" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
            Phone
          </label>
          <input
            id="qc-phone"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            className={DASH_INPUT_CLASS}
            disabled={busy}
          />
        </div>
        <div>
          <label htmlFor="qc-company" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
            Company
          </label>
          <input
            id="qc-company"
            value={form.company}
            onChange={(e) => setField('company', e.target.value)}
            className={DASH_INPUT_CLASS}
            disabled={busy}
          />
        </div>
      </form>
    </Sheet>
  );
}
