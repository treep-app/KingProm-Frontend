'use client';

import { useEffect, useId, useState } from 'react';
import { DASH_INPUT_CLASS } from '../../lib/dashboard/styles';

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function normalizeHex(value) {
  const v = String(value || '').trim();
  if (!HEX_RE.test(v)) return null;
  if (v.length === 4) {
    const [, r, g, b] = v;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return v.toUpperCase();
}

/**
 * Lightweight color field: native picker + hex text + swatch.
 */
export default function ColorField({
  id: idProp,
  label,
  value,
  onChange,
  disabled = false,
}) {
  const autoId = useId();
  const id = idProp || autoId;
  const [text, setText] = useState(value || '#000000');

  useEffect(() => {
    setText(value || '#000000');
  }, [value]);

  function commit(next) {
    const normalized = normalizeHex(next);
    if (normalized) {
      onChange?.(normalized);
      setText(normalized);
    }
  }

  const display = normalizeHex(text) || value || '#000000';

  return (
    <div>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-[var(--dash-muted)]">
          {label}
        </label>
      ) : null}
      <div className="flex items-center gap-2">
        <span
          className="size-9 shrink-0 rounded-lg border border-[var(--dash-border)]"
          style={{ backgroundColor: display }}
          aria-hidden="true"
        />
        <input
          type="color"
          value={display}
          disabled={disabled}
          onChange={(e) => commit(e.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded border border-[var(--dash-border)] bg-transparent p-0.5"
          aria-label={label ? `${label} picker` : 'Color picker'}
        />
        <input
          id={id}
          type="text"
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => commit(text)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit(text);
          }}
          placeholder="#D99D26"
          className={`${DASH_INPUT_CLASS} font-mono uppercase`}
          maxLength={7}
        />
      </div>
    </div>
  );
}
