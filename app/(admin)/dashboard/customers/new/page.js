import CustomerFormPage from '../../../../../components/dashboard/CustomerFormPage';

export const metadata = {
  title: 'Add customer',
};

export default function NewCustomerPage() {
  return <CustomerFormPage mode="create" />;
}
