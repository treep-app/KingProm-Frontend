'use client';

import { useMemo } from 'react';
import { X } from 'lucide-react';
import { buildSamplePreviewContext } from '../../lib/dashboard/voucherVariables';
import { workspacePreviewBranding } from '../../lib/dashboard/workspacePreviewBranding';
import { useBrandingSettings } from '../../hooks/useBranding';
import { useTenant } from './WorkspaceProvider';
import { TemplateRenderer } from './voucher/VoucherPreview';
import { Button } from './ui';

export default function TemplatePreviewModal({ open, template, onClose }) {
  const tenant = useTenant();
  const { branding: workspaceBranding } = useBrandingSettings();
  const context = useMemo(
    () =>
      buildSamplePreviewContext(
        workspacePreviewBranding(tenant, workspaceBranding),
      ),
    [tenant, workspaceBranding],
  );

  if (!open || !template) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        aria-label="Close preview"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-preview-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--dash-border)] px-4 py-3">
          <h2 id="template-preview-title" className="text-sm font-semibold text-[var(--dash-ink)]">
            {template.name}
          </h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>
        <div className="overflow-y-auto p-4">
          <TemplateRenderer
            config={template.config}
            context={context}
            logoUrl={template.logoUrl}
            backgroundUrl={template.backgroundUrl}
            showSampleBadge
          />
          <p className="mt-3 text-center text-xs text-[var(--dash-muted)]">
            Sample preview — not a real customer or promo code.
          </p>
        </div>
      </div>
    </div>
  );
}
