'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, ShieldOff } from 'lucide-react';
import * as campaignService from '../../lib/api/campaignService';
import {
  fieldErrorsFromApiResult,
  messageFromApiResult,
  messageFromCaughtError,
  messageFromGenerationError,
} from '../../lib/api/errors';
import {
  CODE_QUANTITY_PRESETS,
  formatCodeExample,
  MAX_GENERATE_QUANTITY,
} from '../../lib/dashboard/campaignCodeGeneration';
import {
  DISCOUNT_TYPES,
  formatDiscountDisplay,
  getDiscountTypeMeta,
} from '../../lib/dashboard/campaignDiscount';
import {
  applyCampaignFormField,
  buildCampaignPayload,
  CREATE_WIZARD_STEPS,
  createEmptyCampaignForm,
  DEFER_GENERATION_THRESHOLD,
  getGenerateRequestFromForm,
  validateCampaignForm,
} from '../../lib/dashboard/campaignForm';
import { CAMPAIGN_PURPOSE_OPTIONS, CAMPAIGN_PURPOSE_OTHER } from '../../lib/dashboard/campaignPurposes';
import { USAGE_MODES } from '../../lib/dashboard/campaignUsage';
import { DASH_INPUT_CLASS, DASH_SELECT_CLASS } from '../../lib/dashboard/styles';
import { formatDate, formatNumber } from '../../lib/format';
import FormSection from './FormSection';
import { Button, EmptyState, PageContainer, PageHeader } from './ui';
import { useToast } from './ToastProvider';
import { useActiveTemplates } from '../../hooks/useActiveTemplates';
import {
  useCampaignPermissions,
  usePromoCodePermissions,
} from './WorkspaceProvider';

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

function usageLabel(form) {
  if (form.usageMode === 'UNLIMITED') return 'Unlimited';
  if (form.usageMode === 'SINGLE') return 'Single Use';
  return `Multiple Use · max ${form.maxUses}`;
}

