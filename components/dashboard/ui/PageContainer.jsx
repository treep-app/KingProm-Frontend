/**
 * Standard content width + vertical rhythm for dashboard pages.
 */
export default function PageContainer({ children, className = '', wide = false }) {
  const hasCustomWidth = /\bmax-w-/.test(className);
  return (
    <div
      className={[
        'mx-auto w-full min-w-0 space-y-6 sm:space-y-8',
        !hasCustomWidth ? (wide ? 'max-w-7xl' : 'max-w-6xl') : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
