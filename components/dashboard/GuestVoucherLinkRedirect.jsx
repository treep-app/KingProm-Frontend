'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TicketLoadingPlaceholder from '../TicketLoadingPlaceholder';

/**
 * Legacy QR links pointed at /dashboard/redeem?v=… which forces login.
 * Guests without a session are sent to the public /voucher pass page.
 */
export default function GuestVoucherLinkRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const v = searchParams.get('v');
    const token = searchParams.get('token');
    const guestJwt = token || v;

    if (guestJwt && guestJwt.split('.').length === 3) {
      router.replace(`/golden-ticket?token=${encodeURIComponent(guestJwt)}`);
      return;
    }

    if (v) {
      router.replace(`/voucher?v=${encodeURIComponent(v)}`);
      return;
    }

    if (token) {
      router.replace(`/voucher?token=${encodeURIComponent(token)}`);
    }
  }, [router, searchParams]);

  return <TicketLoadingPlaceholder message="Opening your voucher…" />;
}