// frontend/src/pages/report-daily/components/DailyChart.tsx

import { useMemo } from 'react'
import type { MovementResponse, MovementBucket } from '../services/DailyReportType'
import { sumRecord, bloodChartColor, plasmaChartColor } from '../services/DailyReportType'

const CHART_H = 140
const BAR_W = 14

const bucketLabel = (b: MovementBucket, granularity: string): string => {
  const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(`${iso}T00:00:00+07:00`).toLocaleDateString('th-TH', opts)
  if (granularity === 'day') return fmt(b.start, { day: 'numeric', month: 'short' })
  if (granularity === 'week') {
    const s = fmt(b.start, { day: 'numeric', month: 'short' })
    const e = new Date(`${b.end}T00:00:00+07:00`).getDate()
    return `${s}–${e}`
  }
  return fmt(b.start, { month: 'short', year: '2-digit' })
}

const barTooltip = (action: string, type: string, groups: string[], data: Record<string, number>): string => {
  const total = sumRecord(data)
  const parts = groups.map((g) => `${g} ${data[g] || 0}`).join(', ')
  return `${action} ${type} ${total} ถุง (${parts})`
}

function TypeBar({ values, groups, max, type, tooltip }: {
  values: Record<string, number>; groups: string[]; max: number; type: string; tooltip: string
}) {
  const total = sumRecord(values)
  return (
    <div title={tooltip} style={{ width: BAR_W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        {total || ''}
      </span>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column-reverse', borderRadius: '6px 6px 0 0', overflow: 'hidden' }}>
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
      <div style={{ width: '100%', height: 4, borderRadius: 2, background: plasmaChartColor(type) }} />
    </div>
  )
}

function ActionGroup({ actionData, types, groups, max, actionLabel }: {
  actionData: Record<string, Record<string, number>>; types: string[]; groups: string[]; max: number; actionLabel: string
}) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
      {types.map((t) => (
        <TypeBar key={t} values={actionData[t] || {}} groups={groups} max={max} type={t}
          tooltip={barTooltip(actionLabel, t, groups, actionData[t] || {})} />
      ))}
    </div>
  )
}

interface Props { data: MovementResponse }

export default function DailyChart({ data }: Props) {
  const { buckets, types, groups, granularity, totals } = data

  const maxValue = useMemo(() => {
    let m = 1
    for (const b of buckets) {
      for (const t of types) {
        const sv = sumRecord(b.store[t] || {})
        const wv = sumRecord(b.withdraw[t] || {})
        if (sv > m) m = sv
        if (wv > m) m = wv
      }
    }
    return m
  }, [buckets, types])

  const totalMax = useMemo(() => {
    let m = 1
    for (const t of types) {
      let ss = 0, ws = 0
      for (const b of buckets) { ss += sumRecord(b.store[t] || {}); ws += sumRecord(b.withdraw[t] || {}) }
      if (ss > m) m = ss
      if (ws > m) m = ws
    }
    return m
  }, [buckets, types])

  const totalStoreData = useMemo(() => {
    const r: Record<string, Record<string, number>> = {}
    for (const t of types) { r[t] = {}; for (const g of groups) r[t][g] = buckets.reduce((s, b) => s + (b.store[t]?.[g] || 0), 0) }
    return r
  }, [buckets, types, groups])

  const totalWithdrawData = useMemo(() => {
    const r: Record<string, Record<string, number>> = {}
    for (const t of types) { r[t] = {}; for (const g of groups) r[t][g] = buckets.reduce((s, b) => s + (b.withdraw[t]?.[g] || 0), 0) }
    return r
  }, [buckets, types, groups])

  const granLabel = granularity === 'day' ? 'รายวัน' : granularity === 'week' ? 'รายสัปดาห์' : 'รายเดือน'
  const formatRange = () => {
    const fmt = (iso: string) =>
      new Date(`${iso}T00:00:00+07:00`).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
    return data.from === data.to ? fmt(data.from) : `${fmt(data.from)} – ${fmt(data.to)}`
  }

  const bucketMinW = types.length * 32 + 14
  const hasTotalCol = buckets.length > 1
  const chartMinW = (buckets.length + (hasTotalCol ? 1 : 0)) * (types.length * 32 + 24) + 10
  const ariaLabel = `กราฟ นำเข้า / นำออก ${granLabel} (${formatRange()}) — ดูตัวเลขในตารางด้านล่าง`

  return (
    <div style={{
      background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)',
      padding: 20, marginBottom: 16,
    }}>
      {/* Title + Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
          นำเข้า / นำออก {granLabel} ({formatRange()})
        </h3>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'right' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end', marginBottom: 2 }}>
            <span>สีแท่ง = หมู่เลือด</span>
            {groups.map((g) => (
              <span key={g} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: bloodChartColor(g) }} /> {g}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span>เส้นใต้แท่ง = ชนิด</span>
            {types.map((t) => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <span style={{ width: 10, height: 4, borderRadius: 2, background: plasmaChartColor(t) }} /> {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div role="img" aria-label={ariaLabel} style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, minWidth: chartMinW }}>
          {buckets.map((b, i) => (
            <div key={i} style={{ flex: '1 0 auto', minWidth: bucketMinW, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                <ActionGroup actionData={b.store} types={types} groups={groups} max={maxValue} actionLabel="นำเข้า" />
                <ActionGroup actionData={b.withdraw} types={types} groups={groups} max={maxValue} actionLabel="นำออก" />
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                {bucketLabel(b, granularity)}
              </span>
            </div>
          ))}
          {hasTotalCol && (
            <>
              <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border, #E4E4E7)', margin: '0 8px', flexShrink: 0 }} />
              <div style={{ flex: '1 0 auto', minWidth: bucketMinW, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                  <ActionGroup actionData={totalStoreData} types={types} groups={groups} max={totalMax} actionLabel="นำเข้า รวม" />
                  <ActionGroup actionData={totalWithdrawData} types={types} groups={groups} max={totalMax} actionLabel="นำออก รวม" />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>รวม</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12, fontSize: 11, color: 'var(--text-secondary)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--success-surface, #F0FDF4)', border: '1px solid var(--success-ink, #166534)' }} />
          กลุ่มซ้าย = นำเข้า
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--danger-surface, #FEF2F2)', border: '1px solid var(--danger-ink, #991B1B)' }} />
          กลุ่มขวา = นำออก
        </span>
      </div>
    </div>
  )
}
