export const metadata = {
  title: 'Golden Ticket',
  description:
    'Scratch to reveal your exclusive guest offer — personalized digital voucher experience',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Golden Ticket',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#020617',
};

export default function PromoLayout({ children }) {
  return <div className="promo-shell">{children}</div>;
}
