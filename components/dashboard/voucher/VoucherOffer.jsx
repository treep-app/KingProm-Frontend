'use client';

export default function VoucherOffer({ children, primaryColor }) {
  if (!children) return null;
  return (
    <p
      className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
      style={{ color: primaryColor || '#D99D26' }}
    >
      {children}
    </p>
  );
}
