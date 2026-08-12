'use client';

import TemplateRenderer from './TemplateRenderer';

/**
 * Live voucher preview wrapper — accepts flat props or a full config object.
 */
export default function VoucherPreview({
  config,
  context,
  colors,
  content,
  logoUrl,
  backgroundUrl,
  qrPosition,
  typography,
  background,
  showSampleBadge = true,
  compact = false,
  className = '',
}) {
  const mergedConfig = config || {
    primaryColor: colors?.primary,
    secondaryColor: colors?.secondary,
    accentColor: colors?.accent,
    content: content || {},
    typography: typography || {},
    layout: { qrPosition: qrPosition || 'right' },
    background: background || {},
  };

  return (
    <div className={className}>
      <TemplateRenderer
        config={mergedConfig}
        context={context}
        logoUrl={logoUrl}
        backgroundUrl={backgroundUrl}
        compact={compact}
        showSampleBadge={showSampleBadge}
      />
    </div>
  );
}

export { TemplateRenderer };
