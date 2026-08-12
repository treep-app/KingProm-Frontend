import Link from 'next/link';

/**
 * Variant classes are defined in globals.css (.dash-btn-*) outside Tailwind
 * layers so link text contrast is never overridden by `a { color: inherit }`.
 */
const VARIANTS = {
  primary: 'dash-btn-primary',
  secondary: 'dash-btn-secondary',
  ghost: 'dash-btn-ghost',
  danger: 'dash-btn-danger',
};

const SIZES = {
  sm: 'dash-btn-sm',
  md: 'dash-btn-md',
  lg: 'dash-btn-lg',
};

/**
 * Dashboard button variants. Prefer this over ad-hoc utility stacks for CTAs.
 * Existing `.dash-btn-primary` / `.dash-btn-secondary` remain the contrast source of truth.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  href = null,
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  children,
  ...props
}) {
  const isDisabled = disabled || loading;
  const classes = [
    'dash-btn',
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href && !isDisabled) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
