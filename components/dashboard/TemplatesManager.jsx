'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Archive,
  Copy,
  Eye,
  LayoutTemplate,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Star,
} from 'lucide-react';
import { PERMISSIONS } from '../../lib/permissions';
import { useTemplates } from '../../hooks/useTemplates';
import { messageFromApiResult } from '../../lib/api/errors';
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_STATUS_OPTIONS,
  TEMPLATE_SORT_OPTIONS,
} from '../../lib/dashboard/templateCategories';
import { buildSamplePreviewContext } from '../../lib/dashboard/voucherVariables';
import { DASH_INPUT_SEARCH_CLASS, DASH_SELECT_COMPACT_CLASS } from '../../lib/dashboard/styles';
import { formatDateTime } from '../../lib/format';
import AuthGate from './AuthGate';
import ConfirmDialog from './ConfirmDialog';
import { ApiErrorBanner } from './AlertBanner';
import StatusBadge from './StatusBadge';
import TemplatePreviewModal from './TemplatePreviewModal';
import { TemplateRenderer } from './voucher/VoucherPreview';
import { useTemplatePermissions } from './WorkspaceProvider';
import { useToast } from './ToastProvider';
import {
  Button,
  EmptyState,
  LoadingState,
  PageContainer,
  PageHeader,
} from './ui';

