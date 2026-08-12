import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { PLATFORM } from '../lib/platform';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const title = `${PLATFORM.name} — Digital Vouchers, Promo Codes & Campaign Management`;
const description = PLATFORM.description;

export const metadata = {
  metadataBase: new URL(PLATFORM.url),
  title: {
    default: title,
    template: `%s | ${PLATFORM.name}`,
  },
  description,
  applicationName: PLATFORM.name,
  authors: [{ name: PLATFORM.name, url: PLATFORM.url }],
  creator: PLATFORM.name,
  publisher: PLATFORM.name,
  keywords: [
    'KingProm',
    'promo codes',
    'digital vouchers',
    'campaign management',
    'QR redemption',
    'hospitality promotions',
  ],
  openGraph: {
    title,
    description: PLATFORM.shortDescription,
    url: PLATFORM.url,
    siteName: PLATFORM.name,
    locale: 'en_US',
    type: 'website',
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
    description: PLATFORM.shortDescription,
    images: [PLATFORM.branding.ogImageUrl],
  },
  icons: {
    icon: [{ url: PLATFORM.branding.markUrl, type: 'image/png' }],
    apple: [{ url: PLATFORM.branding.markUrl, type: 'image/png' }],
  },
  alternates: {
    canonical: `${PLATFORM.url}/`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F4F6F8',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
