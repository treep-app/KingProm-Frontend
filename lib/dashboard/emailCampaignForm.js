/**
 * Email campaign wizard form state + validation.
 */

export const EMAIL_WIZARD_STEPS = [
  { id: 'audience', title: 'Audience' },
  { id: 'promotion', title: 'Promotion' },
  { id: 'voucher', title: 'Voucher' },
  { id: 'content', title: 'Email content' },
  { id: 'preview', title: 'Preview' },
  { id: 'schedule', title: 'Schedule & send' },
];

export const PROMO_MODES = [
  {
    value: 'ASSIGN_AVAILABLE',
    label: 'Assign available promo',
    description: 'Generate or assign an unused promo code when needed.',
  },
  {
    value: 'EXISTING_ONLY',
    label: 'Existing promos only',
    description: 'Send only to customers who already have an active promo for this campaign.',
  },
];

export function createEmptyEmailCampaignForm(meta = {}) {
  return {
    name: '',
    segmentId: 'all',
    audience: { type: 'all', status: 'ACTIVE' },
    promoMode: 'ASSIGN_AVAILABLE',
    promotionCampaignId: '',
    voucherTemplateId: '',
    fromName: meta?.sender?.name || '',
    replyTo: '',
    subject: '',
    previewText: '',
    bodyHtml: meta?.defaultBodyHtml || '',
    sendMode: 'immediate',
    scheduledAt: '',
    scheduledTime: '09:00',
    timezone: meta?.timezoneDefault || 'Africa/Accra',
  };
}

export function campaignToEmailForm(campaign, meta = {}) {
  const base = createEmptyEmailCampaignForm(meta);
  if (!campaign) return base;

  let segmentId = 'all';
  if (campaign.audience?.type === 'segment') {
    segmentId = 'custom';
  } else if (campaign.audience?.type === 'manual') {
    segmentId = 'manual';
  }

  const scheduled = campaign.scheduledAt ? new Date(campaign.scheduledAt) : null;

  return {
    ...base,
    name: campaign.name || '',
    segmentId,
    audience: campaign.audience || base.audience,
    promoMode: campaign.promoMode || 'ASSIGN_AVAILABLE',
    promotionCampaignId: campaign.promotionCampaignId || '',
    voucherTemplateId: campaign.voucherTemplateId || '',
    fromName: campaign.fromName || base.fromName,
    replyTo: campaign.replyTo || '',
    subject: campaign.subject || '',
    previewText: campaign.previewText || '',
    bodyHtml: campaign.bodyHtml || base.bodyHtml,
    sendMode: campaign.scheduledAt ? 'schedule' : 'immediate',
    scheduledAt: scheduled ? scheduled.toISOString().slice(0, 10) : '',
    scheduledTime: scheduled
      ? `${String(scheduled.getHours()).padStart(2, '0')}:${String(scheduled.getMinutes()).padStart(2, '0')}`
      : '09:00',
    timezone: campaign.timezone || base.timezone,
  };
}

export function buildEmailCampaignPayload(form) {
  return {
    name: form.name.trim(),
    audience: form.audience,
    promoMode: form.promoMode,
    promotionCampaignId: form.promotionCampaignId || null,
    voucherTemplateId: form.voucherTemplateId || null,
    fromName: form.fromName.trim(),
    replyTo: form.replyTo.trim() || null,
    subject: form.subject.trim(),
    previewText: form.previewText.trim() || null,
    bodyHtml: form.bodyHtml,
    timezone: form.timezone || 'Africa/Accra',
  };
}

export function buildPreviewPayload(form) {
  return buildEmailCampaignPayload(form);
}

export function buildScheduledAt(form) {
  if (form.sendMode !== 'schedule' || !form.scheduledAt) return null;
  const [hours, minutes] = (form.scheduledTime || '09:00').split(':').map(Number);
  const date = new Date(`${form.scheduledAt}T00:00:00`);
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date.toISOString();
}

export function validateEmailCampaignForm(form, stepId = 'all', context = {}) {
  const errors = {};
  const check = (fields) => {
    if (stepId === 'all' || fields.includes(stepId)) return true;
    return false;
  };

  const promotionOptions = context.promotionCampaigns || [];
  const selectedPromotion = promotionOptions.find(
    (c) => c.id === form.promotionCampaignId,
  );

  if (check(['audience', 'schedule'])) {
    if (!form.audience?.type) errors.audience = 'Select an audience';
  }

  if (check(['promotion', 'voucher', 'content', 'preview', 'schedule'])) {
    if (!form.promotionCampaignId) {
      errors.promotionCampaignId = 'Select a promotion campaign';
    } else if (!selectedPromotion) {
      errors.promotionCampaignId =
        'That promotion campaign is unavailable. Pick another or create one under Campaigns.';
    } else if (['ARCHIVED', 'PAUSED'].includes(selectedPromotion.status)) {
      errors.promotionCampaignId =
        'Choose an active or draft promotion campaign (resume or duplicate a paused one first).';
    } else if (
      (stepId === 'all' || stepId === 'preview' || stepId === 'schedule') &&
      selectedPromotion.status !== 'ACTIVE'
    ) {
      errors.promotionCampaignId =
        'Activate this promotion campaign before sending email (Campaigns → set status to Active).';
    }
  }

  if (check(['voucher', 'schedule'])) {
    if (!form.voucherTemplateId) errors.voucherTemplateId = 'Select a voucher template';
  }

  if (check(['content', 'schedule'])) {
    if (!form.subject.trim()) errors.subject = 'Subject is required';
    if (!form.bodyHtml.trim()) errors.bodyHtml = 'Email body is required';
  }

  if (check(['schedule'])) {
    if (!form.name.trim()) errors.name = 'Campaign name is required';
    if (form.sendMode === 'schedule') {
      if (!form.scheduledAt) errors.scheduledAt = 'Pick a schedule date';
      const scheduled = buildScheduledAt(form);
      if (scheduled && new Date(scheduled).getTime() <= Date.now()) {
        errors.scheduledAt = 'Schedule must be in the future';
      }
    }
  }

  return errors;
}

export function isEmailCampaignEditable(status) {
  const key = String(status || '').toUpperCase();
  return ['DRAFT', 'SCHEDULED', 'PAUSED'].includes(key);
}

export function insertHtmlAtCursor(textarea, html, setValue) {
  if (!textarea) {
    setValue((prev) => `${prev}${html}`);
    return;
  }
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? start;
  const next = `${textarea.value.slice(0, start)}${html}${textarea.value.slice(end)}`;
  setValue(next);
  requestAnimationFrame(() => {
    textarea.focus();
    const pos = start + html.length;
    textarea.setSelectionRange(pos, pos);
  });
}
