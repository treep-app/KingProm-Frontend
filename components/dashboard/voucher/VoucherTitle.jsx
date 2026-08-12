'use client';

export default function VoucherTitle({ children, headingStyle = 'serif', secondaryColor }) {
  if (!children) return null;
  return (
    <h2
      className={`text-center text-xl font-bold leading-tight sm:text-2xl ${
        headingStyle === 'sans' ? 'font-sans' : 'font-serif'
      }`}
      style={{ color: secondaryColor || '#091B34' }}
    >
      {children}
    </h2>
  );
}
