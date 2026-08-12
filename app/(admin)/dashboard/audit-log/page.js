'use client';

import { ArrowLeft } from 'lucide-react';
import { ActivityFeed } from '../../../../components/dashboard/activity';
import {
  Button,
  PageContainer,
  PageHeader,
} from '../../../../components/dashboard/ui';
import {
  DEMO_ACTIVITY_ITEMS,
  DEMO_ACTIVITY_NOTE,
} from '../../../../lib/dashboard/demoActivity';

export default function AuditLogPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Audit log"
        description="Operator actions across tickets, campaigns, and settings."
        actions={
          <Button href="/dashboard" variant="secondary">
            <ArrowLeft className="size-4" />
            Dashboard
          </Button>
        }
      />

      <ActivityFeed
        items={DEMO_ACTIVITY_ITEMS}
        source="demo"
        status="ready"
        demoNote={DEMO_ACTIVITY_NOTE}
      />
    </PageContainer>
  );
}
