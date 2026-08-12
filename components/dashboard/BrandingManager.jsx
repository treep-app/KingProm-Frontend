'use client';

import { useEffect, useMemo, useState } from 'react';
import { Save, ShieldOff } from 'lucide-react';
import { PERMISSIONS } from '../../lib/permissions';
import { useBrandingSettings } from '../../hooks/useBranding';
import { useActiveTemplates } from '../../hooks/useActiveTemplates';
import {
  messageFromApiResult,
  messageFromCaughtError,
} from '../../lib/api/errors';
import { buildSamplePreviewContext } from '../../lib/dashboard/voucherVariables';
import { DASH_INPUT_CLASS, DASH_SELECT_CLASS } from '../../lib/dashboard/styles';
import AuthGate from './AuthGate';
import ColorField from './ColorField';
import FormSection from './FormSection';
import ImageUploadField from './ImageUploadField';
import { ApiErrorBanner } from './AlertBanner';
import VoucherPreview from './voucher/VoucherPreview';
import { useBrandingPermissions } from './WorkspaceProvider';
import { useToast } from './ToastProvider';
import {
  Button,
  EmptyState,
  LoadingState,
  PageContainer,
  PageHeader,
} from './ui';

function emptyBrandingForm() {
  return {
    businessName: '',
    primaryColor: '#D99D26',
    secondaryColor: '#091B34',
    accentColor: '#FFFFFF',
    email: '',
    phone: '',
    website: '',
    address: '',
    emailFooter: '',
    defaultTerms: '',
    defaultTemplateId: '',
  };
}

