'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Bold,
  Check,
  Italic,
  Link2,
  Monitor,
  ShieldOff,
  Smartphone,
} from 'lucide-react';
import { PERMISSIONS } from '../../lib/permissions';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useActiveTemplates } from '../../hooks/useActiveTemplates';
import { useEmailCampaign } from '../../hooks/useEmailCampaign';
import * as emailCampaignService from '../../lib/api/emailCampaignService';
import {
  fieldErrorsFromApiResult,
  messageFromApiResult,
  messageFromCaughtError,
} from '../../lib/api/errors';
import {
  buildEmailCampaignPayload,
  buildPreviewPayload,
  buildScheduledAt,
  campaignToEmailForm,
  createEmptyEmailCampaignForm,
  EMAIL_WIZARD_STEPS,
  insertHtmlAtCursor,
  isEmailCampaignEditable,
  PROMO_MODES,
  validateEmailCampaignForm,
} from '../../lib/dashboard/emailCampaignForm';
import { resolveEmailSegments } from '../../lib/dashboard/emailCampaignSegments';
import { EMAIL_VARIABLE_OPTIONS } from '../../lib/dashboard/emailVariables';
import { buildSamplePreviewContext } from '../../lib/dashboard/voucherVariables';
import { CAMPAIGN_LIST_LIMIT } from '../../lib/dashboard/constants';
import { DASH_INPUT_CLASS, DASH_SELECT_CLASS } from '../../lib/dashboard/styles';
import FormSection from './FormSection';
import VoucherPreview from './voucher/VoucherPreview';
import AuthGate from './AuthGate';
import ConfirmDialog from './ConfirmDialog';
import { ApiErrorBanner } from './AlertBanner';
import { useToast } from './ToastProvider';
import { useEmailCampaignPermissions, useTenant } from './WorkspaceProvider';
import { useBrandingSettings } from '../../hooks/useBranding';
import { workspacePreviewBranding } from '../../lib/dashboard/workspacePreviewBranding';
import {
  Button,
  EmptyState,
  LoadingState,
  PageContainer,
  PageHeader,
} from './ui';

function FieldLabel({ htmlFor, children, required = false, hint }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
      {children}
      {required ? <span className="ml-0.5 text-rose-600">*</span> : null}
      {hint ? <span className="ml-2 font-normal text-[var(--dash-muted)]">({hint})</span> : null}
    </label>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-700">{message}</p>;
}

