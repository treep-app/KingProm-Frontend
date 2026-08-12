'use client';

export default function VoucherHeader({ children, primaryColor, accentColor }) {
  if (!children) return null;
  return (
    <header
      className="text-center text-xs font-semibold uppercase tracking-widest"
      style={{ color: accentColor || '#FFFFFF' }}
    >
      <span
        className="inline-block rounded-full px-3 py-1"
        style={{ backgroundColor: primaryColor || '#D99D26' }}
      >
        {children}
      </span>
    </header>
  );
}
