'use client';

import { useAdminAssetSrc } from '../../../hooks/useAdminAssetSrc';
import { renderTemplateString } from '../../../lib/dashboard/voucherVariables';
import VoucherDescription from './VoucherDescription';
import VoucherFooter from './VoucherFooter';
import VoucherHeader from './VoucherHeader';
import VoucherLogo from './VoucherLogo';
import VoucherOffer from './VoucherOffer';
import VoucherPromoCode from './VoucherPromoCode';
import VoucherQRCodePlaceholder from './VoucherQRCodePlaceholder';
import VoucherTerms from './VoucherTerms';
import VoucherTitle from './VoucherTitle';
import VoucherValidity from './VoucherValidity';

/**
 * Renders a template config + context into voucher preview sections.
 */
export default function TemplateRenderer({
  config,
  context,
  logoUrl,
  backgroundUrl,
  compact = false,
  showSampleBadge = false,
}) {
  const resolvedLogoUrl = useAdminAssetSrc(logoUrl);
  const resolvedBackgroundUrl = useAdminAssetSrc(backgroundUrl);

  const cfg = config || {};
  const content = cfg.content || {};
  const typography = cfg.typography || {};
  const layout = cfg.layout || {};
  const background = cfg.background || {};

  const primaryColor = cfg.primaryColor;
  const secondaryColor = cfg.secondaryColor;
  const accentColor = cfg.accentColor;

  const rendered = {};
  for (const key of Object.keys(content)) {
    rendered[key] = renderTemplateString(content[key], context);
  }

  const qrPosition = layout.qrPosition || 'right';
  const overlayOpacity = Number.isFinite(Number(background.overlayOpacity))
    ? Number(background.overlayOpacity)
    : 0.5;

  const mainContent = (
    <div className="relative z-10 flex flex-1 flex-col gap-3 p-4 sm:p-5">
      {showSampleBadge ? (
        <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
          Sample preview
        </span>
      ) : null}
      <VoucherHeader primaryColor={primaryColor} accentColor={accentColor}>
        {rendered.header}
      </VoucherHeader>
      <VoucherLogo src={resolvedLogoUrl} />
      <VoucherTitle
        headingStyle={typography.headingStyle}
        secondaryColor={secondaryColor}
      >
        {rendered.title}
      </VoucherTitle>
      <VoucherOffer primaryColor={primaryColor}>{rendered.offer}</VoucherOffer>
      <VoucherDescription
        bodyStyle={typography.bodyStyle}
        secondaryColor={secondaryColor}
      >
        {rendered.description}
      </VoucherDescription>
      <VoucherPromoCode secondaryColor={secondaryColor} accentColor={accentColor}>
        {rendered.promoCode}
      </VoucherPromoCode>
      <VoucherValidity
        label={rendered.validityLabel || content.validityLabel}
        value={rendered.validityValue}
        bodyStyle={typography.bodyStyle}
        secondaryColor={secondaryColor}
      />
      {rendered.customerValue ? (
        <VoucherValidity
          label={rendered.customerLabel || content.customerLabel}
          value={rendered.customerValue}
          bodyStyle={typography.bodyStyle}
          secondaryColor={secondaryColor}
        />
      ) : null}
      <VoucherTerms bodyStyle={typography.bodyStyle} secondaryColor={secondaryColor}>
        {rendered.terms}
      </VoucherTerms>
      <VoucherFooter bodyStyle={typography.bodyStyle} secondaryColor={secondaryColor}>
        {rendered.footer}
      </VoucherFooter>
    </div>
  );

  const qrBlock = (
    <div className="flex shrink-0 items-center justify-center p-3">
      <VoucherQRCodePlaceholder
        secondaryColor={secondaryColor}
        accentColor={accentColor}
        compact={compact}
      />
    </div>
  );

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-[var(--dash-border)] shadow-sm"
      style={{ backgroundColor: accentColor || '#FFFFFF' }}
    >
      {resolvedBackgroundUrl ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${resolvedBackgroundUrl})`,
              backgroundPosition: background.position || 'center',
              backgroundSize: background.size || 'cover',
            }}
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(9, 27, 52, ${overlayOpacity})` }}
          />
        </>
      ) : null}
      <div
        className={`relative flex ${
          qrPosition === 'bottom' ? 'flex-col' : 'flex-row'
        } ${qrPosition === 'left' ? 'flex-row-reverse' : ''}`}
      >
        <div className="flex min-w-0 flex-1 flex-col">{mainContent}</div>
        {qrBlock}
      </div>
    </div>
  );
}
