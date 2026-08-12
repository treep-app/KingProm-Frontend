/**
 * Lightweight table foundation for dashboard list views.
 *
 * Pass `mobileCard` to render an intentional stacked list below `md`
 * instead of forcing horizontal table scroll on phones.
 *
 * columns: [{
 *   key: string,
 *   header: ReactNode,
 *   cell: (row) => ReactNode,
 *   className?: string,
 *   headerClassName?: string,
 * }]
 */
export default function DataTable({
  columns = [],
  rows = [],
  getRowKey = (row, index) => row.id ?? index,
  onRowClick = null,
  minWidth = '720px',
  footer = null,
  className = '',
  mobileCard = null,
}) {
  const hasMobileCards = typeof mobileCard === 'function';

  return (
    <div className={['dash-panel overflow-hidden', className].filter(Boolean).join(' ')}>
      {hasMobileCards ? (
        <ul className="divide-y divide-[var(--dash-border)] md:hidden" role="list">
          {rows.map((row, index) => (
            <li key={getRowKey(row, index)}>
              <div
                className={
                  onRowClick
                    ? 'cursor-pointer px-4 py-3.5 transition hover:bg-[var(--dash-surface-2)]/50'
                    : 'px-4 py-3.5'
                }
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {mobileCard(row, index)}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div className={hasMobileCards ? 'hidden md:block' : undefined}>
        <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-left text-sm" style={{ minWidth }}>
            <thead className="border-b border-[var(--dash-border)] bg-[var(--dash-surface-2)]/70 text-xs font-semibold uppercase tracking-wide text-[var(--dash-muted)]">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={['px-4 py-3 font-semibold', col.headerClassName]
                      .filter(Boolean)
                      .join(' ')}
                    scope="col"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dash-border)]">
              {rows.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  className={
                    onRowClick
                      ? 'cursor-pointer transition hover:bg-[var(--dash-surface-2)]/50'
                      : undefined
                  }
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={['px-4 py-3', col.className].filter(Boolean).join(' ')}
                    >
                      {col.cell(row, index)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {footer ? (
        <div className="border-t border-[var(--dash-border)] px-4 py-3 text-xs text-[var(--dash-muted)]">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
