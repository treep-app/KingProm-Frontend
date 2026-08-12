'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import * as campaignService from '../../lib/api/campaignService';
import {
  fieldErrorsFromApiResult,
  messageFromApiResult,
  messageFromCaughtError,
  messageFromGenerationError,
} from '../../lib/api/errors';
import { usePromoCodePermissions } from './WorkspaceProvider';
import {
  CODE_QUANTITY_PRESETS,
  formatCodeExample,
  MAX_GENERATE_QUANTITY,
  normalizeCodePrefix,
  resolveGenerateQuantity,
  suggestPrefixFromPurpose,
  validateCodeGenerationFields,
} from '../../lib/dashboard/campaignCodeGeneration';
import {
  buildOfferTitleFromDiscount,
  DISCOUNT_TYPES,
  getDiscountTypeMeta,
  validateDiscountFields,
} from '../../lib/dashboard/campaignDiscount';
import {
  dateInputToEndIso,
  dateInputToStartIso,
  toDateInputValue,
  validateValidityFields,
} from '../../lib/dashboard/campaignDates';
import {
  CAMPAIGN_PURPOSE_OPTIONS,
  CAMPAIGN_PURPOSE_OTHER,
  parsePurposeFromDescription,
  purposeToDescription,
} from '../../lib/dashboard/campaignPurposes';
import {
  resolveMaxUsesForPayload,
  USAGE_MODES,
  validateUsageFields,
} from '../../lib/dashboard/campaignUsage';
import { DASH_INPUT_CLASS, DASH_SELECT_CLASS } from '../../lib/dashboard/styles';
import FormSection from './FormSection';
import { Button } from './ui';
import { useToast } from './ToastProvider';
import { useActiveTemplates } from '../../hooks/useActiveTemplates';

function defaultDates() {
  const start = new Date();
  const end = new Date();
  end.setUTCDate(end.getUTCDate() + 30);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

const EMPTY = {
  id: '',
  name: '',
  purpose: '',
  purposeOther: '',
  discountType: 'PERCENTAGE',
  discountValue: '20',
  ...defaultDates(),
  usageMode: 'SINGLE',
  maxUses: '1',
  generateEnabled: true,
  quantityPreset: 100,
  customQuantity: '',
  codePrefix: 'HOTEL',
  prefixLocked: false,
  offerSubtitle: 'On your next overnight stay or event booking',
  offerTerms: '',
  status: 'ACTIVE',
  expiryMode: 'weekly',
  expiresIn: '1w',
  expiresAt: '',
  eventName: '',
  eventDate: '',
  isDefault: false,
  templateId: '',
};

function FieldLabel({ htmlFor, children, required = false }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
      {children}
      {required ? <span className="ml-0.5 text-rose-600">*</span> : null}
    </label>
  );
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs text-rose-700">
      {message}
    </p>
  );
}

