// frontend/src/pages/report-daily/components/DailyChart.tsx

import { useMemo } from 'react'
import type { MovementResponse, MovementBucket } from '../services/DailyReportType'
import { sumRecord, bloodChartColor } from '../services/DailyReportType'

const CHART_H = 140
const BAR_W = 22

const STORE_INK = 'var(--success-ink, #166534)'
const WITHDRAW_INK = 'var(--danger-ink, #991B1B)'

const bucketLabel = (b: MovementBucket, gran: string): string => {
  const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(`${iso}T00:00:00+07:00`).toLocaleDateString('th-TH', opts)
  if (gran === 'day') return fmt(b.start, { day: 'numeric', month: 'short' })
  if (gran === 'week') {
    const s = fmt(b.start, { day: 'numeric', month: 'short' })
    const e = new Date(`${b.end}T00:00:00+07:00`).getDate()
    return `${s}–${e}`
  }
  return fmt(b.start, { month: 'short', year: '2-digit' })
}

function StackedBar({ values, groups, max, actionLabel, inkColor }: {
  values: Record<string, number>; groups: string[]; max: number
  actionLabel: string; inkColor: string
}) {
  const total = sumRecord(values)
  const parts = groups.filter((g) => values[g]).map((g) => `${g} ${values[g]}`).join(', ')
  const title = `${actionLabel} ${total} ถุง${parts ? ` (${parts})` : ''}`

  return (
    <div title={title} style={{ width: BAR_W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {/* Value on top */}
      <span style={{ fontSize: 12, fontWeight: 600, color: inkColor, whiteSpace: 'nowrap', minHeight: 16 }}>
        {total > 0 ? total : ''}
      </span>
      {/* Stacked segments */}
      <div style={{
        width: '100%', display: 'flex', flexDirection: 'column-reverse',
        borderRadius: '4px 4px 0 0', overflow: 'hidden',
      }}>
        {groups.map((g) => {
          const v = values[g] || 0
          if (!v || !max) return null
          return (
            <div key={g} style={{
              height: (v / max) * CHART_H, minHeight: 2,
              background: bloodChartColor(g),
              transformOrigin: 'bottom',
              animation: 'plasm-rise 0.7s cubic-bezier(.2,.8,.2,1) both',
            }} />
          )
        })}
      </div>
      {/* Action indicator line */}
      <div style={{
        width: '100%', height: 3, borderRadius: 1,
        background: inkColor, opacity: total > 0 ? 1 : 0.25,
      }} />
    </div>
  )
}

interface Props {
  data: MovementResponse
  typesLabel: string
}

export default function DailyChart({ data, typesLabel }: Props) {
  const { buckets, groups, granularity } = data

  const maxValue = useMemo(() => {
    let m = 1
    for (const b of buckets) {
      const sv = sumRecord(b.store)
      const wv = sumRecord(b.withdraw)
      if (sv > m) m = sv
      if (wv > m) m = wv
    }
    return m
  }, [buckets])

  const granLabel = granularity === 'day' ? 'รายวัน' : granularity === 'week' ? 'รายสัปดาห์' : 'รายเดือน'
  const formatRange = () => {
    const fmt = (iso: string) =>
      new Date(`${iso}T00:00:00+07:00`).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
    return data.from === data.to ? fmt(data.from) : `${fmt(data.from)} – ${fmt(data.to)}`
  }

  const chartMinW = buckets.length * 64
  const ariaLabel = `กราฟ นำเข้า / นำออก ${granLabel} · ${typesLabel} (${formatRange()}) — ดูตัวเลขในตารางด้านล่าง`

  return (
    <div style={{
      background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)',
      padding: 20, marginBottom: 16,
    }}>
      {/* Title + Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
          นำเข้า / นำออก {granLabel} · {typesLabel} ({formatRange()})
        </h3>
        <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
          {groups.map((g) => (
            <span key={g} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: bloodChartColor(g) }} /> {g}
            </span>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div role="img" aria-label={ariaLabel} style={{ overflowX: 'auto' }}>
        {/* Bars row */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 8, minWidth: chartMinW,
          borderBottom: '1px solid var(--border, #E4E4E7)', paddingBottom: 0,
        }}>
          {buckets.map((b, i) => (
            <div key={i} style={{
              flex: '1 0 56px', display: 'flex', justifyContent: 'center',
              alignItems: 'flex-end', gap: 4,
            }}>
              <StackedBar values={b.store} groups={groups} max={maxValue}
                actionLabel="นำเข้า" inkColor={STORE_INK} />
              <StackedBar values={b.withdraw} groups={groups} max={maxValue}
                actionLabel="นำออก" inkColor={WITHDRAW_INK} />
            </div>
          ))}
        </div>
        {/* Labels row */}
        <div style={{ display: 'flex', gap: 8, minWidth: chartMinW, marginTop: 4 }}>
          {buckets.map((b, i) => (
            <div key={i} style={{
              flex: '1 0 56px', textAlign: 'center',
              fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap',
            }}>
              {bucketLabel(b, granularity)}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12, fontSize: 11, color: 'var(--text-secondary)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 16, height: 3, borderRadius: 1, background: STORE_INK }} />
          แท่งซ้าย = นำเข้า
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 16, height: 3, borderRadius: 1, background: WITHDRAW_INK }} />
          แท่งขวา = นำออก
        </span>
      </div>
    </div>
  )
}
