'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldOff } from 'lucide-react';
import { PERMISSIONS } from '../../lib/permissions';
import { useCustomer } from '../../hooks/useCustomer';
import * as customerService from '../../lib/api/customerService';
import {
  messageFromApiResult,
  messageFromCaughtError,
} from '../../lib/api/errors';
import { CUSTOMER_TAG_OPTIONS, normalizeTags } from '../../lib/dashboard/customerTags';
import { customerDisplayName } from '../../lib/dashboard/customerFormat';
import { DASH_INPUT_CLASS, DASH_SELECT_CLASS } from '../../lib/dashboard/styles';
import AuthGate from './AuthGate';
import ConfirmDialog from './ConfirmDialog';
import FormSection from './FormSection';
import { useToast } from './ToastProvider';
import { useCustomerPermissions } from './WorkspaceProvider';
import { Button, EmptyState, LoadingState, PageContainer, PageHeader } from './ui';

function emptyForm() {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    tags: [],
    notes: '',
  };
}

function formFromCustomer(customer) {
  if (!customer) return emptyForm();
  return {
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    email: customer.email || '',
    phone: customer.phone || '',
    company: customer.company || '',
    tags: normalizeTags(customer.tags || []),
    notes: customer.notes || '',
  };
}

function FieldLabel({ htmlFor, children, required = false }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
      {children}
      {required ? <span className="ml-0.5 text-rose-600">*</span> : null}
    </label>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-700">{message}</p>;
}

