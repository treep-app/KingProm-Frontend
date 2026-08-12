'use client';

export default function VoucherDescription({ children, bodyStyle = 'sans', secondaryColor }) {
  if (!children) return null;
  return (
    <p
      className={`text-center text-sm leading-relaxed opacity-90 ${
        bodyStyle === 'serif' ? 'font-serif' : 'font-sans'
      }`}
      style={{ color: secondaryColor || '#091B34' }}
    >
      {children}
    </p>
  );
}
