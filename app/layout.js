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

export const metadata = {
  metadataBase: new URL(PLATFORM.url),
  title: {
    default: `${PLATFORM.name} — Digital Vouchers, Promo Codes & Campaign Management`,
    template: `%s | ${PLATFORM.name}`,
  },
  description: PLATFORM.description,
  openGraph: {
    title: `${PLATFORM.name} — Digital Vouchers, Promo Codes & Campaign Management`,
    description: PLATFORM.shortDescription,
    url: PLATFORM.url,
    siteName: PLATFORM.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: PLATFORM.name,
    description: PLATFORM.shortDescription,
  },
  alternates: {
    canonical: `${PLATFORM.url}/`,
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