function BrandingManagerInner() {
  const toast = useToast();
  const brandingPerm = useBrandingPermissions();
  const { branding, loading, error, errorResult, reload, updateBranding, uploadLogo, removeLogo } =
    useBrandingSettings();
  const { items: activeTemplates, loading: templatesLoading } = useActiveTemplates();

  const [form, setForm] = useState(emptyBrandingForm);
  const [logoUrl, setLogoUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const selectedTemplate = useMemo(
    () => activeTemplates.find((t) => t.id === form.defaultTemplateId) || null,
    [activeTemplates, form.defaultTemplateId],
  );

  const previewContext = useMemo(
    () =>
      buildSamplePreviewContext({
        businessName: form.businessName,
        phone: form.phone,
        email: form.email,
        website: form.website,
        address: form.address,
        emailFooter: form.emailFooter,
        defaultTerms: form.defaultTerms,
        logoUrl,
      }),
    [form, logoUrl],
  );

  const previewConfig = useMemo(() => {
    if (selectedTemplate?.config) {
      return {
        ...selectedTemplate.config,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        accentColor: form.accentColor,
      };
    }
    return {
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      accentColor: form.accentColor,
      content: {
        header: '{{business.name}}',
        title: '{{campaign.name}}',
        offer: '{{discount.value}}',
        description: '{{campaign.description}}',
        validityLabel: 'Valid until',
        validityValue: '{{promo.expiry}}',
        promoCode: '{{promo.code}}',
        customerLabel: 'Customer',
        customerValue: '{{customer.fullName}}',
        terms: '{{voucher.terms}}',
        footer: '{{business.emailFooter}}',
      },
      typography: { headingStyle: 'serif', bodyStyle: 'sans' },
      layout: { qrPosition: 'right' },
      background: { overlayOpacity: 0.5 },
    };
  }, [selectedTemplate, form.primaryColor, form.secondaryColor, form.accentColor]);

  useEffect(() => {
    if (!branding || initialized) return;
    setForm({
      businessName: branding.businessName || '',
      primaryColor: branding.primaryColor || '#D99D26',
      secondaryColor: branding.secondaryColor || '#091B34',
      accentColor: branding.accentColor || '#FFFFFF',
      email: branding.email || '',
      phone: branding.phone || '',
      website: branding.website || '',
      address: branding.address || '',
      emailFooter: branding.emailFooter || '',
      defaultTerms: branding.defaultTerms || '',
      defaultTemplateId: branding.defaultTemplateId || '',
    });
    setLogoUrl(branding.logoUrl || null);
    setInitialized(true);
  }, [branding, initialized]);

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
  }

  async function handleSave() {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        defaultTemplateId: form.defaultTemplateId || null,
      };
      const result = await updateBranding(payload);
      if (!result.ok) {
        toast.error(
          messageFromApiResult(result, 'Unable to save branding. Please try again.', {
            resource: 'branding',
          }),
        );
        return;
      }
      setDirty(false);
      toast.success('Branding saved');
      reload();
    } catch (err) {
      toast.error(messageFromCaughtError(err, 'Unable to save branding.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogoUpload(dataUrl) {
    setUploadingLogo(true);
    try {
      const result = await uploadLogo({ image: dataUrl });
      if (!result.ok) {
        toast.error(messageFromApiResult(result, 'Logo upload failed.'));
        return;
      }
      setLogoUrl(result.data?.branding?.logoUrl || logoUrl);
      setDirty(true);
      toast.success('Logo uploaded');
      reload();
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleLogoRemove() {
    const result = await removeLogo();
    if (!result.ok) {
      toast.error(messageFromApiResult(result, 'Unable to remove logo.'));
      return;
    }
    setLogoUrl(null);
    setDirty(true);
    toast.success('Logo removed');
    reload();
  }

  if (loading) {
    return (
      <PageContainer>
        <LoadingState rows={8} label="Loading branding…" />
      </PageContainer>
    );
  }

  if (error && !branding) {
    return (
      <PageContainer>
        <ApiErrorBanner result={errorResult} message={error} />
        <Button type="button" variant="secondary" className="mt-4" onClick={reload}>
          Retry
        </Button>
      </PageContainer>
    );
  }

  if (!brandingPerm.edit) {
    return (
      <PageContainer>
        <EmptyState
          icon={ShieldOff}
          title="View only"
          description="Your role can view branding settings but not edit them."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Branding"
        description="Workspace identity, colors, and default voucher appearance."
        actions={
          <Button type="button" loading={submitting} disabled={submitting} onClick={handleSave}>
            <Save className="size-4" />
            Save changes
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <FormSection title="Business identity">
            <div>
              <label htmlFor="biz-name" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                Business name
              </label>
              <input
                id="biz-name"
                value={form.businessName}
                onChange={(e) => setField('businessName', e.target.value)}
                className={DASH_INPUT_CLASS}
              />
            </div>
            <ImageUploadField
              label="Logo"
              currentUrl={logoUrl}
              uploading={uploadingLogo}
              onUpload={handleLogoUpload}
              onRemove={handleLogoRemove}
            />
            <div>
              <label htmlFor="biz-email" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                Email
              </label>
              <input
                id="biz-email"
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                className={DASH_INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="biz-phone" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                Phone
              </label>
              <input
                id="biz-phone"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                className={DASH_INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="biz-web" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                Website
              </label>
              <input
                id="biz-web"
                value={form.website}
                onChange={(e) => setField('website', e.target.value)}
                className={DASH_INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="biz-addr" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                Address
              </label>
              <textarea
                id="biz-addr"
                rows={2}
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                className={`${DASH_INPUT_CLASS} min-h-[4.5rem] py-2`}
              />
            </div>
          </FormSection>

          <FormSection title="Brand colors">
            <ColorField
              label="Primary"
              value={form.primaryColor}
              onChange={(v) => setField('primaryColor', v)}
            />
            <ColorField
              label="Secondary"
              value={form.secondaryColor}
              onChange={(v) => setField('secondaryColor', v)}
            />
            <ColorField
              label="Accent"
              value={form.accentColor}
              onChange={(v) => setField('accentColor', v)}
            />
          </FormSection>

          <FormSection title="Voucher branding">
            <div>
              <label htmlFor="default-tpl" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                Default template
              </label>
              <select
                id="default-tpl"
                value={form.defaultTemplateId}
                onChange={(e) => setField('defaultTemplateId', e.target.value)}
                disabled={templatesLoading}
                className={DASH_SELECT_CLASS}
              >
                <option value="">Use built-in defaults</option>
                {activeTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.isDefault ? ' (default)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="email-footer" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                Email footer
              </label>
              <textarea
                id="email-footer"
                rows={2}
                value={form.emailFooter}
                onChange={(e) => setField('emailFooter', e.target.value)}
                className={`${DASH_INPUT_CLASS} min-h-[4.5rem] py-2`}
              />
            </div>
            <div>
              <label htmlFor="default-terms" className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
                Default terms & conditions
              </label>
              <textarea
                id="default-terms"
                rows={4}
                value={form.defaultTerms}
                onChange={(e) => setField('defaultTerms', e.target.value)}
                className={`${DASH_INPUT_CLASS} min-h-[6rem] py-2`}
              />
            </div>
          </FormSection>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <FormSection title="Voucher preview" description="How vouchers appear with your branding.">
            <VoucherPreview
              config={previewConfig}
              context={previewContext}
              logoUrl={logoUrl || selectedTemplate?.logoUrl}
              backgroundUrl={selectedTemplate?.backgroundUrl}
              showSampleBadge
            />
          </FormSection>
        </div>
      </div>
    </PageContainer>
  );
}

export default function BrandingManager() {
  return (
    <AuthGate permission={PERMISSIONS.BRANDING_VIEW}>
      <BrandingManagerInner />
    </AuthGate>
  );
}
