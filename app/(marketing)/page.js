import LandingPage from '../../components/landing/LandingPage';
import { PLATFORM } from '../../lib/platform';

const title = `${PLATFORM.name} — Digital Vouchers, Promo Codes & Campaign Management`;
const description =
  'Create, distribute and track digital vouchers, promo codes and customer campaigns with KingProm.';

export const metadata = {
  title: {
    absolute: title,
  },
  description,
  alternates: {
    canonical: `${PLATFORM.url}/`,
  },
  openGraph: {
    title,
    description,
    url: `${PLATFORM.url}/`,
    siteName: PLATFORM.name,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: PLATFORM.branding.ogImageUrl,
        width: 1200,
        height: 630,
        alt: `${PLATFORM.name} — Turn promotions into revenue`,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [PLATFORM.branding.ogImageUrl],
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
      logo: `${PLATFORM.url}${PLATFORM.branding.logoUrl}`,
      image: `${PLATFORM.url}${PLATFORM.branding.ogImageUrl}`,
      sameAs: [`https://www.${PLATFORM.domain}/`],
    },
    {
      '@type': 'WebSite',
      name: PLATFORM.name,
      url: PLATFORM.url,
      description,
      publisher: {
        '@type': 'Organization',
        name: PLATFORM.name,
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: PLATFORM.name,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: PLATFORM.url,
      description: PLATFORM.description,
      image: `${PLATFORM.url}${PLATFORM.branding.ogImageUrl}`,
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
