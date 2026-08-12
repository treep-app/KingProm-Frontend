'use client';

import dynamic from 'next/dynamic';
import { LoadingState, PageContainer } from '../../../../components/dashboard/ui';

const AnalyticsDashboard = dynamic(
  () => import('../../../../components/dashboard/AnalyticsDashboard'),
  {
    ssr: false,
    loading: () => (
      <PageContainer>
        <LoadingState rows={6} label="Loading analytics…" />
      </PageContainer>
    ),
  },
);

export default function AnalyticsClient() {
  return <AnalyticsDashboard />;
}
