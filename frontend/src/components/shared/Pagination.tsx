// ============================================================
//  src/components/shared/Pagination.tsx
//  Shared pagination — ใช้ได้กับทุก table/list
// ============================================================

import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface Props {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}

export default function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [20, 50, 100],
}: Props) {
  const { page, pageSize, total, totalPages } = pagination
  if (total === 0) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  // สร้าง page numbers: first ... prev curr next ... last
  const pages = buildPageNumbers(page, totalPages)

  const btn = (style?: React.CSSProperties): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    height: 32,
    borderRadius: 'var(--radius-sm, 6px)',
    border: '1px solid var(--border, #E4E4E7)',
    background: 'transparent',
    fontSize: 13,
    cursor: 'pointer',
    color: 'var(--text-secondary, #71717A)',
    transition: 'all 0.15s',
    ...style,
  })

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
      padding: '12px 0',
    }}>
      {/* Left: info + page size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
        <span>{from}–{to} จาก {total} รายการ</span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              padding: '4px 8px',
              border: '1px solid var(--border, #E4E4E7)',
              borderRadius: 'var(--radius-sm, 6px)',
              fontSize: 13,
              background: 'var(--surface, #fff)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {pageSizeOptions.map((s) => (
              <option key={s} value={s}>{s} / หน้า</option>
            ))}
          </select>
        )}
      </div>

      {/* Right: page buttons */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Prev */}
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            style={btn({ opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'default' : 'pointer' })}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          {pages.map((p, i) =>
            p === '...' ? (
              <span key={`dot-${i}`} style={{ padding: '0 4px', fontSize: 13, color: 'var(--text-secondary)' }}>…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                style={btn(
                  p === page
                    ? { background: 'var(--primary, #2563EB)', color: '#fff', borderColor: 'var(--primary, #2563EB)', fontWeight: 600 }
                    : {}
                )}
              >
                {p}
              </button>
            ),
          )}

          {/* Next */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            style={btn({ opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? 'default' : 'pointer' })}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

/** สร้าง page numbers แบบ: 1 ... 4 [5] 6 ... 10 */
function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = []

  // always show first
  pages.push(1)

  if (current > 3) pages.push('...')

  // range around current
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')

  // always show last
  pages.push(total)

  return pages
}
