'use client';

export default function VoucherFooter({ children, bodyStyle = 'sans', secondaryColor }) {
  if (!children) return null;
  return (
    <footer
      className={`text-center text-xs opacity-80 ${bodyStyle === 'serif' ? 'font-serif' : 'font-sans'}`}
      style={{ color: secondaryColor || '#091B34' }}
    >
      {children}
    </footer>
  );
}
