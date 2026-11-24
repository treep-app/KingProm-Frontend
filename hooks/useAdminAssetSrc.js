'use client';

import { useEffect, useState } from 'react';
import { fetchAssetBlobUrl } from '../lib/api/brandingService';

function isDirectSrc(value) {
  const s = String(value || '');
  return (
    s.startsWith('data:') ||
    s.startsWith('blob:') ||
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('/brand/')
  );
}

/**
 * Resolve /api/admin/assets/:id paths to a blob URL (Bearer auth via fetch).
 * Data URLs and public paths pass through unchanged.
 */
export function useAdminAssetSrc(assetPath) {
  const [src, setSrc] = useState(() => (isDirectSrc(assetPath) ? assetPath : null));

  useEffect(() => {
    if (!assetPath) {
      setSrc(null);
      return undefined;
    }
    if (isDirectSrc(assetPath)) {
      setSrc(assetPath);
      return undefined;
    }

    let blobUrl = null;
    let cancelled = false;

    (async () => {
      blobUrl = await fetchAssetBlobUrl(assetPath);
      if (!cancelled) {
        setSrc(blobUrl || null);
      }
    })();

    return () => {
      cancelled = true;
      if (blobUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [assetPath]);

  return src;
}

export default useAdminAssetSrc;