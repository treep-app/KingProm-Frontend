import Image from 'next/image';
import { PLATFORM } from '../lib/platform';

const SIZES = {
  xs: { height: 22, width: 78 },
  sm: { height: 28, width: 100 },
  md: { height: 34, width: 122 },
  lg: { height: 44, width: 158 },
};

/**
 * Official KingProm platform logo.
 * Use `onDark` on navy/dark surfaces so the navy wordmark stays readable.
 */
export default function PlatformLogo({
  size = 'sm',
  className = '',
  priority = false,
  mark = false,
  onDark = false,
}) {
  const dims = SIZES[size] || SIZES.sm;
  const src = mark ? PLATFORM.branding.markUrl : PLATFORM.branding.logoUrl;
  const width = mark ? dims.height : dims.width;
  const height = dims.height;

  const image = (
    <Image
      src={src}
      alt={PLATFORM.name}
      width={width}
      height={height}
      priority={priority}
      className="h-full w-auto max-w-none object-contain object-left"
      style={{ height, width: 'auto' }}
    />
  );

  if (onDark && !mark) {
    return (
      <span
        className={[
          'platform-logo inline-flex items-center rounded-lg bg-white px-2.5 py-1.5 shadow-sm',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {image}
      </span>
    );
  }

  return (
    <span
      className={['platform-logo inline-flex items-center leading-none', className]
        .filter(Boolean)
        .join(' ')}
    >
      {image}
    </span>
  );
}
