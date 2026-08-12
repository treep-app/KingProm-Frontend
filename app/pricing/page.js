import PricingPage from '../../components/PricingPage';
import { PLATFORM } from '../../lib/platform';

export const metadata = {
  title: 'Pricing',
  description: `${PLATFORM.name} subscription plans for hotels, restaurants, and events.`,
};

export default function PricingRoute() {
  return <PricingPage />;
}
