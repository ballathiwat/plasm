// frontend/src/pages/report-daily/components/MovementDivergingChart.tsx

import { useMemo } from 'react'
import type { MovementResponse, MovementBucket } from '../services/DailyReportType'
import { displayKey, keyGroup, keyRh, groupColor, sumRecord } from '../services/DailyReportType'

const HALF_H = 126
const BW_MULTI = 14
const BW_SINGLE = 28

const bucketLabel = (b: MovementBucket, g: string): string => {
  const fmt = (iso: string, o: Intl.DateTimeFormatOptions) =>
    new Date(`${iso}T00:00:00+07:00`).toLocaleDateString('th-TH', o)
  if (g === 'day') return fmt(b.start, { day: 'numeric', month: 'short' })
  if (g === 'week') {
    const s = fmt(b.start, { day: 'numeric', month: 'short' })
    const e = new Date(`${b.end}T00:00:00+07:00`).getDate()
    return `${s}–${e}`
  }
  return fmt(b.start, { month: 'short', year: '2-digit' })
}

// ── Bar style per Rh variant ──
function barBg(k: string): React.CSSProperties {
  const g = keyGroup(k)
  const c = groupColor(g)
  const rh = keyRh(k)
  if (!rh) return { background: c }
  if (rh === '+') return {
    background: `color-mix(in srgb, ${c} 50%, white)`,
    boxShadow: `inset 0 0 0 1px ${c}`,
  }
  // Rh-: hatched
  return {
    background: `repeating-linear-gradient(135deg, ${c} 0px 3px, rgba(255,255,255,.75) 3px 5px)`,
    boxShadow: `inset 0 0 0 1px ${c}`,
  }
}

interface Props { data: MovementResponse; typesLabel: string }

export default function MovementDivergingChart({ data, typesLabel }: Props) {
  const { buckets, keys, granularity } = data
  const BW = keys.length > 1 ? BW_MULTI : BW_SINGLE

  // Group keys by base group for spacing
  const keysByGroup = useMemo(() => {
    const groups: string[][] = []
    let cur: string[] = []
    let lastG = ''
    for (const k of keys) {
      const g = keyGroup(k)
      if (g !== lastG && cur.length) { groups.push(cur); cur = [] }
      cur.push(k); lastG = g
    }
    if (cur.length) groups.push(cur)
    return groups
  }, [keys])

  const numGroups = keysByGroup.length
  const bucketW = keys.length * (BW + 2) + (numGroups - 1) * 6 + 12

  // Max value across all bars
  const maxVal = useMemo(() => {
    let m = 1
    for (const b of buckets) {
      for (const k of keys) {
        m = Math.max(m, b.store[k] || 0, b.withdraw[k] || 0)
      }
    }
    return m
  }, [buckets, keys])

  const barH = (v: number) => Math.max(v ? (v / maxVal) * 110 : 0, v ? 2 : 0)

  const granL = granularity === 'day' ? 'รายวัน' : granularity === 'week' ? 'รายสัปดาห์' : 'รายเดือน'
  const ariaLabel = `กราฟ นำเข้า/นำออก ${granL} · ${typesLabel} — ดูตัวเลขในแท็บนำเข้าและนำออก`

  return (
    <div>
      {/* Legend */}
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <span>เรียงซ้าย→ขวา:</span>
        {keys.map((k) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, ...barBg(k), display: 'inline-block' }} />
            <span>{displayKey(k)}</span>
          </span>
        ))}
      </div>

      <div role="img" aria-label={ariaLabel} style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', minWidth: buckets.length * (bucketW + 8) + 60, gap: 0 }}>
          {/* Labels column */}
          <div style={{ width: 56, flexShrink: 0, display: 'flex', flexDirection: 'column', fontSize: 11, fontWeight: 600 }}>
            <div style={{ height: HALF_H, display: 'flex', alignItems: 'flex-end', color: 'var(--success-ink, #166534)' }}>นำเข้า ↑</div>
            <div style={{ height: 2 }} />
            <div style={{ height: HALF_H, display: 'flex', alignItems: 'flex-start', color: 'var(--danger-ink, #991B1B)' }}>นำออก ↓</div>
            <div style={{ height: 24, display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>วันที่</div>
            <div style={{ height: 20, display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>สุทธิ</div>
          </div>

          {/* Bucket columns */}
          {buckets.map((b, bi) => {
            const net = sumRecord(b.store) - sumRecord(b.withdraw)
            return (
              <div key={bi} style={{ width: bucketW, flexShrink: 0, borderLeft: bi > 0 ? '1px dashed var(--border, #E4E4E7)' : 'none' }}>
                {/* Store bars (bottom-aligned) */}
                <div style={{ height: HALF_H, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 6px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0 }}>
                    {keysByGroup.map((grp, gi) => (
                      <div key={gi} style={{ display: 'flex', gap: 2, marginLeft: gi > 0 ? 6 : 0, alignItems: 'flex-end' }}>
                        {grp.map((k) => {
                          const v = b.store[k] || 0
                          return (
                            <div key={k} title={`${bucketLabel(b, granularity)} นำเข้า ${displayKey(k)} ${v} ถุง`}
                              style={{ width: BW, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              {v > 0 && <span style={{ fontSize: 10, color: 'var(--success-ink)', fontWeight: 600 }}>{v}</span>}
                              <div style={{
                                width: '100%', height: barH(v), borderRadius: '3px 3px 0 0',
                                ...barBg(k),
                                transformOrigin: 'bottom',
                                animation: 'plasm-rise 0.7s cubic-bezier(.2,.8,.2,1) both',
                              }} />
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Axis line */}
                <div style={{ height: 2, background: 'var(--text-secondary)', opacity: 0.5 }} />

                {/* Withdraw bars (top-aligned, hanging down) */}
                <div style={{ height: HALF_H, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '0 6px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
                    {keysByGroup.map((grp, gi) => (
                      <div key={gi} style={{ display: 'flex', gap: 2, marginLeft: gi > 0 ? 6 : 0, alignItems: 'flex-start' }}>
                        {grp.map((k) => {
                          const v = b.withdraw[k] || 0
                          return (
                            <div key={k} title={`${bucketLabel(b, granularity)} นำออก ${displayKey(k)} ${v} ถุง`}
                              style={{ width: BW, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{
                                width: '100%', height: barH(v), borderRadius: '0 0 3px 3px',
                                ...barBg(k),
                                transformOrigin: 'top',
                                animation: 'plasm-rise 0.7s cubic-bezier(.2,.8,.2,1) both',
                              }} />
                              {v > 0 && <span style={{ fontSize: 10, color: 'var(--danger-ink)', fontWeight: 600 }}>{v}</span>}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bucket label */}
                <div style={{ height: 24, textAlign: 'center', fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {bucketLabel(b, granularity)}
                </div>

                {/* Net */}
                <div style={{
                  height: 20, textAlign: 'center', fontSize: 11, fontWeight: 600,
                  color: net > 0 ? 'var(--success-ink)' : net < 0 ? 'var(--danger-ink)' : 'var(--text-disabled)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {net > 0 ? `+${net}` : net < 0 ? `\u2212${Math.abs(net)}` : '0'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