export default function CampaignCreateWizard() {
  const router = useRouter();
  const toast = useToast();
  const campaignsPerm = useCampaignPermissions();
  const promoPerm = usePromoCodePermissions();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(() => createEmptyCampaignForm());
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const step = CREATE_WIZARD_STEPS[stepIndex];
  const discountMeta = useMemo(
    () => getDiscountTypeMeta(form.discountType),
    [form.discountType],
  );
  const generateRequest = promoPerm.generate
    ? getGenerateRequestFromForm(form)
    : null;
  const { items: activeTemplates, loading: templatesLoading } = useActiveTemplates();

  function templateLabel(templateId) {
    if (!templateId) return 'Default template';
    const match = activeTemplates.find((t) => t.id === templateId);
    return match?.name || templateId;
  }

  function setField(key, value) {
    setForm((prev) => applyCampaignFormField(prev, key, value));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      if (key === 'discountType') delete next.discountValue;
      if (key === 'usageMode') delete next.maxUses;
      if (key === 'quantityPreset' || key === 'customQuantity' || key === 'generateEnabled') {
        delete next.quantity;
      }
      return next;
    });
  }

  function validateCurrentStep() {
    const errors = validateCampaignForm(form, step.id);
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function goNext() {
    if (!validateCurrentStep()) {
      toast.error('Please fix the highlighted fields.');
      return;
    }
    setStepIndex((i) => Math.min(i + 1, CREATE_WIZARD_STEPS.length - 1));
  }

  function goBack() {
    setFieldErrors({});
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function handleCreate() {
    const errors = validateCampaignForm(form, 'all');
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      toast.error('Please fix the highlighted fields.');
      const firstStep = CREATE_WIZARD_STEPS.findIndex((s) => {
        if (s.id === 'review') return false;
        return Object.keys(validateCampaignForm(form, s.id)).length > 0;
      });
      if (firstStep >= 0) setStepIndex(firstStep);
      return;
    }

    setSubmitting(true);
    try {
      const quantity = generateRequest?.quantity || 0;
      const deferGeneration = quantity > DEFER_GENERATION_THRESHOLD;
      const payload = buildCampaignPayload(form, {
        editing: false,
        deferGeneration,
      });

      const result = await campaignService.createCampaign(payload);
      if (!result.ok) {
        const apiFields = fieldErrorsFromApiResult(result);
        if (Object.keys(apiFields).length) {
          setFieldErrors((prev) => ({ ...prev, ...apiFields }));
          const stepForField = {
            name: 'basic',
            purpose: 'basic',
            purposeOther: 'basic',
            discountType: 'discount',
            discountValue: 'discount',
            startsAt: 'validity',
            endsAt: 'validity',
            expiresAt: 'validity',
            maxUses: 'usage',
            usageMode: 'usage',
            quantity: 'codes',
            prefix: 'codes',
          };
          const firstField = Object.keys(apiFields)[0];
          const stepId = stepForField[firstField];
          const idx = CREATE_WIZARD_STEPS.findIndex((s) => s.id === stepId);
          if (idx >= 0) setStepIndex(idx);
        }
        toast.error(
          messageFromApiResult(result, 'Unable to create the campaign. Please try again.', {
            resource: 'campaign',
          }),
        );
        return;
      }

      const campaign = result.data.campaign;
      const params = new URLSearchParams();

      if (result.data.generation?.generated) {
        params.set('generated', String(result.data.generation.generated));
      } else if (result.data.generationError) {
        params.set('genError', '1');
        toast.error(
          messageFromGenerationError(
            result.data.generationError,
            'Campaign created, but promo code generation failed. Please try again.',
          ),
        );
      } else if (deferGeneration && generateRequest) {
        params.set('generateQty', String(generateRequest.quantity));
        params.set('prefix', generateRequest.prefix);
      }

      const qs = params.toString();
      if (!result.data.generationError) {
        toast.success('Campaign created');
      }
      router.push(
        `/dashboard/campaigns/${encodeURIComponent(campaign.id)}${qs ? `?${qs}` : ''}`,
      );
    } catch (error) {
      toast.error(
        messageFromCaughtError(
          error,
          'Unable to create the campaign. Please try again.',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!campaignsPerm.create) {
    return (
      <PageContainer>
        <EmptyState
          icon={ShieldOff}
          title="You don’t have access"
          description="Your role can view campaigns, but creating campaigns requires campaigns:create (granted via campaigns:write)."
          action={
            <Button href="/dashboard/campaigns" variant="secondary">
              Back to campaigns
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Create campaign"
        description="Configure the offer, rules, and promo-code generation, then review before creating."
        actions={
          <Button href="/dashboard/campaigns" variant="secondary">
            Cancel
          </Button>
        }
      />

      <nav aria-label="Create campaign steps" className="dash-panel p-3">
        <p className="mb-2 text-xs font-medium text-[var(--dash-muted)] sm:hidden">
          Step {stepIndex + 1} of {CREATE_WIZARD_STEPS.length}: {step.title}
        </p>
        <ol className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden">
          {CREATE_WIZARD_STEPS.map((item, index) => {
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
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-black/10 text-[10px]">
                    {done ? <Check className="size-3" /> : index + 1}
                  </span>
                  <span className="hidden sm:inline">{item.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="space-y-4">
        {step.id === 'basic' ? (
          <FormSection
            title="Basic information"
            description="Name the promotion and choose what it is for."
          >
            <div>
              <FieldLabel htmlFor="wiz-name" required>
                Promo name
              </FieldLabel>
              <input
                id="wiz-name"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Christmas Offer"
                aria-invalid={Boolean(fieldErrors.name)}
                className={DASH_INPUT_CLASS}
              />
              <FieldError message={fieldErrors.name} />
            </div>
            <div>
              <FieldLabel htmlFor="wiz-purpose" required>
                Purpose
              </FieldLabel>
              <select
                id="wiz-purpose"
                value={form.purpose}
                onChange={(e) => setField('purpose', e.target.value)}
                className={DASH_SELECT_CLASS}
              >
                <option value="" disabled>
                  Select purpose…
                </option>
                {CAMPAIGN_PURPOSE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <FieldError message={fieldErrors.purpose} />
            </div>
            {form.purpose === CAMPAIGN_PURPOSE_OTHER ? (
              <div>
                <FieldLabel htmlFor="wiz-purpose-other" required>
                  Describe purpose
                </FieldLabel>
                <input
                  id="wiz-purpose-other"
                  value={form.purposeOther}
                  onChange={(e) => setField('purposeOther', e.target.value)}
                  className={DASH_INPUT_CLASS}
                />
                <FieldError message={fieldErrors.purposeOther} />
              </div>
            ) : null}
            <div>
              <FieldLabel htmlFor="wiz-status">Initial status</FieldLabel>
              <select
                id="wiz-status"
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                className={DASH_SELECT_CLASS}
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="wiz-template">Voucher template</FieldLabel>
              <select
                id="wiz-template"
                value={form.templateId}
                onChange={(e) => setField('templateId', e.target.value)}
                disabled={templatesLoading}
                className={DASH_SELECT_CLASS}
              >
                <option value="">Default template</option>
                {activeTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[var(--dash-muted)]">
                Optional. Uses workspace default when empty.
              </p>
            </div>
          </FormSection>
        ) : null}

        {step.id === 'discount' ? (
          <FormSection title="Discount" description="Configure the offer discount.">
            <div>
              <FieldLabel htmlFor="wiz-discount-type" required>
                Discount type
              </FieldLabel>
              <select
                id="wiz-discount-type"
                value={form.discountType}
                onChange={(e) => setField('discountType', e.target.value)}
                className={DASH_SELECT_CLASS}
              >
                {DISCOUNT_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldError message={fieldErrors.discountType} />
            </div>
            {discountMeta ? (
              <div>
                <FieldLabel htmlFor="wiz-discount-value" required>
                  {discountMeta.valueLabel}
                </FieldLabel>
                <input
                  id="wiz-discount-value"
                  type={
                    form.discountType === 'PERCENTAGE' || form.discountType === 'FIXED_AMOUNT'
                      ? 'number'
                      : 'text'
                  }
                  value={form.discountValue}
                  onChange={(e) => setField('discountValue', e.target.value)}
                  placeholder={discountMeta.placeholder}
                  className={DASH_INPUT_CLASS}
                />
                <FieldError message={fieldErrors.discountValue} />
              </div>
            ) : null}
          </FormSection>
        ) : null}

        {step.id === 'validity' ? (
          <FormSection
            title="Validity"
            description="Campaign calendar window (UTC day bounds)."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="wiz-start" required>
                  Start date
                </FieldLabel>
                <input
                  id="wiz-start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setField('startDate', e.target.value)}
                  className={DASH_INPUT_CLASS}
                />
                <FieldError message={fieldErrors.startDate} />
              </div>
              <div>
                <FieldLabel htmlFor="wiz-end" required>
                  End date
                </FieldLabel>
                <input
                  id="wiz-end"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setField('endDate', e.target.value)}
                  className={DASH_INPUT_CLASS}
                />
                <FieldError message={fieldErrors.endDate} />
              </div>
            </div>
          </FormSection>
        ) : null}

        {step.id === 'usage' ? (
          <FormSection title="Usage rules" description="How codes from this campaign can be redeemed.">
            <div>
              <FieldLabel htmlFor="wiz-usage" required>
                Usage
              </FieldLabel>
              <select
                id="wiz-usage"
                value={form.usageMode}
                onChange={(e) => setField('usageMode', e.target.value)}
                className={DASH_SELECT_CLASS}
              >
                {USAGE_MODES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldError message={fieldErrors.usageMode} />
            </div>
            {form.usageMode === 'SINGLE' || form.usageMode === 'MULTIPLE' ? (
              <div>
                <FieldLabel htmlFor="wiz-max-uses" required={form.usageMode === 'MULTIPLE'}>
                  Maximum uses
                </FieldLabel>
                <input
                  id="wiz-max-uses"
                  type="number"
                  min={form.usageMode === 'SINGLE' ? 1 : 2}
                  value={form.maxUses}
                  readOnly={form.usageMode === 'SINGLE'}
                  onChange={(e) => setField('maxUses', e.target.value)}
                  className={DASH_INPUT_CLASS}
                />
                <FieldError message={fieldErrors.maxUses} />
              </div>
            ) : (
              <p className="text-xs text-[var(--dash-muted)]">No maximum usage value required.</p>
            )}
          </FormSection>
        ) : null}

        {step.id === 'codes' ? (
          <FormSection
            title="Promo code quantity"
            description="Codes are generated securely on the server after the campaign is created."
          >
            {!promoPerm.generate ? (
              <p className="text-sm text-[var(--dash-muted)]">
                Your role can create campaigns, but generating promo codes requires
                promo-codes:generate. You can create the campaign without codes for now.
              </p>
            ) : (
              <>
            <label className="flex items-start gap-2 text-sm text-[var(--dash-ink-soft)]">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={form.generateEnabled}
                onChange={(e) => setField('generateEnabled', e.target.checked)}
              />
              <span>Generate promo codes after creating this campaign</span>
            </label>
            {form.generateEnabled ? (
              <>
                <div>
                  <FieldLabel htmlFor="wiz-qty" required>
                    Quantity
                  </FieldLabel>
                  <select
                    id="wiz-qty"
                    value={String(form.quantityPreset)}
                    onChange={(e) => {
                      const value = e.target.value;
                      setField(
                        'quantityPreset',
                        value === 'custom' ? 'custom' : Number(value),
                      );
                    }}
                    className={DASH_SELECT_CLASS}
                  >
                    {CODE_QUANTITY_PRESETS.map((option) => (
                      <option key={String(option.value)} value={String(option.value)}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FieldError message={fieldErrors.quantity} />
                  <p className="mt-1 text-xs text-[var(--dash-muted)]">
                    Batches over {DEFER_GENERATION_THRESHOLD} redirect first, then generate on the
                    server (max {MAX_GENERATE_QUANTITY.toLocaleString('en-US')}).
                  </p>
                </div>
                {form.quantityPreset === 'custom' ? (
                  <div>
                    <FieldLabel htmlFor="wiz-custom-qty" required>
                      Custom quantity
                    </FieldLabel>
                    <input
                      id="wiz-custom-qty"
                      type="number"
                      min={1}
                      max={MAX_GENERATE_QUANTITY}
                      value={form.customQuantity}
                      onChange={(e) => setField('customQuantity', e.target.value)}
                      className={DASH_INPUT_CLASS}
                    />
                  </div>
                ) : null}
                <div>
                  <FieldLabel htmlFor="wiz-prefix" required>
                    Code prefix
                  </FieldLabel>
                  <input
                    id="wiz-prefix"
                    value={form.codePrefix}
                    onChange={(e) => setField('codePrefix', e.target.value)}
                    className={`${DASH_INPUT_CLASS} font-mono uppercase`}
                    maxLength={12}
                  />
                  <FieldError message={fieldErrors.codePrefix} />
                  <p className="mt-1 text-xs text-[var(--dash-muted)]">
                    Example format:{' '}
                    <span className="font-mono">{formatCodeExample(form.codePrefix)}</span>
                  </p>
                </div>
              </>
            ) : null}
              </>
            )}
          </FormSection>
        ) : null}

        {step.id === 'review' ? (
          <FormSection
            title="Review"
            description="Confirm the configuration before creating the campaign."
          >
            <dl className="divide-y divide-[var(--dash-border)] rounded-xl border border-[var(--dash-border)]">
              {[
                { label: 'Campaign', value: form.name || '—' },
                { label: 'Purpose', value: form.purpose === 'Other' ? form.purposeOther : form.purpose || '—' },
                {
                  label: 'Discount',
                  value: formatDiscountDisplay(form.discountType, form.discountValue),
                },
                {
                  label: 'Validity',
                  value: `${formatDate(`${form.startDate}T00:00:00.000Z`) || form.startDate} → ${formatDate(`${form.endDate}T00:00:00.000Z`) || form.endDate}`,
                },
                { label: 'Usage', value: usageLabel(form) },
                {
                  label: 'Promo codes',
                  value: form.generateEnabled
                    ? formatNumber(generateRequest?.quantity, { fallback: '—' })
                    : 'None at creation',
                },
                {
                  label: 'Code format',
                  value: form.generateEnabled
                    ? formatCodeExample(form.codePrefix)
                    : '—',
                },
                { label: 'Status', value: form.status },
                { label: 'Voucher template', value: templateLabel(form.templateId) },
              ].map((row) => (
                <div
                  key={row.label}
                  className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4"
                >
                  <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
                    {row.label}
                  </dt>
                  <dd className="text-sm font-medium text-[var(--dash-ink)]">{row.value}</dd>
                </div>
              ))}
            </dl>
          </FormSection>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={stepIndex === 0 ? () => router.push('/dashboard/campaigns') : goBack}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        {step.id === 'review' ? (
          <Button
            type="button"
            disabled={submitting}
            loading={submitting}
            onClick={handleCreate}
          >
            {submitting ? 'Creating...' : 'Create Campaign'}
          </Button>
        ) : (
          <Button type="button" onClick={goNext}>
            Continue
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </PageContainer>
  );
}
