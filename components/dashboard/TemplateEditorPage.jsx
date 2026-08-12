'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ShieldOff } from 'lucide-react';
import { PERMISSIONS } from '../../lib/permissions';
import { useTemplate } from '../../hooks/useTemplate';
import {
  fieldErrorsFromApiResult,
  messageFromApiResult,
  messageFromCaughtError,
} from '../../lib/api/errors';
import { defaultConfig } from '../../lib/dashboard/defaultTemplateConfig';
import { TEMPLATE_CATEGORIES } from '../../lib/dashboard/templateCategories';
import {
  ALLOWED_VARIABLE_OPTIONS,
  buildSamplePreviewContext,
} from '../../lib/dashboard/voucherVariables';
import { DASH_INPUT_CLASS, DASH_SELECT_CLASS } from '../../lib/dashboard/styles';
import AuthGate from './AuthGate';
import ColorField from './ColorField';
import FormSection from './FormSection';
import ImageUploadField from './ImageUploadField';
import { ApiErrorBanner } from './AlertBanner';
import VoucherPreview from './voucher/VoucherPreview';
import { useTemplatePermissions } from './WorkspaceProvider';
import { useToast } from './ToastProvider';
import {
  Button,
  EmptyState,
  LoadingState,
  PageContainer,
  PageHeader,
} from './ui';

const CONTENT_FIELDS = [
  { key: 'header', label: 'Header' },
  { key: 'title', label: 'Title' },
  { key: 'offer', label: 'Offer' },
  { key: 'description', label: 'Description' },
  { key: 'validityLabel', label: 'Validity label' },
  { key: 'validityValue', label: 'Validity value' },
  { key: 'promoCode', label: 'Promo code' },
  { key: 'customerLabel', label: 'Customer label' },
  { key: 'customerValue', label: 'Customer value' },
  { key: 'terms', label: 'Terms' },
  { key: 'footer', label: 'Footer' },
];

function deepCloneConfig(cfg) {
  return JSON.parse(JSON.stringify(cfg || defaultConfig()));
}

