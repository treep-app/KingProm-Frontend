import LandingPage from '../../components/landing/LandingPage';
import { PLATFORM } from '../../lib/platform';

export const metadata = {
  title: {
    absolute: `${PLATFORM.name} — Digital Vouchers, Promo Codes & Campaign Management`,
  },
  description:
    'Create, distribute and track digital vouchers, promo codes and customer campaigns with KingProm.',
  alternates: {
    canonical: `${PLATFORM.url}/`,
  },
  openGraph: {
    title: `${PLATFORM.name} — Digital Vouchers, Promo Codes & Campaign Management`,
    description:
      'Create, distribute and track digital vouchers, promo codes and customer campaigns with KingProm.',
    url: `${PLATFORM.url}/`,
    siteName: PLATFORM.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PLATFORM.name} — Digital Vouchers, Promo Codes & Campaign Management`,
    description:
      'Create, distribute and track digital vouchers, promo codes and customer campaigns with KingProm.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: PLATFORM.name,
      url: PLATFORM.url,
      description: PLATFORM.description,
    },
    {
      '@type': 'SoftwareApplication',
      name: PLATFORM.name,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: PLATFORM.url,
      description: PLATFORM.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free plan available',
      },
    },
  ],
};

export default function MarketingHomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