function EmailCampaignWizardInner({ campaignId = null }) {
  const router = useRouter();
  const toast = useToast();
  const perm = useEmailCampaignPermissions();
  const tenant = useTenant();
  const { branding: workspaceBranding } = useBrandingSettings();
  const editing = Boolean(campaignId);
  const bodyRef = useRef(null);

  const [meta, setMeta] = useState(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState('');

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(() => createEmptyEmailCampaignForm());
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [audiencePreview, setAudiencePreview] = useState(null);
  const [audienceLoading, setAudienceLoading] = useState(false);

  const [emailPreview, setEmailPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');

  const [testEmail, setTestEmail] = useState('');
  const [testBusy, setTestBusy] = useState(false);

  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const {
    campaign,
    loading: campaignLoading,
    error: campaignError,
    errorResult: campaignErrorResult,
    updateEmailCampaign,
  } = useEmailCampaign(campaignId, { enabled: editing });

  const {
    items: tenantCampaigns,
    loading: campaignsLoading,
    error: campaignsError,
    errorResult: campaignsErrorResult,
    reload: reloadCampaigns,
  } = useCampaigns({
    limit: CAMPAIGN_LIST_LIMIT,
  });

  const promotionOptions = useMemo(
    () =>
      (tenantCampaigns || []).filter(
        (c) => c.status === 'ACTIVE' || c.status === 'DRAFT',
      ),
    [tenantCampaigns],
  );

  const promotionContext = useMemo(
    () => ({ promotionCampaigns: promotionOptions }),
    [promotionOptions],
  );

  const { items: activeTemplates, loading: templatesLoading } = useActiveTemplates();

  const segments = useMemo(
    () => resolveEmailSegments(meta?.segments),
    [meta?.segments],
  );

  const step = EMAIL_WIZARD_STEPS[stepIndex];

  const selectedTemplate = useMemo(
    () => activeTemplates.find((t) => t.id === form.voucherTemplateId) || null,
    [activeTemplates, form.voucherTemplateId],
  );

  const voucherContext = useMemo(
    () =>
      buildSamplePreviewContext(
        workspacePreviewBranding(tenant, workspaceBranding),
      ),
    [tenant, workspaceBranding],
  );

  useEffect(() => {
    let cancelled = false;
    async function loadMeta() {
      setMetaLoading(true);
      const result = await emailCampaignService.getEmailCampaignMeta();
      if (cancelled) return;
      if (!result.ok) {
        setMetaError(
          messageFromApiResult(result, 'Unable to load email campaign settings. Please try again.'),
        );
      } else {
        setMeta(result.data);
        if (!editing) {
          setForm((prev) => ({
            ...prev,
            fromName: prev.fromName || result.data?.sender?.name || '',
            bodyHtml: prev.bodyHtml || result.data?.defaultBodyHtml || '',
            timezone: result.data?.timezoneDefault || 'Africa/Accra',
          }));
        }
      }
      setMetaLoading(false);
    }
    loadMeta();
    return () => {
      cancelled = true;
    };
  }, [editing]);

  useEffect(() => {
    if (editing && campaign && meta) {
      if (!isEmailCampaignEditable(campaign.status)) {
        router.replace(`/dashboard/email-campaigns/${encodeURIComponent(campaign.id)}`);
        return;
      }
      setForm(campaignToEmailForm(campaign, meta));
    }
  }, [editing, campaign, meta, router]);

  const loadAudiencePreview = useCallback(async () => {
    setAudienceLoading(true);
    const result = await emailCampaignService.previewEmailCampaignAudience({
      audience: form.audience,
    });
    if (result.ok) {
      setAudiencePreview(result.data.preview || null);
    } else {
      setAudiencePreview(null);
    }
    setAudienceLoading(false);
  }, [form.audience]);

  useEffect(() => {
    if (step.id !== 'audience') return undefined;
    const timer = setTimeout(loadAudiencePreview, 400);
    return () => clearTimeout(timer);
  }, [step.id, loadAudiencePreview]);

  const loadEmailPreview = useCallback(async () => {
    setPreviewLoading(true);
    const payload = buildPreviewPayload(form);
    const result = editing
      ? await emailCampaignService.previewEmailCampaign(campaignId, payload)
      : await emailCampaignService.previewEmailCampaign(payload);
    if (result.ok) {
      setEmailPreview(result.data);
    } else {
      setEmailPreview(null);
      toast.error(
        messageFromApiResult(result, 'Unable to load email preview. Please try again.'),
      );
    }
    setPreviewLoading(false);
  }, [form, editing, campaignId, toast]);

  useEffect(() => {
    if (step.id !== 'preview') return undefined;
    const timer = setTimeout(loadEmailPreview, 300);
    return () => clearTimeout(timer);
  }, [step.id, loadEmailPreview]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function selectSegment(segmentId) {
    const segment = segments.find((s) => s.id === segmentId);
    if (!segment) return;
    setForm((prev) => ({
      ...prev,
      segmentId,
      audience: segment.audience,
    }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.audience;
      return next;
    });
  }

  function validateCurrentStep() {
    const errors = validateEmailCampaignForm(form, step.id, promotionContext);
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function goNext() {
    if (!validateCurrentStep()) {
      toast.error('Please fix the highlighted fields.');
      return;
    }
    setStepIndex((i) => Math.min(i + 1, EMAIL_WIZARD_STEPS.length - 1));
  }

  function goBack() {
    setFieldErrors({});
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function updateBodyHtml(valueOrFn) {
    if (typeof valueOrFn === 'function') {
      setForm((prev) => ({ ...prev, bodyHtml: valueOrFn(prev.bodyHtml) }));
    } else {
      setField('bodyHtml', valueOrFn);
    }
  }

  useEffect(() => {
    if (step.id !== 'promotion' || form.promotionCampaignId || !promotionOptions.length) {
      return undefined;
    }
    const preferred =
      promotionOptions.find((c) => c.isDefault && c.status === 'ACTIVE') ||
      promotionOptions.find((c) => c.status === 'ACTIVE') ||
      promotionOptions[0];
    if (preferred?.id) {
      setField('promotionCampaignId', preferred.id);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-pick once when options load
  }, [step.id, promotionOptions, form.promotionCampaignId]);

  async function saveDraft({ silent = false } = {}) {
    const errors = validateEmailCampaignForm(form, 'all', promotionContext);
    if (!form.name.trim()) {
      errors.name = 'Campaign name is required';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      if (!silent) toast.error('Please fix the highlighted fields before saving.');
      return null;
    }

    setSubmitting(true);
    try {
      const payload = buildEmailCampaignPayload(form);
      const result = editing
        ? await updateEmailCampaign(payload)
        : await emailCampaignService.createEmailCampaign(payload);
      if (!result.ok) {
        const apiFields = fieldErrorsFromApiResult(result);
        if (Object.keys(apiFields).length) setFieldErrors((prev) => ({ ...prev, ...apiFields }));
        toast.error(
          messageFromApiResult(result, 'Unable to save the email campaign. Please try again.', {
            resource: 'email campaign',
          }),
        );
        return null;
      }
      if (!silent) toast.success(editing ? 'Draft saved' : 'Email campaign created');
      return result.data.campaign;
    } catch (err) {
      if (!silent) {
        toast.error(messageFromCaughtError(err, 'Unable to save the email campaign. Please try again.'));
      }
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendTest() {
    if (!testEmail.trim()) {
      toast.error('Enter a test email address.');
      return;
    }
    setTestBusy(true);
    try {
      const payload = { ...buildPreviewPayload(form), toEmail: testEmail.trim() };
      const result = editing
        ? await emailCampaignService.sendEmailCampaignTest(campaignId, payload)
        : await emailCampaignService.sendEmailCampaignTest(payload);
      if (!result.ok) {
        toast.error(messageFromApiResult(result, 'Unable to send test email. Please try again.'));
        return;
      }
      if (result.data?.dryRun || result.data?.skipped) {
        toast.success('Test email preview generated (email provider not configured).');
      } else {
        toast.success('Test email sent');
      }
    } catch (err) {
      toast.error(messageFromCaughtError(err, 'Unable to send test email. Please try again.'));
    } finally {
      setTestBusy(false);
    }
  }

  async function finalizeSend({ schedule = false } = {}) {
    setConfirmBusy(true);
    try {
      let targetId = campaignId;
      if (!targetId) {
        const saved = await saveDraft({ silent: true });
        if (!saved?.id) return;
        targetId = saved.id;
      } else {
        const payload = buildEmailCampaignPayload(form);
        const updateResult = await updateEmailCampaign(payload);
        if (!updateResult.ok) {
          toast.error(messageFromApiResult(updateResult, 'Unable to save changes before sending.'));
          return;
        }
      }

      if (schedule) {
        const scheduledAt = buildScheduledAt(form);
        const result = await emailCampaignService.scheduleEmailCampaign(targetId, {
          scheduledAt,
          timezone: form.timezone,
        });
        if (!result.ok) {
          toast.error(messageFromApiResult(result, 'Unable to schedule the email campaign.'));
          return;
        }
        toast.success('Email campaign scheduled');
        router.push(`/dashboard/email-campaigns/${encodeURIComponent(targetId)}`);
        return;
      }

      const idempotencyKey =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `send-${Date.now()}`;
      const result = await emailCampaignService.sendEmailCampaignNow(targetId, {
        idempotencyKey,
      });
      if (!result.ok) {
        toast.error(messageFromApiResult(result, 'Unable to send the email campaign.'));
        return;
      }
      toast.success('Send started');
      router.push(`/dashboard/email-campaigns/${encodeURIComponent(targetId)}`);
    } finally {
      setConfirmBusy(false);
      setConfirm(null);
    }
  }

  if ((!editing && !perm.create) || (editing && !perm.edit)) {
    return (
      <PageContainer>
        <EmptyState
          icon={ShieldOff}
          title="You don’t have access"
          description="Creating email campaigns requires email-campaigns:create."
          action={
            <Button href="/dashboard/email-campaigns" variant="secondary">
              Back
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (editing && campaignLoading) {
    return (
      <PageContainer>
        <LoadingState label="Loading email campaign…" />
      </PageContainer>
    );
  }

  if (editing && campaignError) {
    return (
      <PageContainer>
        <ApiErrorBanner message={campaignError} result={campaignErrorResult} />
        <Button href="/dashboard/email-campaigns" variant="secondary" className="mt-4">
          Back
        </Button>
      </PageContainer>
    );
  }

  if (metaLoading) {
    return (
      <PageContainer>
        <LoadingState label="Loading settings…" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={editing ? 'Edit email campaign' : 'Create email campaign'}
        description="Choose an audience, attach a promotion and voucher, then preview before sending."
        actions={
          <Button href="/dashboard/email-campaigns" variant="secondary">
            Cancel
          </Button>
        }
      />

      {metaError ? <ApiErrorBanner message={metaError} className="mb-4" /> : null}

      <nav aria-label="Email campaign steps" className="dash-panel mb-6 p-3">
        <p className="mb-2 text-xs font-medium text-[var(--dash-muted)] sm:hidden">
          Step {stepIndex + 1} of {EMAIL_WIZARD_STEPS.length}: {step.title}
        </p>
        <ol className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden">
          {EMAIL_WIZARD_STEPS.map((item, index) => {
            const active = index === stepIndex;
            const done = index < stepIndex;
            return (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (index < stepIndex) {
                      setFieldErrors({});
                      setStepIndex(index);
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold transition sm:px-3 ${
                    active
                      ? 'bg-[var(--dash-navy)] text-white'
                      : done
                        ? 'bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]'
                        : 'bg-[var(--dash-surface-2)] text-[var(--dash-muted)]'
                  }`}
                >
                  <span
                    className={`inline-flex size-5 items-center justify-center rounded-full text-[10px] ${
                      active ? 'bg-white/20' : done ? 'bg-[var(--dash-accent)]/15' : 'bg-black/5'
                    }`}
                  >
                    {done ? <Check className="size-3" aria-hidden /> : index + 1}
                  </span>
                  <span className="hidden sm:inline">{item.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {step.id === 'audience' ? (
        <FormSection title="Audience" description="Choose who receives this email campaign.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {segments.map((segment) => {
              const selected = form.segmentId === segment.id;
              return (
                <button
                  key={segment.id}
                  type="button"
                  onClick={() => selectSegment(segment.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-soft)]'
                      : 'border-[var(--dash-border)] hover:border-[var(--dash-accent)]/40'
                  }`}
                >
                  <p className="font-medium text-[var(--dash-ink)]">{segment.label}</p>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  segmentId: 'manual',
                  audience: { type: 'manual', customerIds: [] },
                }))
              }
              className={`rounded-xl border p-4 text-left transition ${
                form.segmentId === 'manual'
                  ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-soft)]'
                  : 'border-[var(--dash-border)] hover:border-[var(--dash-accent)]/40'
              }`}
            >
              <p className="font-medium text-[var(--dash-ink)]">Manual selection</p>
              <p className="mt-1 text-xs text-[var(--dash-muted)]">
                Use customer IDs via API — manual picker coming later.
              </p>
            </button>
          </div>

          <div className="mt-6">
            <FieldLabel htmlFor="promoMode">Promo assignment</FieldLabel>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {PROMO_MODES.map((mode) => (
                <label
                  key={mode.value}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                    form.promoMode === mode.value
                      ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-soft)]'
                      : 'border-[var(--dash-border)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="promoMode"
                    value={mode.value}
                    checked={form.promoMode === mode.value}
                    onChange={() => setField('promoMode', mode.value)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium text-[var(--dash-ink)]">
                      {mode.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--dash-muted)]">
                      {mode.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 dash-panel p-4">
            <p className="text-sm font-medium text-[var(--dash-ink)]">Audience preview</p>
            {audienceLoading ? (
              <p className="mt-2 text-sm text-[var(--dash-muted)]">Calculating…</p>
            ) : audiencePreview ? (
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[var(--dash-muted)]">Selected</dt>
                  <dd className="font-medium">{audiencePreview.totalSelected ?? 0}</dd>
                </div>
                <div>
                  <dt className="text-[var(--dash-muted)]">Valid emails</dt>
                  <dd className="font-medium">{audiencePreview.validEmailCount ?? 0}</dd>
                </div>
                <div>
                  <dt className="text-[var(--dash-muted)]">Excluded</dt>
                  <dd className="font-medium">{audiencePreview.excludedCount ?? 0}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-2 text-sm text-[var(--dash-muted)]">Preview unavailable.</p>
            )}
          </div>
          <FieldError message={fieldErrors.audience} />
        </FormSection>
      ) : null}

      {step.id === 'promotion' ? (
        <FormSection
          title="Promotion"
          description="Link a voucher/promotion campaign from your workspace. Only Active campaigns can be used when sending."
        >
          {campaignsError ? (
            <ApiErrorBanner
              message={campaignsError}
              result={campaignsErrorResult}
              className="mb-3"
            />
          ) : null}
          {campaignsLoading ? (
            <LoadingState label="Loading promotions…" />
          ) : promotionOptions.length === 0 ? (
            <EmptyState
              title="No promotion campaigns yet"
              description="Create a promotion campaign first — set status to Active before you send this email."
              action={
                <Button href="/dashboard/campaigns" variant="secondary">
                  Go to Campaigns
                </Button>
              }
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <FieldLabel htmlFor="promotionCampaignId" required>
                  Promotion campaign
                </FieldLabel>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => reloadCampaigns()}
                >
                  Refresh list
                </Button>
              </div>
              <select
                id="promotionCampaignId"
                value={
                  promotionOptions.some((c) => c.id === form.promotionCampaignId)
                    ? form.promotionCampaignId
                    : ''
                }
                onChange={(e) => setField('promotionCampaignId', e.target.value)}
                className={DASH_SELECT_CLASS}
              >
                <option value="">Select a campaign…</option>
                {promotionOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.offerTitle ? ` — ${c.offerTitle}` : ''}
                    {c.status !== 'ACTIVE' ? ` [${c.status}]` : ''}
                    {c.isDefault ? ' · default' : ''}
                  </option>
                ))}
              </select>
              {form.promotionCampaignId &&
              promotionOptions.find((c) => c.id === form.promotionCampaignId)?.status ===
                'DRAFT' ? (
                <p className="mt-2 text-xs text-amber-800">
                  This campaign is still a draft. Activate it under{' '}
                  <a href="/dashboard/campaigns" className="font-medium underline">
                    Campaigns
                  </a>{' '}
                  before you send this email.
                </p>
              ) : null}
              <FieldError message={fieldErrors.promotionCampaignId} />
            </>
          )}
        </FormSection>
      ) : null}

      {step.id === 'voucher' ? (
        <FormSection title="Voucher template" description="Choose how the promo appears in the email.">
          {templatesLoading ? (
            <LoadingState label="Loading templates…" />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <FieldLabel htmlFor="voucherTemplateId" required>
                  Template
                </FieldLabel>
                <select
                  id="voucherTemplateId"
                  value={form.voucherTemplateId}
                  onChange={(e) => setField('voucherTemplateId', e.target.value)}
                  className={DASH_SELECT_CLASS}
                >
                  <option value="">Select a template…</option>
                  {activeTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <FieldError message={fieldErrors.voucherTemplateId} />
              </div>
              {selectedTemplate ? (
                <div className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-white p-3">
                  <VoucherPreview
                    config={selectedTemplate.config}
                    logoUrl={selectedTemplate.logoUrl}
                    backgroundUrl={selectedTemplate.backgroundUrl}
                    context={voucherContext}
                    compact
                    showSampleBadge
                  />
                </div>
              ) : null}
            </div>
          )}
        </FormSection>
      ) : null}

      {step.id === 'content' ? (
        <FormSection title="Email content" description="Compose the message customers receive.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="fromName" hint="display name">
                From name
              </FieldLabel>
              <input
                id="fromName"
                value={form.fromName}
                onChange={(e) => setField('fromName', e.target.value)}
                className={DASH_INPUT_CLASS}
              />
              {meta?.sender?.email ? (
                <p className="mt-1 text-xs text-[var(--dash-muted)]">
                  Emails send from {meta.sender.email} (configured in Brevo)
                </p>
              ) : null}
            </div>
            <div>
              <FieldLabel htmlFor="replyTo">Reply-to</FieldLabel>
              <input
                id="replyTo"
                type="email"
                value={form.replyTo}
                onChange={(e) => setField('replyTo', e.target.value)}
                className={DASH_INPUT_CLASS}
                placeholder="optional@example.com"
              />
            </div>
          </div>

          <div className="mt-4">
            <FieldLabel htmlFor="subject" required>
              Subject
            </FieldLabel>
            <input
              id="subject"
              value={form.subject}
              onChange={(e) => setField('subject', e.target.value)}
              className={DASH_INPUT_CLASS}
            />
            <FieldError message={fieldErrors.subject} />
          </div>

          <div className="mt-4">
            <FieldLabel htmlFor="previewText">Preview text</FieldLabel>
            <input
              id="previewText"
              value={form.previewText}
              onChange={(e) => setField('previewText', e.target.value)}
              className={DASH_INPUT_CLASS}
            />
          </div>

          <div className="mt-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <FieldLabel htmlFor="bodyHtml" required>
                Body (HTML)
              </FieldLabel>
              <div className="ml-auto flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  className="!px-2 !py-1 text-xs"
                  onClick={() => insertHtmlAtCursor(bodyRef.current, '<strong></strong>', updateBodyHtml)}
                >
                  <Bold className="size-3.5" aria-hidden /> Bold
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="!px-2 !py-1 text-xs"
                  onClick={() => insertHtmlAtCursor(bodyRef.current, '<em></em>', updateBodyHtml)}
                >
                  <Italic className="size-3.5" aria-hidden /> Italic
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="!px-2 !py-1 text-xs"
                  onClick={() =>
                    insertHtmlAtCursor(bodyRef.current, '<a href="https://"></a>', updateBodyHtml)
                  }
                >
                  <Link2 className="size-3.5" aria-hidden /> Link
                </Button>
                <select
                  className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-1 text-xs"
                  defaultValue=""
                  onChange={(e) => {
                    const token = e.target.value;
                    if (!token) return;
                    insertHtmlAtCursor(bodyRef.current, token, updateBodyHtml);
                    e.target.value = '';
                  }}
                >
                  <option value="">Insert variable…</option>
                  {EMAIL_VARIABLE_OPTIONS.map((v) => (
                    <option key={v.key} value={v.token}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              id="bodyHtml"
              ref={bodyRef}
              rows={14}
              value={form.bodyHtml}
              onChange={(e) => setField('bodyHtml', e.target.value)}
              className={`${DASH_INPUT_CLASS} font-mono text-xs`}
            />
            <FieldError message={fieldErrors.bodyHtml} />
          </div>
        </FormSection>
      ) : null}

      {step.id === 'preview' ? (
        <FormSection title="Preview" description="Review the rendered email with sample data.">
          <div className="mb-4 flex gap-2">
            <Button
              type="button"
              variant={previewDevice === 'desktop' ? 'primary' : 'secondary'}
              onClick={() => setPreviewDevice('desktop')}
            >
              <Monitor className="size-4" aria-hidden /> Desktop
            </Button>
            <Button
              type="button"
              variant={previewDevice === 'mobile' ? 'primary' : 'secondary'}
              onClick={() => setPreviewDevice('mobile')}
            >
              <Smartphone className="size-4" aria-hidden /> Mobile
            </Button>
          </div>

          {previewLoading ? (
            <LoadingState label="Rendering preview…" />
          ) : emailPreview?.email?.html ? (
            <>
              {emailPreview.notice ? (
                <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  {emailPreview.notice}
                </p>
              ) : null}
              <p className="mb-2 text-sm font-medium text-[var(--dash-ink)]">
                Subject: {emailPreview.email.subject}
              </p>
              <div
                className={`mx-auto overflow-hidden rounded-xl border border-[var(--dash-border)] bg-white ${
                  previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-3xl'
                }`}
              >
                <iframe
                  title="Email preview"
                  srcDoc={emailPreview.email.html}
                  className="h-[520px] w-full border-0"
                  sandbox=""
                />
              </div>
              <p className="mt-3 text-xs text-[var(--dash-muted)]">
                The voucher block in the email uses your selected template styling.
              </p>
            </>
          ) : (
            <EmptyState title="Preview unavailable" description="Go back and complete required fields." />
          )}
        </FormSection>
      ) : null}

      {step.id === 'schedule' ? (
        <FormSection title="Schedule & send" description="Save a draft, send a test, or launch the campaign.">
          <div className="mb-4">
            <FieldLabel htmlFor="name" required>
              Campaign name
            </FieldLabel>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              className={DASH_INPUT_CLASS}
              placeholder="e.g. Christmas VIP offer"
            />
            <FieldError message={fieldErrors.name} />
          </div>

          <fieldset className="mb-6">
            <legend className="text-sm font-medium text-[var(--dash-ink)]">When to send</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                  form.sendMode === 'immediate'
                    ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-soft)]'
                    : 'border-[var(--dash-border)]'
                }`}
              >
                <input
                  type="radio"
                  name="sendMode"
                  checked={form.sendMode === 'immediate'}
                  onChange={() => setField('sendMode', 'immediate')}
                />
                <span>
                  <span className="block text-sm font-medium">Send immediately</span>
                  <span className="text-xs text-[var(--dash-muted)]">Start sending after confirmation</span>
                </span>
              </label>
              <label
                className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                  form.sendMode === 'schedule'
                    ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-soft)]'
                    : 'border-[var(--dash-border)]'
                }`}
              >
                <input
                  type="radio"
                  name="sendMode"
                  checked={form.sendMode === 'schedule'}
                  onChange={() => setField('sendMode', 'schedule')}
                />
                <span>
                  <span className="block text-sm font-medium">Schedule</span>
                  <span className="text-xs text-[var(--dash-muted)]">Pick date, time, and timezone</span>
                </span>
              </label>
            </div>
          </fieldset>

          {form.sendMode === 'schedule' ? (
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div>
                <FieldLabel htmlFor="scheduledAt" required>
                  Date
                </FieldLabel>
                <input
                  id="scheduledAt"
                  type="date"
                  value={form.scheduledAt}
                  onChange={(e) => setField('scheduledAt', e.target.value)}
                  className={DASH_INPUT_CLASS}
                />
                <FieldError message={fieldErrors.scheduledAt} />
              </div>
              <div>
                <FieldLabel htmlFor="scheduledTime">Time</FieldLabel>
                <input
                  id="scheduledTime"
                  type="time"
                  value={form.scheduledTime}
                  onChange={(e) => setField('scheduledTime', e.target.value)}
                  className={DASH_INPUT_CLASS}
                />
              </div>
              <div>
                <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
                <input
                  id="timezone"
                  value={form.timezone}
                  onChange={(e) => setField('timezone', e.target.value)}
                  className={DASH_INPUT_CLASS}
                />
              </div>
            </div>
          ) : null}

          <div className="dash-panel mb-6 p-4">
            <FieldLabel htmlFor="testEmail">Send test email</FieldLabel>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className={`${DASH_INPUT_CLASS} flex-1`}
                placeholder="you@example.com"
              />
              <Button type="button" variant="secondary" disabled={testBusy} onClick={handleSendTest}>
                {testBusy ? 'Sending…' : 'Send test'}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" disabled={submitting} onClick={() => saveDraft()}>
              {submitting ? 'Saving…' : 'Save draft'}
            </Button>
            {perm.send && form.sendMode === 'immediate' ? (
              <Button
                type="button"
                disabled={submitting || confirmBusy}
                onClick={() => {
                  const errors = validateEmailCampaignForm(form, 'all', promotionContext);
                  setFieldErrors(errors);
                  if (Object.keys(errors).length) {
                    toast.error('Please fix the highlighted fields.');
                    return;
                  }
                  setConfirm({
                    title: 'Send email campaign now?',
                    description: 'Messages will be sent via the backend email provider. This cannot be undone.',
                    confirmLabel: 'Send now',
                    variant: 'primary',
                    run: () => finalizeSend({ schedule: false }),
                  });
                }}
              >
                Send now
              </Button>
            ) : null}
            {perm.schedule && form.sendMode === 'schedule' ? (
              <Button
                type="button"
                disabled={submitting || confirmBusy}
                onClick={() => {
                  const errors = validateEmailCampaignForm(form, 'all', promotionContext);
                  setFieldErrors(errors);
                  if (Object.keys(errors).length) {
                    toast.error('Please fix the highlighted fields.');
                    return;
                  }
                  setConfirm({
                    title: 'Schedule email campaign?',
                    description: `Campaign will send on ${form.scheduledAt} at ${form.scheduledTime} (${form.timezone}).`,
                    confirmLabel: 'Schedule',
                    variant: 'primary',
                    run: () => finalizeSend({ schedule: true }),
                  });
                }}
              >
                Schedule
              </Button>
            ) : null}
          </div>
        </FormSection>
      ) : null}

      {step.id !== 'schedule' ? (
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="secondary" disabled={stepIndex === 0} onClick={goBack}>
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Button>
          <Button type="button" onClick={goNext}>
            Next
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      ) : (
        <div className="mt-6">
          <Button type="button" variant="secondary" disabled={stepIndex === 0} onClick={goBack}>
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        description={confirm?.description}
        confirmLabel={confirm?.confirmLabel}
        variant={confirm?.variant || 'danger'}
        busy={confirmBusy || submitting}
        onConfirm={() => confirm?.run?.()}
        onCancel={() => setConfirm(null)}
      />
    </PageContainer>
  );
}

export default function EmailCampaignWizard({ campaignId = null }) {
  const permission = campaignId
    ? PERMISSIONS.EMAIL_CAMPAIGNS_EDIT
    : PERMISSIONS.EMAIL_CAMPAIGNS_CREATE;
  return (
    <AuthGate permission={permission}>
      <EmailCampaignWizardInner campaignId={campaignId} />
    </AuthGate>
  );
}