function VariableInsertButton({ onInsert }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="text-xs font-medium text-[var(--dash-accent)] hover:underline"
        onClick={() => setOpen((v) => !v)}
      >
        Insert variable
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-1 max-h-48 w-56 overflow-y-auto rounded-lg border border-[var(--dash-border)] bg-white py-1 shadow-lg">
            {ALLOWED_VARIABLE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--dash-surface-2)]"
                onClick={() => {
                  onInsert(opt.token);
                  setOpen(false);
                }}
              >
                {opt.label}
                <span className="ml-1 font-mono text-[10px] text-[var(--dash-muted)]">
                  {opt.token}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function TemplateEditorInner({ mode = 'create', templateId = null }) {
  const router = useRouter();
  const toast = useToast();
  const templatesPerm = useTemplatePermissions();
  const isEdit = mode === 'edit';

  const {
    template,
    loading,
    error,
    errorResult,
    reload,
    createTemplate,
    updateTemplate,
    uploadLogo,
    uploadBackground,
  } = useTemplate(templateId, { enabled: isEdit });

  const [form, setForm] = useState(() => ({
    name: '',
    category: 'General',
    description: '',
    status: 'DRAFT',
    config: deepCloneConfig(),
  }));
  const [logoUrl, setLogoUrl] = useState(null);
  const [backgroundUrl, setBackgroundUrl] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [dirty, setDirty] = useState(false);
  const initialized = useRef(false);

  const previewContext = useMemo(() => buildSamplePreviewContext(), []);

  useEffect(() => {
    if (!isEdit || !template || initialized.current) return;
    initialized.current = true;
    setForm({
      name: template.name || '',
      category: template.category || 'General',
      description: template.description || '',
      status: template.status || 'DRAFT',
      config: deepCloneConfig(template.config),
    });
    setLogoUrl(template.logoUrl || null);
    setBackgroundUrl(template.backgroundUrl || null);
  }, [isEdit, template]);

  useEffect(() => {
    if (!dirty) return undefined;
    function onBeforeUnload(e) {
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  function setField(key, value) {
    setDirty(true);
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function setConfigPath(path, value) {
    setDirty(true);
    setForm((prev) => {
      const next = deepCloneConfig(prev.config);
      const parts = path.split('.');
      let cur = next;
      for (let i = 0; i < parts.length - 1; i += 1) {
        cur[parts[i]] = { ...cur[parts[i]] };
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return { ...prev, config: next };
    });
  }

  function insertVariable(fieldKey, token) {
    setConfigPath(`content.${fieldKey}`, (form.config.content[fieldKey] || '') + token);
  }

  const handleSave = useCallback(async () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Template name is required.';
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        status: form.status,
        config: form.config,
      };

      const result = isEdit
        ? await updateTemplate(payload)
        : await createTemplate(payload);

      if (!result.ok) {
        const apiFields = fieldErrorsFromApiResult(result);
        if (Object.keys(apiFields).length) setFieldErrors((p) => ({ ...p, ...apiFields }));
        toast.error(
          messageFromApiResult(result, 'Unable to save the template. Please try again.', {
            resource: 'template',
          }),
        );
        return;
      }

      setDirty(false);
      toast.success(isEdit ? 'Template saved' : 'Template created');
      router.push('/dashboard/templates');
    } catch (err) {
      toast.error(messageFromCaughtError(err, 'Unable to save the template.'));
    } finally {
      setSubmitting(false);
    }
  }, [form, isEdit, updateTemplate, createTemplate, router, toast]);

  async function handleLogoUpload(dataUrl) {
    if (!isEdit || !templateId) {
      toast.error('Save the template first, then upload a logo.');
      return;
    }
    setUploadingLogo(true);
    try {
      const result = await uploadLogo(dataUrl);
      if (!result.ok) {
        toast.error(messageFromApiResult(result, 'Logo upload failed.'));
        return;
      }
      setLogoUrl(result.data?.template?.logoUrl || logoUrl);
      setDirty(true);
      toast.success('Logo uploaded');
      reload();
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleBackgroundUpload(dataUrl) {
    if (!isEdit || !templateId) {
      toast.error('Save the template first, then upload a background.');
      return;
    }
    setUploadingBg(true);
    try {
      const result = await uploadBackground(dataUrl);
      if (!result.ok) {
        toast.error(messageFromApiResult(result, 'Background upload failed.'));
        return;
      }
      setBackgroundUrl(result.data?.template?.backgroundUrl || backgroundUrl);
      setDirty(true);
      toast.success('Background uploaded');
      reload();
    } finally {
      setUploadingBg(false);
    }
  }

  const canSave = isEdit ? templatesPerm.edit : templatesPerm.create;

  if (isEdit && loading) {
    return (
      <PageContainer>
        <LoadingState rows={8} label="Loading template…" />
      </PageContainer>
    );
  }

  if (isEdit && error && !template) {
    return (
      <PageContainer>
        <ApiErrorBanner result={errorResult} message={error} />
        <Button href="/dashboard/templates" variant="secondary" className="mt-4">
          Back to templates
        </Button>
      </PageContainer>
    );
  }

  if (!canSave) {
    return (
      <PageContainer>
        <EmptyState
          icon={ShieldOff}
          title="You don't have access"
          description="Your role can view templates but not edit them."
          action={
            <Button href="/dashboard/templates" variant="secondary">
              Back to templates
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={isEdit ? 'Edit template' : 'Create template'}
        description="Configure colors, content, and layout. Preview updates as you type."
        actions={
          <div className="flex gap-2">
            <Button href="/dashboard/templates" variant="secondary">
              Cancel
            </Button>
            <Button type="button" loading={submitting} disabled={submitting} onClick={handleSave}>
              <Save className="size-4" />
              {isEdit ? 'Save changes' : 'Create template'}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <FormSection title="Details" description="Name and categorize this template.">
            <div>
              <label htmlFor="tpl-name" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                Name <span className="text-rose-600">*</span>
              </label>
              <input
                id="tpl-name"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className={DASH_INPUT_CLASS}
              />
              {fieldErrors.name ? (
                <p className="mt-1 text-xs text-rose-700">{fieldErrors.name}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="tpl-category" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                Category
              </label>
              <select
                id="tpl-category"
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
                className={DASH_SELECT_CLASS}
              >
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tpl-desc" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                Description
              </label>
              <textarea
                id="tpl-desc"
                rows={2}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                className={`${DASH_INPUT_CLASS} min-h-[4.5rem] py-2`}
              />
            </div>
            <div>
              <label htmlFor="tpl-status" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                Status
              </label>
              <select
                id="tpl-status"
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                className={DASH_SELECT_CLASS}
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
              </select>
            </div>
          </FormSection>

          <FormSection title="Brand colors">
            <ColorField
              label="Primary"
              value={form.config.primaryColor}
              onChange={(v) => setConfigPath('primaryColor', v)}
            />
            <ColorField
              label="Secondary"
              value={form.config.secondaryColor}
              onChange={(v) => setConfigPath('secondaryColor', v)}
            />
            <ColorField
              label="Accent"
              value={form.config.accentColor}
              onChange={(v) => setConfigPath('accentColor', v)}
            />
          </FormSection>

          <FormSection
            title="Images"
            description={isEdit ? undefined : 'Save the template first to upload images.'}
          >
            <ImageUploadField
              label="Logo"
              currentUrl={logoUrl}
              uploading={uploadingLogo}
              disabled={!isEdit}
              onUpload={handleLogoUpload}
            />
            <ImageUploadField
              label="Background"
              currentUrl={backgroundUrl}
              uploading={uploadingBg}
              disabled={!isEdit}
              onUpload={handleBackgroundUpload}
            />
            <div>
              <label htmlFor="overlay" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                Background overlay ({Math.round((form.config.background?.overlayOpacity ?? 0.5) * 100)}%)
              </label>
              <input
                id="overlay"
                type="range"
                min={0}
                max={85}
                value={Math.round((form.config.background?.overlayOpacity ?? 0.5) * 100)}
                onChange={(e) =>
                  setConfigPath('background.overlayOpacity', Number(e.target.value) / 100)
                }
                className="w-full"
              />
            </div>
          </FormSection>

          <FormSection title="Layout">
            <div>
              <label htmlFor="qr-pos" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                QR code position
              </label>
              <select
                id="qr-pos"
                value={form.config.layout?.qrPosition || 'right'}
                onChange={(e) => setConfigPath('layout.qrPosition', e.target.value)}
                className={DASH_SELECT_CLASS}
              >
                <option value="right">Right</option>
                <option value="left">Left</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
          </FormSection>

          <FormSection title="Content" description="Use variables for dynamic fields.">
            {CONTENT_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor={`content-${key}`} className="text-xs font-medium text-[var(--dash-muted)]">
                    {label}
                  </label>
                  <VariableInsertButton onInsert={(token) => insertVariable(key, token)} />
                </div>
                {key === 'terms' || key === 'description' ? (
                  <textarea
                    id={`content-${key}`}
                    rows={3}
                    value={form.config.content?.[key] || ''}
                    onChange={(e) => setConfigPath(`content.${key}`, e.target.value)}
                    className={`${DASH_INPUT_CLASS} min-h-[4.5rem] py-2 font-mono text-xs`}
                  />
                ) : (
                  <input
                    id={`content-${key}`}
                    value={form.config.content?.[key] || ''}
                    onChange={(e) => setConfigPath(`content.${key}`, e.target.value)}
                    className={`${DASH_INPUT_CLASS} font-mono text-xs`}
                  />
                )}
              </div>
            ))}
          </FormSection>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <FormSection
            title="Live preview"
            description="Updates as you edit. Template name is shown above the card; Title, Header, and other Content fields render on the voucher."
          >
            <div className="mb-3 border-b border-[var(--dash-border)] pb-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--dash-muted)]">
                Template name
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-[var(--dash-ink)]">
                {form.name.trim() || 'Untitled template'}
              </p>
            </div>
            <VoucherPreview
              config={form.config}
              context={previewContext}
              logoUrl={logoUrl}
              backgroundUrl={backgroundUrl}
              showSampleBadge
            />
          </FormSection>
        </div>
      </div>
    </PageContainer>
  );
}

export default function TemplateEditorPage({ mode = 'create', templateId = null }) {
  const permission =
    mode === 'edit' ? PERMISSIONS.TEMPLATES_EDIT : PERMISSIONS.TEMPLATES_CREATE;
  return (
    <AuthGate permission={permission}>
      <TemplateEditorInner mode={mode} templateId={templateId} />
    </AuthGate>
  );
}
