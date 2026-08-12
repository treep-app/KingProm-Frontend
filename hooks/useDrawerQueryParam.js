'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * URL-driven drawer state: ?campaign=id / ?customer=id / etc.
 * Browser back closes the drawer without leaving the list page.
 */
export function useDrawerQueryParam(paramName) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = searchParams?.get(paramName) || null;

  const setValue = useCallback(
    (next) => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      if (next) params.set(paramName, String(next));
      else params.delete(paramName);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [paramName, pathname, router, searchParams],
  );

  const open = useCallback((id) => setValue(id), [setValue]);
  const close = useCallback(() => setValue(null), [setValue]);

  return useMemo(
    () => ({
      value,
      open: Boolean(value),
      setValue,
      openDrawer: open,
      closeDrawer: close,
    }),
    [value, setValue, open, close],
  );
}

export default useDrawerQueryParam;
