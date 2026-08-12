'use client';

export default function VoucherValidity({
  label,
  value,
  secondaryColor,
  bodyStyle = 'sans',
}) {
  if (!value) return null;
  return (
    <div
      className={`text-center text-sm ${bodyStyle === 'serif' ? 'font-serif' : 'font-sans'}`}
      style={{ color: secondaryColor || '#091B34' }}
    >
      {label ? (
        <span className="font-semibold">{label}: </span>
      ) : null}
      <span>{value}</span>
    </div>
  );
}
