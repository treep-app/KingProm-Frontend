import CustomerDetailPage from '../../../../../components/dashboard/CustomerDetailPage';

export const metadata = {
  title: 'Customer',
};

export default async function CustomerProfilePage({ params }) {
  const { id } = await params;
  return <CustomerDetailPage customerId={id} />;
}
