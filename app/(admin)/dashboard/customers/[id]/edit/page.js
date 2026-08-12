import CustomerFormPage from '../../../../../../components/dashboard/CustomerFormPage';

export const metadata = {
  title: 'Edit customer',
};

export default async function EditCustomerPage({ params }) {
  const { id } = await params;
  return <CustomerFormPage mode="edit" customerId={id} />;
}
