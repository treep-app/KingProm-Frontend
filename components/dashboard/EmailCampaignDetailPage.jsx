'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Pencil } from 'lucide-react';
import { PERMISSIONS } from '../../lib/permissions';
import { useEmailCampaign } from '../../hooks/useEmailCampaign';
import {
  messageFromApiResult,
  messageFromCaughtError,
} from '../../lib/api/errors';
import { audienceSummary } from '../../lib/dashboard/emailCampaignSegments';
import { isEmailCampaignEditable } from '../../lib/dashboard/emailCampaignForm';
import { EMAIL_CAMPAIGN_LIST_LIMIT } from '../../lib/dashboard/constants';
import { formatDateTime, formatNumber, formatPercent } from '../../lib/format';
import AuthGate from './AuthGate';
import ConfirmDialog from './ConfirmDialog';
import { ApiErrorBanner } from './AlertBanner';
import { useToast } from './ToastProvider';
import { useEmailCampaignPermissions } from './WorkspaceProvider';
import {
  Button,
  DataTable,
  EmptyState,
  LoadingState,
  PageContainer,
  PageHeader,
  StatusBadge,
} from './ui';

function MetricCard({ label, value, hint }) {
  return (
    <div className="dash-panel p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--dash-ink)]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--dash-muted)]">{hint}</p> : null}
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div>
      <dt className="text-xs text-[var(--dash-muted)]">{label}</dt>
      <dd className="mt-0.5 text-sm text-[var(--dash-ink)]">{children}</dd>
    </div>
  );
}

