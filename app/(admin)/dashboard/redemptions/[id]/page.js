import RedemptionDetailPage from '../../../../../components/dashboard/RedemptionDetailPage';

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Redemption ${id}` };
}

export default async function RedemptionDetailRoute({ params }) {
  const { id } = await params;
  return <RedemptionDetailPage redemptionId={id} />;
}
