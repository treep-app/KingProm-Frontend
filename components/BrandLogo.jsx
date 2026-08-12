import { getTenantBranding } from '../lib/tenant';

/**
 * Tenant wordmark — navy primary + gold accent for light/dashboard surfaces.
 * Do not hardcode a venue name here; pass branding from WorkspaceProvider.
 */
export default function BrandLogo({
  size = 'md',
  className = '',
  variant = 'dark',
  as: Tag = 'span',
  branding: brandingProp = null,
}) {
  const branding = brandingProp || getTenantBranding();
  const sizes = {
    sm: 'text-xl md:text-2xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-3xl md:text-4xl',
  };

  const isLight = variant === 'light' || variant === 'brand';
  const primaryColor = isLight
    ? 'text-[hsl(var(--navy-dark))]'
    : 'text-white';
  const accentColor = isLight
    ? 'text-[hsl(var(--gold))]'
    : 'text-[hsl(var(--gold-light))]';

  const primary = branding.wordmarkPrimary || branding.displayName || 'Workspace';
  const accent = branding.wordmarkAccent || '';

  return (
    <Tag
      className={[
        'font-display font-bold tracking-tight',
        sizes[size] || sizes.md,
        primaryColor,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={primaryColor}>{primary}</span>
      {accent ? (
        <>
          {' '}
          <span className={`${accentColor} font-bold`}>{accent}</span>
        </>
      ) : null}
    </Tag>
  );
}