function EmailCampaignDetailInner({ campaignId }) {
  const router = useRouter();
  const toast = useToast();
  const perm = useEmailCampaignPermissions();

  const {
    campaign,
    analytics,
    loading,
    error,
    errorResult,
    reload,
    refreshAnalytics,
    deleteEmailCampaign,
    duplicateEmailCampaign,
    cancelEmailCampaign,
    pauseEmailCampaign,
    resumeEmailCampaign,
    sendEmailCampaignNow,
    listRecipients,
  } = useEmailCampaign(campaignId, { loadAnalytics: perm.analytics });

  const [recipients, setRecipients] = useState([]);
  const [recipientsTotal, setRecipientsTotal] = useState(0);
  const [recipientsLoading, setRecipientsLoading] = useState(true);
  const [recipientStatus, setRecipientStatus] = useState('');
  const [recipientOffset, setRecipientOffset] = useState(0);

  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const loadRecipients = useCallback(async () => {
    if (!campaignId) return;
    setRecipientsLoading(true);
    const result = await listRecipients({
      status: recipientStatus,
      limit: EMAIL_CAMPAIGN_LIST_LIMIT,
      offset: recipientOffset,
    });
    if (result.ok) {
      setRecipients(result.data.items || []);
      setRecipientsTotal(result.data.total || 0);
    } else {
      setRecipients([]);
      setRecipientsTotal(0);
    }
    setRecipientsLoading(false);
  }, [campaignId, listRecipients, recipientStatus, recipientOffset]);

  useEffect(() => {
    loadRecipients();
  }, [loadRecipients]);

  useEffect(() => {
    setRecipientOffset(0);
  }, [recipientStatus]);

  async function runConfirm() {
    if (!confirm?.run) return;
    setConfirmBusy(true);
    try {
      await confirm.run();
      setConfirm(null);
    } finally {
      setConfirmBusy(false);
    }
  }

  async function handleSendNow() {
    setActionBusy(true);
    const idempotencyKey =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `send-${Date.now()}`;
    try {
      const result = await sendEmailCampaignNow({ idempotencyKey });
      if (!result.ok) {
        toast.error(
          messageFromApiResult(result, 'Unable to send the email campaign. Please try again.', {
            resource: 'email campaign',
          }),
        );
        return;
      }
      toast.success('Send started');
      await reload();
      await refreshAnalytics();
      await loadRecipients();
    } catch (err) {
      toast.error(messageFromCaughtError(err, 'Unable to send the email campaign. Please try again.'));
    } finally {
      setActionBusy(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <LoadingState label="Loading email campaign…" />
      </PageContainer>
    );
  }

  if (error || !campaign) {
    return (
      <PageContainer>
        <ApiErrorBanner message={error || 'Email campaign not found.'} result={errorResult} />
        <div className="mt-4">
          <Button href="/dashboard/email-campaigns" variant="secondary">
            Back to email campaigns
          </Button>
        </div>
      </PageContainer>
    );
  }

  const status = String(campaign.status || '').toUpperCase();
  const editable = isEmailCampaignEditable(status);
  const metrics = analytics || {
    recipients: campaign.recipientCount,
    sent: campaign.sentCount,
    delivered: campaign.deliveredCount,
    opened: campaign.openedCount,
    clicked: campaign.clickedCount,
    openRate: 0,
    clickRate: 0,
  };

  const recipientColumns = [
    {
      key: 'email',
      header: 'Email',
      cell: (row) => row.email || '—',
    },
    {
      key: 'name',
      header: 'Customer',
      cell: (row) => row.customerName || '—',
    },
    {
      key: 'promo',
      header: 'Promo',
      cell: (row) => row.promoCode || '—',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'sentAt',
      header: 'Sent',
      cell: (row) => (row.sentAt ? formatDateTime(row.sentAt) : '—'),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={campaign.name || 'Email campaign'}
        description={campaign.subject || 'Marketing batch send'}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href="/dashboard/email-campaigns" variant="secondary">
              Back
            </Button>
            {perm.edit && editable ? (
              <Button
                href={`/dashboard/email-campaigns/${encodeURIComponent(campaign.id)}/edit`}
                variant="secondary"
              >
                <Pencil className="size-4" aria-hidden />
                Edit
              </Button>
            ) : null}
            {perm.send && status === 'DRAFT' ? (
              <Button
                disabled={actionBusy}
                onClick={() =>
                  setConfirm({
                    title: 'Send email campaign now?',
                    description: 'Recipients will be prepared and messages sent via the backend email provider.',
                    confirmLabel: 'Send now',
                    variant: 'primary',
                    run: handleSendNow,
                  })
                }
              >
                Send now
              </Button>
            ) : null}
            {perm.cancel && status === 'SENDING' ? (
              <Button
                variant="secondary"
                disabled={actionBusy}
                onClick={() =>
                  setConfirm({
                    title: 'Pause sending?',
                    description: 'In-flight batch processing will pause until resumed.',
                    confirmLabel: 'Pause',
                    variant: 'primary',
                    run: async () => {
                      const result = await pauseEmailCampaign();
                      if (!result.ok) {
                        toast.error(messageFromApiResult(result, 'Unable to pause. Please try again.'));
                        return;
                      }
                      toast.success('Campaign paused');
                      await reload();
                    },
                  })
                }
              >
                Pause
              </Button>
            ) : null}
            {perm.send && status === 'PAUSED' ? (
              <Button
                disabled={actionBusy}
                onClick={async () => {
                  setActionBusy(true);
                  const result = await resumeEmailCampaign();
                  setActionBusy(false);
                  if (!result.ok) {
                    toast.error(messageFromApiResult(result, 'Unable to resume. Please try again.'));
                    return;
                  }
                  toast.success('Campaign resumed');
                  await reload();
                }}
              >
                Resume
              </Button>
            ) : null}
            {perm.cancel && ['SCHEDULED', 'SENDING', 'PAUSED'].includes(status) ? (
              <Button
                variant="danger"
                disabled={actionBusy}
                onClick={() =>
                  setConfirm({
                    title: 'Cancel email campaign?',
                    description: 'Pending sends will stop. Already sent messages cannot be recalled.',
                    confirmLabel: 'Cancel campaign',
                    run: async () => {
                      const result = await cancelEmailCampaign();
                      if (!result.ok) {
                        toast.error(messageFromApiResult(result, 'Unable to cancel. Please try again.'));
                        return;
                      }
                      toast.success('Campaign cancelled');
                      await reload();
                    },
                  })
                }
              >
                Cancel
              </Button>
            ) : null}
            {perm.create ? (
              <Button
                variant="secondary"
                onClick={async () => {
                  const result = await duplicateEmailCampaign();
                  if (!result.ok) {
                    toast.error(messageFromApiResult(result, 'Unable to duplicate. Please try again.'));
                    return;
                  }
                  toast.success('Duplicated as draft');
                  router.push(
                    `/dashboard/email-campaigns/${encodeURIComponent(result.data.campaign.id)}`,
                  );
                }}
              >
                Duplicate
              </Button>
            ) : null}
            {perm.delete && status === 'DRAFT' ? (
              <Button
                variant="danger"
                onClick={() =>
                  setConfirm({
                    title: 'Delete draft?',
                    description: 'This permanently removes the draft email campaign.',
                    confirmLabel: 'Delete',
                    run: async () => {
                      const result = await deleteEmailCampaign();
                      if (!result.ok) {
                        toast.error(messageFromApiResult(result, 'Unable to delete. Please try again.'));
                        return;
                      }
                      toast.success('Draft deleted');
                      router.push('/dashboard/email-campaigns');
                    },
                  })
                }
              >
                Delete
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <StatusBadge status={campaign.status} />
        {campaign.scheduledAt ? (
          <span className="text-sm text-[var(--dash-muted)]">
            Scheduled {formatDateTime(campaign.scheduledAt)} ({campaign.timezone || 'Africa/Accra'})
          </span>
        ) : null}
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Recipients" value={formatNumber(metrics.recipients)} />
        <MetricCard label="Sent" value={formatNumber(metrics.sent)} />
        <MetricCard label="Delivered" value={formatNumber(metrics.delivered)} />
        <MetricCard label="Opened" value={formatNumber(metrics.opened)} />
        <MetricCard label="Clicked" value={formatNumber(metrics.clicked)} />
        {perm.analytics ? (
          <>
            <MetricCard
              label="Open rate"
              value={formatPercent(metrics.openRate, { ratio: true })}
            />
            <MetricCard
              label="Click rate"
              value={formatPercent(metrics.clickRate, { ratio: true })}
            />
          </>
        ) : null}
      </section>

      {analytics?.note ? (
        <p className="mb-6 text-sm text-[var(--dash-muted)]">{analytics.note}</p>
      ) : null}

      <section className="dash-panel mb-8 p-5">
        <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Summary</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Audience">{audienceSummary(campaign.audience)}</InfoRow>
          <InfoRow label="Promotion">{campaign.promotionName || '—'}</InfoRow>
          <InfoRow label="Voucher template">{campaign.templateName || '—'}</InfoRow>
          <InfoRow label="Promo mode">{campaign.promoMode || 'ASSIGN_AVAILABLE'}</InfoRow>
          <InfoRow label="From">{campaign.fromName || '—'}</InfoRow>
          <InfoRow label="Reply-to">{campaign.replyTo || '—'}</InfoRow>
          <InfoRow label="Created">{formatDateTime(campaign.createdAt)}</InfoRow>
          {campaign.startedAt ? (
            <InfoRow label="Started">{formatDateTime(campaign.startedAt)}</InfoRow>
          ) : null}
          {campaign.completedAt ? (
            <InfoRow label="Completed">{formatDateTime(campaign.completedAt)}</InfoRow>
          ) : null}
        </dl>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-[var(--dash-ink)]">Recipients</h2>
          <select
            value={recipientStatus}
            onChange={(e) => setRecipientStatus(e.target.value)}
            className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SENT">Sent</option>
            <option value="DELIVERED">Delivered</option>
            <option value="OPENED">Opened</option>
            <option value="CLICKED">Clicked</option>
            <option value="BOUNCED">Bounced</option>
            <option value="FAILED">Failed</option>
            <option value="SKIPPED">Skipped</option>
          </select>
        </div>

        {recipientsLoading ? (
          <LoadingState label="Loading recipients…" />
        ) : recipients.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No recipients yet"
            description="Recipients appear after validation or when sending starts."
          />
        ) : (
          <DataTable
            columns={recipientColumns}
            rows={recipients}
            getRowKey={(row) => row.id}
            minWidth="640px"
            footer={
              recipientsTotal > EMAIL_CAMPAIGN_LIST_LIMIT ? (
                <div className="flex justify-end gap-2 border-t border-[var(--dash-border)] px-4 py-3">
                  <Button
                    variant="secondary"
                    disabled={recipientOffset === 0}
                    onClick={() =>
                      setRecipientOffset(Math.max(0, recipientOffset - EMAIL_CAMPAIGN_LIST_LIMIT))
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={recipientOffset + EMAIL_CAMPAIGN_LIST_LIMIT >= recipientsTotal}
                    onClick={() => setRecipientOffset(recipientOffset + EMAIL_CAMPAIGN_LIST_LIMIT)}
                  >
                    Next
                  </Button>
                </div>
              ) : null
            }
          />
        )}
      </section>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        description={confirm?.description}
        confirmLabel={confirm?.confirmLabel}
        variant={confirm?.variant || 'danger'}
        busy={confirmBusy || actionBusy}
        onConfirm={runConfirm}
        onCancel={() => setConfirm(null)}
      />
    </PageContainer>
  );
}

export default function EmailCampaignDetailPage({ campaignId }) {
  return (
    <AuthGate permission={PERMISSIONS.EMAIL_CAMPAIGNS_VIEW}>
      <EmailCampaignDetailInner campaignId={campaignId} />
    </AuthGate>
  );
}