export default function CampaignFormModal({ open, campaign = null, onClose, onSuccess }) {
  const toast = useToast();
  const promoPerm = usePromoCodePermissions();
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const editing = Boolean(campaign);

  const discountMeta = useMemo(
    () => getDiscountTypeMeta(form.discountType),
    [form.discountType],
  );
  const { items: activeTemplates, loading: templatesLoading } = useActiveTemplates({
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    if (campaign) {
      const { purpose, purposeOther } = parsePurposeFromDescription(campaign.description);
      const usageMode = campaign.usageMode || 'SINGLE';
      setForm({
        id: campaign.id || '',
        name: campaign.name || '',
        purpose,
        purposeOther,
        discountType: campaign.discountType || 'CUSTOM',
        discountValue: campaign.discountValue || campaign.offerTitle || '',
        startDate: toDateInputValue(campaign.startsAt) || defaultDates().startDate,
        endDate: toDateInputValue(campaign.endsAt) || defaultDates().endDate,
        usageMode,
        maxUses:
          usageMode === 'SINGLE'
            ? '1'
            : usageMode === 'UNLIMITED'
              ? ''
              : String(campaign.maxUses ?? '2'),
        offerSubtitle: campaign.offerSubtitle || '',
        offerTerms: campaign.offerTerms || '',
        status: campaign.status || 'ACTIVE',
        expiryMode: campaign.expiryMode || 'weekly',
        expiresIn: campaign.expiresIn || '',
        expiresAt: campaign.expiresAt ? String(campaign.expiresAt).slice(0, 16) : '',
        eventName: campaign.eventName || '',
        eventDate: campaign.eventDate ? String(campaign.eventDate).slice(0, 16) : '',
        isDefault: Boolean(campaign.isDefault),
        templateId: campaign.templateId || '',
        generateEnabled: false,
        quantityPreset: 100,
        customQuantity: '',
        codePrefix:
          campaign.codePrefix ||
          suggestPrefixFromPurpose(purpose, purposeOther, campaign.name),
        prefixLocked: Boolean(campaign.codePrefix),
      });
    } else {
      setForm({ ...EMPTY, ...defaultDates() });
    }
    setFieldErrors({});
  }, [open, campaign]);

  if (!open) return null;

  function setField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'usageMode') {
        if (value === 'SINGLE') next.maxUses = '1';
        if (value === 'UNLIMITED') next.maxUses = '';
        if (value === 'MULTIPLE' && (!prev.maxUses || prev.maxUses === '1')) {
          next.maxUses = '5';
        }
      }
      if (key === 'discountType') {
        next.discountValue = '';
      }
      if (key === 'codePrefix') {
        next.prefixLocked = true;
        next.codePrefix = normalizeCodePrefix(value);
      }
      if ((key === 'purpose' || key === 'purposeOther' || key === 'name') && !prev.prefixLocked) {
        next.codePrefix = suggestPrefixFromPurpose(
          key === 'purpose' ? value : next.purpose,
          key === 'purposeOther' ? value : next.purposeOther,
          key === 'name' ? value : next.name,
        );
      }
      return next;
    });
    setFieldErrors((prev) => {
      if (
        !prev[key] &&
        key !== 'discountType' &&
        key !== 'usageMode' &&
        key !== 'quantityPreset' &&
        key !== 'generateEnabled'
      ) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      if (key === 'discountType') delete next.discountValue;
      if (key === 'usageMode') delete next.maxUses;
      if (key === 'quantityPreset' || key === 'customQuantity' || key === 'generateEnabled') {
        delete next.quantity;
      }
      if (key === 'codePrefix') delete next.codePrefix;
      return next;
    });
  }

  function validate() {
    const errors = {};

    if (!form.name.trim()) errors.name = 'Promo name is required.';
    if (!form.purpose) {
      errors.purpose = 'Select a purpose.';
    } else if (form.purpose === CAMPAIGN_PURPOSE_OTHER && !form.purposeOther.trim()) {
      errors.purposeOther = 'Describe the purpose for Other.';
    }

    Object.assign(
      errors,
      validateDiscountFields({
        discountType: form.discountType,
        discountValue: form.discountValue,
      }),
    );
    Object.assign(
      errors,
      validateValidityFields({
        startDate: form.startDate,
        endDate: form.endDate,
      }),
    );
    Object.assign(
      errors,
      validateUsageFields({
        usageMode: form.usageMode,
        maxUses: form.maxUses,
      }),
    );
    Object.assign(
      errors,
      validateCodeGenerationFields({
        generateEnabled: form.generateEnabled,
        quantityPreset: form.quantityPreset,
        customQuantity: form.customQuantity,
        codePrefix: form.codePrefix,
      }),
    );

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function toPayload() {
    const offerTitle = buildOfferTitleFromDiscount(form.discountType, form.discountValue);
    const prefix = normalizeCodePrefix(form.codePrefix);
    const quantity = resolveGenerateQuantity({
      quantityPreset: form.quantityPreset,
      customQuantity: form.customQuantity,
      generateEnabled: form.generateEnabled,
    });

    return {
      name: form.name.trim(),
      description: purposeToDescription(form.purpose, form.purposeOther),
      offerTitle,
      offerSubtitle: form.offerSubtitle.trim(),
      offerTerms: form.offerTerms.trim(),
      discountType: form.discountType,
      discountValue: String(form.discountValue || '').trim(),
      startsAt: dateInputToStartIso(form.startDate),
      endsAt: dateInputToEndIso(form.endDate),
      usageMode: form.usageMode,
      maxUses: resolveMaxUsesForPayload(form.usageMode, form.maxUses),
      codePrefix: prefix,
      status: form.status,
      expiryMode: form.expiryMode,
      expiresIn: form.expiresIn.trim() || null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      eventName: form.eventName.trim() || null,
      eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : null,
      isDefault: form.isDefault,
      templateId: form.templateId.trim() || null,
      ...(!editing && form.id.trim() ? { id: form.id.trim() } : {}),
      ...(!editing && promoPerm.generate && form.generateEnabled && quantity > 0
        ? {
            codeGeneration: {
              quantity,
              prefix,
            },
          }
        : {}),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = toPayload();

      if (editing) {
        const result = await campaignService.updateCampaign(campaign.id, payload);
        if (!result.ok) {
          const apiFields = fieldErrorsFromApiResult(result);
          if (Object.keys(apiFields).length) {
            setFieldErrors((prev) => ({ ...prev, ...apiFields }));
          }
          toast.error(
            messageFromApiResult(result, 'Unable to update the campaign. Please try again.', {
              resource: 'campaign',
            }),
          );
          return;
        }

        if (form.generateEnabled && promoPerm.generate) {
          const quantity = resolveGenerateQuantity({
            quantityPreset: form.quantityPreset,
            customQuantity: form.customQuantity,
            generateEnabled: true,
          });
          const gen = await campaignService.generateCampaignPromoCodes(campaign.id, {
            quantity,
            prefix: normalizeCodePrefix(form.codePrefix),
          });
          if (!gen.ok) {
            toast.error(
              messageFromApiResult(
                gen,
                'Campaign saved, but promo code generation failed. Please try again.',
                { resource: 'campaign' },
              ),
            );
            onSuccess?.(result.data.campaign);
            onClose();
            return;
          }
          toast.success(
            `Campaign updated · ${gen.data.generated} code${gen.data.generated === 1 ? '' : 's'} generated`,
          );
        } else {
          toast.success('Campaign updated');
        }

        onSuccess?.(result.data.campaign);
        onClose();
        return;
      }

      const result = await campaignService.createCampaign(payload);
      if (!result.ok) {
        const apiFields = fieldErrorsFromApiResult(result);
        if (Object.keys(apiFields).length) {
          setFieldErrors((prev) => ({ ...prev, ...apiFields }));
        }
        toast.error(
          messageFromApiResult(result, 'Unable to create the campaign. Please try again.', {
            resource: 'campaign',
          }),
        );
        return;
      }

      if (result.data.generationError) {
        toast.error(
          messageFromGenerationError(
            result.data.generationError,
            'Campaign created, but promo code generation failed. Please try again.',
          ),
        );
      } else if (result.data.generation?.generated) {
        const n = result.data.generation.generated;
        toast.success(
          `Campaign created · ${n} code${n === 1 ? '' : 's'} generated on the server`,
        );
      } else {
        toast.success('Campaign created');
      }

      onSuccess?.(result.data.campaign);
      onClose();
    } catch (error) {
      toast.error(
        messageFromCaughtError(error, 'Unable to save the campaign. Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const showMaxUses = form.usageMode === 'SINGLE' || form.usageMode === 'MULTIPLE';
  const maxUsesReadOnly = form.usageMode === 'SINGLE';
  const showCustomQuantity = form.quantityPreset === 'custom';

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-form-title"
        className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-[var(--dash-border)] bg-[var(--dash-bg)] p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2
              id="campaign-form-title"
              className="text-lg font-semibold text-[var(--dash-ink)]"
            >
              {editing ? 'Edit campaign' : 'Create campaign'}
            </h2>
            <p className="mt-1 text-sm text-[var(--dash-muted)]">
              Define the promo offer, discount, validity, and usage rules.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--dash-muted)] hover:bg-[var(--dash-surface-2)]"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormSection
            title="Basic information"
            description="Name the promotion and choose what it is for."
          >
            <div>
              <FieldLabel htmlFor="campaign-promo-name" required>
                Promo name
              </FieldLabel>
              <input
                id="campaign-promo-name"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Christmas Offer"
                aria-invalid={Boolean(fieldErrors.name)}
                className={DASH_INPUT_CLASS}
              />
              <FieldError message={fieldErrors.name} />
            </div>

            <div>
              <FieldLabel htmlFor="campaign-purpose" required>
                Purpose
              </FieldLabel>
              <select
                id="campaign-purpose"
                value={form.purpose}
                onChange={(e) => setField('purpose', e.target.value)}
                aria-invalid={Boolean(fieldErrors.purpose)}
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
                <FieldLabel htmlFor="campaign-purpose-other" required>
                  Describe purpose
                </FieldLabel>
                <input
                  id="campaign-purpose-other"
                  value={form.purposeOther}
                  onChange={(e) => setField('purposeOther', e.target.value)}
                  placeholder="e.g. Partner package"
                  className={DASH_INPUT_CLASS}
                />
                <FieldError message={fieldErrors.purposeOther} />
              </div>
            ) : null}

            {!editing ? (
              <div>
                <FieldLabel htmlFor="campaign-id">Id / slug (optional)</FieldLabel>
                <input
                  id="campaign-id"
                  value={form.id}
                  onChange={(e) => setField('id', e.target.value)}
                  placeholder="auto from promo name"
                  className={`${DASH_INPUT_CLASS} font-mono`}
                />
              </div>
            ) : (
              <p className="text-xs text-[var(--dash-muted)]">
                Id: <span className="font-mono text-[var(--dash-ink-soft)]">{campaign.id}</span>
              </p>
            )}

            <div>
              <FieldLabel htmlFor="campaign-template">Voucher template</FieldLabel>
              <select
                id="campaign-template"
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

          <FormSection
            title="Discount"
            description="Choose how the offer is discounted. Only relevant value fields are shown."
          >
            <div>
              <FieldLabel htmlFor="campaign-discount-type" required>
                Discount type
              </FieldLabel>
              <select
                id="campaign-discount-type"
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
                <FieldLabel htmlFor="campaign-discount-value" required>
                  {discountMeta.valueLabel}
                </FieldLabel>
                <div className="relative">
                  {discountMeta.prefix ? (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--dash-muted)]">
                      {discountMeta.prefix}
                    </span>
                  ) : null}
                  <input
                    id="campaign-discount-value"
                    type={
                      form.discountType === 'PERCENTAGE' ||
                      form.discountType === 'FIXED_AMOUNT'
                        ? 'number'
                        : 'text'
                    }
                    inputMode={
                      form.discountType === 'PERCENTAGE' ||
                      form.discountType === 'FIXED_AMOUNT'
                        ? 'decimal'
                        : 'text'
                    }
                    min={
                      form.discountType === 'PERCENTAGE' ||
                      form.discountType === 'FIXED_AMOUNT'
                        ? '0'
                        : undefined
                    }
                    max={form.discountType === 'PERCENTAGE' ? '100' : undefined}
                    step={
                      form.discountType === 'FIXED_AMOUNT' ? '0.01' : form.discountType === 'PERCENTAGE' ? '1' : undefined
                    }
                    value={form.discountValue}
                    onChange={(e) => setField('discountValue', e.target.value)}
                    placeholder={discountMeta.placeholder}
                    aria-invalid={Boolean(fieldErrors.discountValue)}
                    className={`${DASH_INPUT_CLASS} ${discountMeta.prefix ? 'pl-7' : ''} ${discountMeta.suffix ? 'pr-8' : ''}`}
                  />
                  {discountMeta.suffix ? (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--dash-muted)]">
                      {discountMeta.suffix}
                    </span>
                  ) : null}
                </div>
                <FieldError message={fieldErrors.discountValue} />
                <p className="mt-1 text-xs text-[var(--dash-muted)]">
                  Guest offer title preview:{' '}
                  <span className="font-medium text-[var(--dash-ink-soft)]">
                    {buildOfferTitleFromDiscount(form.discountType, form.discountValue)}
                  </span>
                </p>
              </div>
            ) : null}
          </FormSection>

          <FormSection
            title="Validity"
            description="Campaign calendar window (UTC). End date cannot be before start date."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="campaign-start-date" required>
                  Start date
                </FieldLabel>
                <input
                  id="campaign-start-date"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setField('startDate', e.target.value)}
                  aria-invalid={Boolean(fieldErrors.startDate)}
                  className={DASH_INPUT_CLASS}
                />
                <FieldError message={fieldErrors.startDate} />
              </div>
              <div>
                <FieldLabel htmlFor="campaign-end-date" required>
                  End date
                </FieldLabel>
                <input
                  id="campaign-end-date"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setField('endDate', e.target.value)}
                  aria-invalid={Boolean(fieldErrors.endDate)}
                  className={DASH_INPUT_CLASS}
                />
                <FieldError message={fieldErrors.endDate} />
              </div>
            </div>
            <p className="text-xs text-[var(--dash-muted)]">
              Dates are stored as UTC day bounds (start 00:00:00.000Z, end 23:59:59.999Z).
            </p>
          </FormSection>

          <FormSection
            title="Usage rules"
            description="How many times a promo code from this campaign can be redeemed."
          >
            <div>
              <FieldLabel htmlFor="campaign-usage-mode" required>
                Usage
              </FieldLabel>
              <select
                id="campaign-usage-mode"
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

            {showMaxUses ? (
              <div>
                <FieldLabel htmlFor="campaign-max-uses" required={form.usageMode === 'MULTIPLE'}>
                  Maximum uses
                </FieldLabel>
                <input
                  id="campaign-max-uses"
                  type="number"
                  min={form.usageMode === 'SINGLE' ? 1 : 2}
                  step="1"
                  value={form.maxUses}
                  readOnly={maxUsesReadOnly}
                  onChange={(e) => setField('maxUses', e.target.value)}
                  aria-invalid={Boolean(fieldErrors.maxUses)}
                  className={`${DASH_INPUT_CLASS} ${maxUsesReadOnly ? 'opacity-70' : ''}`}
                />
                <FieldError message={fieldErrors.maxUses} />
                <p className="mt-1 text-xs text-[var(--dash-muted)]">
                  {form.usageMode === 'SINGLE'
                    ? 'Single Use codes are limited to 1 redemption.'
                    : 'Example: 5'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-[var(--dash-muted)]">
                Unlimited usage — no maximum redemption count is stored.
              </p>
            )}
          </FormSection>

          {promoPerm.generate ? (
          <FormSection
            title="Promo code generation"
            description="Configure how many codes to generate. Codes are created securely on the server — never in the browser."
          >
            <label className="flex items-start gap-2 text-sm text-[var(--dash-ink-soft)]">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={form.generateEnabled}
                onChange={(e) => setField('generateEnabled', e.target.checked)}
              />
              <span>
                {editing
                  ? 'Generate additional promo codes after saving'
                  : 'Generate promo codes when this campaign is created'}
              </span>
            </label>

            {form.generateEnabled ? (
              <>
                <div>
                  <FieldLabel htmlFor="campaign-code-quantity" required>
                    Quantity
                  </FieldLabel>
                  <select
                    id="campaign-code-quantity"
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
                    Max {MAX_GENERATE_QUANTITY.toLocaleString('en-US')} codes per request.
                    Large batches run on the backend.
                  </p>
                </div>

                {showCustomQuantity ? (
                  <div>
                    <FieldLabel htmlFor="campaign-custom-quantity" required>
                      Custom quantity
                    </FieldLabel>
                    <input
                      id="campaign-custom-quantity"
                      type="number"
                      min={1}
                      max={MAX_GENERATE_QUANTITY}
                      step="1"
                      value={form.customQuantity}
                      onChange={(e) => setField('customQuantity', e.target.value)}
                      placeholder="e.g. 250"
                      className={DASH_INPUT_CLASS}
                    />
                  </div>
                ) : null}

                <div>
                  <FieldLabel htmlFor="campaign-code-prefix" required>
                    Code prefix
                  </FieldLabel>
                  <input
                    id="campaign-code-prefix"
                    value={form.codePrefix}
                    onChange={(e) => setField('codePrefix', e.target.value)}
                    placeholder="HOTEL"
                    className={`${DASH_INPUT_CLASS} font-mono uppercase`}
                    maxLength={12}
                  />
                  <FieldError message={fieldErrors.codePrefix} />
                  <p className="mt-1 text-xs text-[var(--dash-muted)]">
                    Format:{' '}
                    <span className="font-mono text-[var(--dash-ink-soft)]">
                      {formatCodeExample(form.codePrefix)}
                    </span>{' '}
                    — unique suffix is generated by the server (e.g. HOTEL-9KD82P).
                  </p>
                </div>
              </>
            ) : (
              <p className="text-xs text-[var(--dash-muted)]">
                You can generate codes later from this campaign without leaving the dashboard.
              </p>
            )}
          </FormSection>
          ) : null}

          <FormSection
            title="Guest copy & ticket expiry"
            description="Optional guest-facing details and per-ticket expiry rules."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="campaign-status">Status</FieldLabel>
                <select
                  id="campaign-status"
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value)}
                  className={DASH_SELECT_CLASS}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div>
                <FieldLabel htmlFor="campaign-expiry-mode">Ticket expiry mode</FieldLabel>
                <select
                  id="campaign-expiry-mode"
                  value={form.expiryMode}
                  onChange={(e) => setField('expiryMode', e.target.value)}
                  className={DASH_SELECT_CLASS}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="duration">Duration</option>
                  <option value="date">Fixed date</option>
                  <option value="event">Event date</option>
                </select>
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="campaign-offer-subtitle">Offer subtitle</FieldLabel>
              <input
                id="campaign-offer-subtitle"
                value={form.offerSubtitle}
                onChange={(e) => setField('offerSubtitle', e.target.value)}
                className={DASH_INPUT_CLASS}
              />
            </div>

            <div>
              <FieldLabel htmlFor="campaign-terms">Terms</FieldLabel>
              <textarea
                id="campaign-terms"
                rows={3}
                value={form.offerTerms}
                onChange={(e) => setField('offerTerms', e.target.value)}
                className="w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--dash-accent)]"
              />
            </div>

            {['weekly', 'monthly', 'duration'].includes(form.expiryMode) ? (
              <div>
                <FieldLabel htmlFor="campaign-expires-in">Ticket expires in</FieldLabel>
                <input
                  id="campaign-expires-in"
                  value={form.expiresIn}
                  onChange={(e) => setField('expiresIn', e.target.value)}
                  placeholder="1w / 1mo / 48h"
                  className={DASH_INPUT_CLASS}
                />
              </div>
            ) : null}

            {form.expiryMode === 'date' ? (
              <div>
                <FieldLabel htmlFor="campaign-expires-at">Ticket expires at</FieldLabel>
                <input
                  id="campaign-expires-at"
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setField('expiresAt', e.target.value)}
                  className={DASH_INPUT_CLASS}
                />
              </div>
            ) : null}

            {form.expiryMode === 'event' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="campaign-event-name">Event name</FieldLabel>
                  <input
                    id="campaign-event-name"
                    value={form.eventName}
                    onChange={(e) => setField('eventName', e.target.value)}
                    className={DASH_INPUT_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="campaign-event-date">Event date</FieldLabel>
                  <input
                    id="campaign-event-date"
                    type="datetime-local"
                    value={form.eventDate}
                    onChange={(e) => setField('eventDate', e.target.value)}
                    className={DASH_INPUT_CLASS}
                  />
                </div>
              </div>
            ) : null}

            <label className="flex items-center gap-2 text-sm text-[var(--dash-ink-soft)]">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setField('isDefault', e.target.checked)}
              />
              Default campaign for new tickets
            </label>
          </FormSection>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : editing ? 'Save changes' : 'Create campaign'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
