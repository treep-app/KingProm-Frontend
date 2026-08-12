'use client';

export default function VoucherPromoCode({ children, secondaryColor, accentColor }) {
  if (!children) return null;
  return (
    <div className="text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70" style={{ color: secondaryColor }}>
        Promo code
      </p>
      <p
        className="mt-1 inline-block rounded-lg px-4 py-2 font-mono text-lg font-bold tracking-wider"
        style={{
          color: secondaryColor || '#091B34',
          backgroundColor: accentColor || '#FFFFFF',
          border: `2px dashed ${secondaryColor || '#091B34'}`,
        }}
      >
        {children}
      </p>
    </div>
  );
}
