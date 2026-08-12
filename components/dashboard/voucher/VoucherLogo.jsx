'use client';

export default function VoucherLogo({ src, alt = 'Logo' }) {
  if (!src) return null;
  return (
    <div className="flex justify-center">
      <img
        src={src}
        alt={alt}
        className="max-h-14 max-w-[160px] object-contain"
      />
    </div>
  );
}
