/**
 * Dashboard design system — prefer these exports for new UI.
 *
 * Existing files (DashboardShell, StatCard, StatusBadge, etc.) remain the
 * source of truth; this barrel aliases + adds missing primitives.
 */

// Layout / chrome (existing)
export { default as DashboardLayout } from '../DashboardShell';
export { default as Sidebar } from '../DashboardSidebar';
export { default as Header } from '../DashboardTopbar';

// Existing building blocks
export { default as PageHeader } from '../PageHeader';
export { default as StatusBadge } from '../StatusBadge';
export { default as EmptyState } from '../EmptyState';
export { default as StatCard } from '../StatCard';
export { ActivityItem, ActivityFeed } from '../activity';

// Aliases + new primitives
export { default as MetricCard } from './MetricCard';
export { default as PageContainer } from './PageContainer';
export { default as SectionHeader } from './SectionHeader';
export { default as Breadcrumbs } from './Breadcrumbs';
export { default as Button } from './Button';
export { default as LoadingState } from './LoadingState';
export { default as ErrorState } from './ErrorState';
export { default as DataTable } from './DataTable';
export { default as Sheet } from './Sheet';
export { default as DashboardSessionSkeleton } from '../DashboardSessionSkeleton';

export {
  WorkspaceProvider,
  useWorkspace,
  useTenant,
  useCurrentUser,
  useBranding,
  useCan,
  useCampaignPermissions,
  usePromoCodePermissions,
  useCustomerPermissions,
  useTemplatePermissions,
  useBrandingPermissions,
  useEmailCampaignPermissions,
  useRedemptionPermissions,
} from '../WorkspaceProvider';

export { default as AlertBanner, ApiErrorBanner } from '../AlertBanner';
export { default as ConfirmDialog } from '../ConfirmDialog';
