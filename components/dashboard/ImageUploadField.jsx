'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Button } from './ui';

const ACCEPT = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Image upload with local preview. Calls onUpload(dataUrl) on confirm.
 */
export default function ImageUploadField({
  label,
  hint = 'PNG, JPEG, or WebP · max 2 MB',
  currentUrl,
  onUpload,
  onRemove,
  uploading = false,
  disabled = false,
  maxBytes = MAX_BYTES,
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!preview) return undefined;
    return () => {
      if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function handlePick(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    if (!ACCEPT.includes(file.type)) {
      setError('Use PNG, JPEG, or WebP.');
      return;
    }
    if (file.size > maxBytes) {
      const mb = (maxBytes / (1024 * 1024)).toFixed(maxBytes >= 1024 * 1024 ? 0 : 2);
      setError(`Image must be ${mb} MB or smaller.`);
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPreview(URL.createObjectURL(file));
      await onUpload?.(dataUrl);
    } catch {
      setError('Upload failed. Try another image.');
    }
  }

  const displayUrl = preview || currentUrl;

  return (
    <div>
      {label ? (
        <p className="mb-1.5 text-xs font-medium text-[var(--dash-muted)]">{label}</p>
      ) : null}
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex size-24 items-center justify-center overflow-hidden rounded-xl border border-dashed border-[var(--dash-border)] bg-[var(--dash-surface-2)]">
          {displayUrl ? (
            <img src={displayUrl} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-8 text-[var(--dash-muted)] opacity-50" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT.join(',')}
            className="hidden"
            disabled={disabled || uploading}
            onChange={handlePick}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled || uploading}
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {currentUrl ? 'Replace image' : 'Upload image'}
          </Button>
          {currentUrl && onRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || uploading}
              onClick={() => {
                setPreview(null);
                onRemove();
              }}
            >
              <X className="size-3.5" />
              Remove
            </Button>
          ) : null}
          {hint ? <p className="text-xs text-[var(--dash-muted)]">{hint}</p> : null}
          {error ? <p className="text-xs text-rose-700">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