function CustomerFormInner({ mode = 'create', customerId = '' }) {
  const router = useRouter();
  const toast = useToast();
  const customersPerm = useCustomerPermissions();
  const isEdit = mode === 'edit';

  const {
    customer,
    loading,
    error,
    errorResult,
  } = useCustomer(customerId, { enabled: isEdit && Boolean(customerId) });

  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [duplicateDialog, setDuplicateDialog] = useState(null);
  const [duplicateBusy, setDuplicateBusy] = useState(false);

  useEffect(() => {
    if (isEdit && customer) {
      setForm(formFromCustomer(customer));
    }
  }, [isEdit, customer]);

  const canSubmit = isEdit ? customersPerm.edit : customersPerm.create;

  if (isEdit && !customersPerm.edit) {
    return (
      <PageContainer>
        <EmptyState
          icon={ShieldOff}
          title="You can’t edit customers"
          description="Your role can view profiles but not change them."
          action={
            <Button href={`/dashboard/customers/${encodeURIComponent(customerId)}`} variant="secondary">
              Back to profile
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (!canSubmit) {
    return (
      <PageContainer>
        <EmptyState
          icon={ShieldOff}
          title="You can’t add customers"
          description="Your role can view profiles but not create them."
          action={
            <Button href="/dashboard/customers" variant="secondary">
              Back to customers
            </Button>
          }
        />
      </PageContainer>
    );
  }

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function toggleTag(tag) {
    setForm((prev) => {
      const has = prev.tags.includes(tag);
      return {
        ...prev,
        tags: has ? prev.tags.filter((t) => t !== tag) : normalizeTags([...prev.tags, tag]),
      };
    });
  }

  function validate() {
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = 'First name is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function save({ force = false } = {}) {
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      company: form.company.trim() || undefined,
      tags: normalizeTags(form.tags),
      notes: form.notes.trim() || undefined,
      force,
    };

    if (isEdit) {
      return customerService.updateCustomer(customerId, payload);
    }
    return customerService.createCustomer(payload);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await save();
      if (result.status === 409 && result.data?.status === 'DUPLICATE') {
        setDuplicateDialog({
          message: result.data.message,
          duplicates: result.data.duplicates || [],
        });
        setSubmitting(false);
        return;
      }
      if (!result.ok) {
        toast.error(
          messageFromApiResult(
            result,
            isEdit
              ? 'Unable to update the customer. Please try again.'
              : 'Unable to create the customer. Please try again.',
            { resource: 'customer' },
          ),
        );
        setSubmitting(false);
        return;
      }

      toast.success(isEdit ? 'Customer updated' : 'Customer created');
      const id = isEdit ? customerId : result.data.customer?.id;
      router.push(`/dashboard/customers/${encodeURIComponent(id)}`);
    } catch (err) {
      toast.error(
        messageFromCaughtError(err, 'Something went wrong. Please try again.'),
      );
      setSubmitting(false);
    }
  }

  async function handleForceSave() {
    setDuplicateBusy(true);
    try {
      const result = await save({ force: true });
      if (!result.ok) {
        toast.error(
          messageFromApiResult(result, 'Unable to save the customer. Please try again.', {
            resource: 'customer',
          }),
        );
        return;
      }
      toast.success(isEdit ? 'Customer updated' : 'Customer created');
      setDuplicateDialog(null);
      const id = isEdit ? customerId : result.data.customer?.id;
      router.push(`/dashboard/customers/${encodeURIComponent(id)}`);
    } catch (err) {
      toast.error(messageFromCaughtError(err, 'Something went wrong. Please try again.'));
    } finally {
      setDuplicateBusy(false);
    }
  }

  if (isEdit && loading) {
    return (
      <PageContainer>
        <LoadingState rows={4} label="Loading customer…" />
      </PageContainer>
    );
  }

  if (isEdit && (error || !customer)) {
    return (
      <PageContainer>
        <EmptyState
          title="Customer not found"
          description={error || 'This profile may have been removed.'}
          action={
            <Button href="/dashboard/customers" variant="secondary">
              Back to customers
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={isEdit ? 'Edit customer' : 'Add customer'}
        description={
          isEdit
            ? customerDisplayName(customer)
            : 'Create a guest profile for promo assignment and tracking.'
        }
        actions={
          <Button
            href={
              isEdit
                ? `/dashboard/customers/${encodeURIComponent(customerId)}`
                : '/dashboard/customers'
            }
            variant="secondary"
            size="sm"
          >
            Cancel
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4">
        <FormSection title="Contact" description="Primary guest details.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="firstName" required>
                First name
              </FieldLabel>
              <input
                id="firstName"
                value={form.firstName}
                onChange={(event) => setField('firstName', event.target.value)}
                className={DASH_INPUT_CLASS}
                autoComplete="given-name"
              />
              <FieldError message={fieldErrors.firstName} />
            </div>
            <div>
              <FieldLabel htmlFor="lastName">Last name</FieldLabel>
              <input
                id="lastName"
                value={form.lastName}
                onChange={(event) => setField('lastName', event.target.value)}
                className={DASH_INPUT_CLASS}
                autoComplete="family-name"
              />
            </div>
            <div>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setField('email', event.target.value)}
                className={DASH_INPUT_CLASS}
                autoComplete="email"
              />
            </div>
            <div>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(event) => setField('phone', event.target.value)}
                className={DASH_INPUT_CLASS}
                autoComplete="tel"
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="company">Company</FieldLabel>
              <input
                id="company"
                value={form.company}
                onChange={(event) => setField('company', event.target.value)}
                className={DASH_INPUT_CLASS}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Tags" description="Segment guests for filtering and reporting.">
          <div className="flex flex-wrap gap-2">
            {CUSTOMER_TAG_OPTIONS.map((tag) => {
              const active = form.tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-[var(--dash-navy)] text-white'
                      : 'bg-[var(--dash-surface-2)] text-[var(--dash-muted)] hover:text-[var(--dash-ink)]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </FormSection>

        <FormSection
          title="Internal notes"
          description="Visible to operators only — not shared with guests."
        >
          <textarea
            id="notes"
            value={form.notes}
            onChange={(event) => setField('notes', event.target.value)}
            rows={4}
            className={`${DASH_INPUT_CLASS} min-h-[6rem] py-2`}
            placeholder="Add context for your team…"
          />
        </FormSection>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            href={
              isEdit
                ? `/dashboard/customers/${encodeURIComponent(customerId)}`
                : '/dashboard/customers'
            }
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create customer'}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={Boolean(duplicateDialog)}
        title="Possible duplicate"
        description={
          duplicateDialog ? (
            <span>
              {duplicateDialog.message || 'A customer with this email or phone may already exist.'}
              {duplicateDialog.duplicates?.length ? (
                <ul className="mt-3 space-y-1 text-left text-sm">
                  {duplicateDialog.duplicates.map((dup) => (
                    <li key={dup.id}>
                      <Link
                        href={`/dashboard/customers/${encodeURIComponent(dup.id)}`}
                        className="font-medium text-[var(--dash-accent)] hover:underline"
                      >
                        {customerDisplayName(dup)}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </span>
          ) : null
        }
        confirmLabel="Continue anyway"
        variant="primary"
        busy={duplicateBusy}
        cancelLabel="Go back"
        onCancel={() => {
          if (!duplicateBusy) setDuplicateDialog(null);
        }}
        onConfirm={handleForceSave}
      />
    </PageContainer>
  );
}

export default function CustomerFormPage({ mode = 'create', customerId = '' }) {
  const permission =
    mode === 'edit' ? PERMISSIONS.CUSTOMERS_EDIT : PERMISSIONS.CUSTOMERS_CREATE;

  return (
    <AuthGate permission={permission}>
      <CustomerFormInner mode={mode} customerId={customerId} />
    </AuthGate>
  );
}
