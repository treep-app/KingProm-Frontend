import EmailCampaignDetailPage from '../../../../../components/dashboard/EmailCampaignDetailPage';

export const metadata = {
  title: 'Email campaign',
};

export default async function EmailCampaignDetailRoute({ params }) {
  const { id } = await params;
  return <EmailCampaignDetailPage campaignId={id} />;
}
