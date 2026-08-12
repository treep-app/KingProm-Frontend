'use client';

import { ANALYTICS_RANGE_OPTIONS } from '../../lib/dashboard/constants';
import { DASH_SELECT_COMPACT_CLASS } from '../../lib/dashboard/styles';

/**
 * Global analytics date-range control.
 * Emits { preset, from?, to? } — backend owns timezone normalization.
 */
export default function AnalyticsDateRangeControl({
  preset,
  from = '',
  to = '',
  onChange,
  idPrefix = 'analytics',
}) {
  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
      <label className="sr-only" htmlFor={`${idPrefix}-range`}>
        Date range
      </label>
      <select
        id={`${idPrefix}-range`}
        value={preset}
        onChange={(e) => {
          const next = e.target.value;
          onChange({
            preset: next,
            from: next === 'custom' ? from : '',
            to: next === 'custom' ? to : '',
          });
        }}
        className={`${DASH_SELECT_COMPACT_CLASS} h-11 w-full sm:h-9 sm:w-auto`}
      >
        {ANALYTICS_RANGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {preset === 'custom' ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor={`${idPrefix}-from`}>
            From date
          </label>
          <input
            id={`${idPrefix}-from`}
            type="date"
            value={from}
            onChange={(e) => onChange({ preset: 'custom', from: e.target.value, to })}
            className={`${DASH_SELECT_COMPACT_CLASS} h-11 w-full sm:h-9 sm:w-auto`}
          />
          <span className="hidden text-xs text-[var(--dash-muted)] sm:inline">to</span>
          <label className="sr-only" htmlFor={`${idPrefix}-to`}>
            To date
          </label>
          <input
            id={`${idPrefix}-to`}
            type="date"
            value={to}
            onChange={(e) => onChange({ preset: 'custom', from, to: e.target.value })}
            className={`${DASH_SELECT_COMPACT_CLASS} h-11 w-full sm:h-9 sm:w-auto`}
          />
        </div>
      ) : null}
    </div>
  );
}
