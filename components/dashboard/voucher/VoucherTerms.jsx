'use client';

export default function VoucherTerms({ children, bodyStyle = 'sans', secondaryColor }) {
  if (!children) return null;
  return (
    <div
      className={`border-t border-black/10 pt-3 text-[10px] leading-relaxed opacity-75 ${
        bodyStyle === 'serif' ? 'font-serif' : 'font-sans'
      }`}
      style={{ color: secondaryColor || '#091B34' }}
    >
      {children}
    </div>
  );
}