function TemplateCard({
  template,
  onPreview,
  onEdit,
  onDuplicate,
  onSetDefault,
  onArchive,
  canEdit,
  canDuplicate,
  canSetDefault,
  canArchive,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const context = useMemo(() => buildSamplePreviewContext(), []);

  return (
    <article className="dash-panel flex flex-col overflow-hidden">
      <div className="relative border-b border-[var(--dash-border)] bg-[var(--dash-surface-2)] p-2">
        <div className="pointer-events-none scale-[0.55] origin-top-left sm:scale-[0.65]">
          <TemplateRenderer
            config={template.config}
            context={context}
            logoUrl={template.logoUrl}
            backgroundUrl={template.backgroundUrl}
            compact
            showSampleBadge
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[var(--dash-ink)]">
              {template.name}
            </h3>
            <p className="text-xs text-[var(--dash-muted)]">{template.category}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {template.isDefault ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                <Star className="size-3 fill-current" />
                Default
              </span>
            ) : null}
            <StatusBadge status={template.status} />
          </div>
        </div>
        {template.description ? (
          <p className="line-clamp-2 text-xs text-[var(--dash-muted)]">{template.description}</p>
        ) : null}
        <p className="text-[10px] text-[var(--dash-muted)]">
          {template.campaignCount
            ? `${template.campaignCount} campaign${template.campaignCount === 1 ? '' : 's'}`
            : 'No campaigns'}{' '}
          · Updated {formatDateTime(template.updatedAt) || '—'}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => onPreview(template)}>
            <Eye className="size-3.5" />
            Preview
          </Button>
          {canEdit ? (
            <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(template)}>
              <Pencil className="size-3.5" />
              Edit
            </Button>
          ) : null}
          <div className="relative ml-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="More actions"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreHorizontal className="size-4" />
            </Button>
            {menuOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-[var(--dash-border)] bg-white py-1 shadow-lg">
                  {canDuplicate ? (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--dash-surface-2)]"
                      onClick={() => {
                        setMenuOpen(false);
                        onDuplicate(template);
                      }}
                    >
                      <Copy className="size-3.5" />
                      Duplicate
                    </button>
                  ) : null}
                  {canSetDefault && !template.isDefault && template.status === 'ACTIVE' ? (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--dash-surface-2)]"
                      onClick={() => {
                        setMenuOpen(false);
                        onSetDefault(template);
                      }}
                    >
                      <Star className="size-3.5" />
                      Set default
                    </button>
                  ) : null}
                  {canArchive && template.status !== 'ARCHIVED' ? (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
                      onClick={() => {
                        setMenuOpen(false);
                        onArchive(template);
                      }}
                    >
                      <Archive className="size-3.5" />
                      Archive
                    </button>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function TemplatesManagerInner() {
  const router = useRouter();
  const toast = useToast();
  const templatesPerm = useTemplatePermissions();

  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('updatedAt');
  const [sortDir, setSortDir] = useState('desc');

  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const {
    items,
    total,
    loading,
    error,
    errorResult,
    reload,
    duplicateTemplate,
    archiveTemplate,
    setDefaultTemplate,
  } = useTemplates({ q: query, category, status, sort, sortDir });

  async function handleDuplicate(template) {
    const result = await duplicateTemplate(template.id);
    if (!result.ok) {
      toast.error(
        messageFromApiResult(result, 'Unable to duplicate the template.', {
          resource: 'template',
        }),
      );
      return;
    }
    toast.success('Template duplicated');
    reload();
    if (result.data?.template?.id) {
      router.push(`/dashboard/templates/${encodeURIComponent(result.data.template.id)}/edit`);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Voucher templates"
        description="Design how promo vouchers look when sent to guests."
        actions={
          templatesPerm.create ? (
            <Button href="/dashboard/templates/new">
              <Plus className="size-4" />
              Create template
            </Button>
          ) : null
        }
      />

      {error ? <ApiErrorBanner result={errorResult} message={error} /> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--dash-muted)]" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search templates…"
            className={DASH_INPUT_SEARCH_CLASS}
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={DASH_SELECT_COMPACT_CLASS}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {TEMPLATE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={DASH_SELECT_COMPACT_CLASS}
          aria-label="Filter by status"
        >
          {TEMPLATE_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className={DASH_SELECT_COMPACT_CLASS}
          aria-label="Sort by"
        >
          {TEMPLATE_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value)}
          className={DASH_SELECT_COMPACT_CLASS}
          aria-label="Sort direction"
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      </div>

      {loading ? (
        <LoadingState rows={6} label="Loading templates…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title={query || category || status ? 'No templates match' : 'No templates yet'}
          description={
            query || category || status
              ? 'Try different filters or clear your search.'
              : 'Create a voucher template to customize how promo codes appear to guests.'
          }
          action={
            templatesPerm.create && !query && !category && !status ? (
              <Button href="/dashboard/templates/new">
                <Plus className="size-4" />
                Create template
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          <p className="text-xs text-[var(--dash-muted)]">
            {total} template{total === 1 ? '' : 's'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                canEdit={templatesPerm.edit}
                canDuplicate={templatesPerm.duplicate}
                canSetDefault={templatesPerm.setDefault}
                canArchive={templatesPerm.archive}
                onPreview={setPreviewTemplate}
                onEdit={(t) =>
                  router.push(`/dashboard/templates/${encodeURIComponent(t.id)}/edit`)
                }
                onDuplicate={handleDuplicate}
                onSetDefault={(t) =>
                  setConfirm({
                    title: 'Set as default template?',
                    description: `"${t.name}" will be used when campaigns don't specify a template.`,
                    confirmLabel: 'Set default',
                    variant: 'primary',
                    run: async () => {
                      const result = await setDefaultTemplate(t.id);
                      if (!result.ok) {
                        toast.error(
                          messageFromApiResult(result, 'Unable to set default template.'),
                        );
                        return;
                      }
                      toast.success('Default template updated');
                      reload();
                    },
                  })
                }
                onArchive={(t) =>
                  setConfirm({
                    title: 'Archive template?',
                    description: `Archive "${t.name}"?${
                      t.campaignCount
                        ? ` It is linked to ${t.campaignCount} campaign${t.campaignCount === 1 ? '' : 's'}.`
                        : ''
                    } Archived templates stay available for existing campaigns but can't be selected for new ones.`,
                    confirmLabel: 'Archive',
                    run: async () => {
                      const result = await archiveTemplate(t.id);
                      if (!result.ok) {
                        toast.error(
                          messageFromApiResult(result, 'Unable to archive the template.'),
                        );
                        return;
                      }
                      toast.success('Template archived');
                      reload();
                    },
                  })
                }
              />
            ))}
          </div>
        </>
      )}

      <TemplatePreviewModal
        open={Boolean(previewTemplate)}
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title || ''}
        description={confirm?.description}
        confirmLabel={confirm?.confirmLabel}
        variant={confirm?.variant || 'danger'}
        busy={confirmBusy}
        onCancel={() => {
          if (!confirmBusy) setConfirm(null);
        }}
        onConfirm={async () => {
          if (!confirm?.run) return;
          setConfirmBusy(true);
          try {
            await confirm.run();
            setConfirm(null);
          } finally {
            setConfirmBusy(false);
          }
        }}
      />
    </PageContainer>
  );
}

export default function TemplatesManager() {
  return (
    <AuthGate permission={PERMISSIONS.TEMPLATES_VIEW}>
      <TemplatesManagerInner />
    </AuthGate>
  );
}
