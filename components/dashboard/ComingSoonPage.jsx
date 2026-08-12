import {
  Button,
  EmptyState,
  PageContainer,
  PageHeader,
} from './ui';

/**
 * Lightweight stub for planned dashboard modules.
 * Does not invent APIs or fake data.
 */
export default function ComingSoonPage({
  title,
  description,
  icon: Icon,
}) {
  return (
    <PageContainer>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={Icon}
        title={`${title} is planned`}
        description="This route is reserved in the dashboard IA. The shell and auth are ready — module UI ships when the backend contract exists."
        action={
          <Button href="/dashboard" variant="secondary">
            Back to overview
          </Button>
        }
      />
    </PageContainer>
  );
}
