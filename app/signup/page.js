import SignupForm from '../../components/landing/SignupForm';
import { PLATFORM } from '../../lib/platform';

export const metadata = {
  title: 'Sign Up',
  description: `Create your ${PLATFORM.name} workspace and start on the Free plan.`,
  alternates: {
    canonical: `${PLATFORM.url}/signup`,
  },
};

export default function SignupPage() {
  return <SignupForm />;
}
