'use client';

export default function VoucherQRCodePlaceholder({ secondaryColor, accentColor, compact = false }) {
  const size = compact ? 'size-16' : 'size-24';
  return (
    <div
      className={`flex ${size} flex-col items-center justify-center rounded-lg border-2 border-dashed`}
      style={{
        borderColor: secondaryColor || '#091B34',
        backgroundColor: accentColor || '#FFFFFF',
        color: secondaryColor || '#091B34',
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-8 opacity-40" fill="currentColor">
        <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h3v2h-3v-2zm0 4h3v2h-3v-2z" />
      </svg>
      <span className="mt-0.5 text-[8px] font-medium uppercase opacity-50">QR</span>
    </div>
  );
}
