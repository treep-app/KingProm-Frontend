'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasAuth } from '../../lib/auth';

/**
 * Authenticated visitors hitting `/` go to the dashboard.
 * Respects client-side session tokens used by the existing AuthGate.
 */
export default function LandingAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (hasAuth()) {
      router.replace('/dashboard');
    }
  }, [router]);

  return null;
}
