'use client';

import ScratchTicket from '../ScratchTicket';
import { normalizeExperience } from '../../lib/revealEffects';

/**
 * Mini guest-ticket preview for template editor (reveal effect + interaction mode).
 */
export default function TemplateScratchPreview({ config, storeName = 'Your business' }) {
  const experience = normalizeExperience(config?.experience);

  return (
    <div className="rounded-xl border border-[var(--dash-border)] bg-[#0b1220] p-4">
      <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-wide text-white/50">
        Guest reveal preview (sample data)
      </p>
      <ScratchTicket
        offerTitle="20% OFF"
        offerSubtitle="Your exclusive seasonal offer"
        promoCode="SAMPLE-CODE"
        storeName={storeName}
        revealEffect={experience.revealEffect}
        revealMode={experience.revealMode}
      />
    </div>
  );
}