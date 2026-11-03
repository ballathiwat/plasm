// frontend/src/pages/report-daily/components/TypeBloodMatrix.tsx

import type { MovementResponse } from '../services/DailyReportType'
import { displayKey, keyRh, keyGroup, plasmaChartColor, groupColor } from '../services/DailyReportType'

const formatRange = (from: string, to: string, days: number): string => {
  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00+07:00`).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
  if (from === to) return `${fmt(from)} · 1 วัน`
  return `${fmt(from)} – ${fmt(to)} · ${days} วัน`
}

interface Props { data: MovementResponse }

export default function TypeBloodMatrix({ data }: Props) {
  const { keys, matrix, types, totals } = data

  // Group matrix by type
  const byType = new Map<string, Map<string, { in: number; out: number }>>()
  for (const m of matrix) {
    if (!byType.has(m.type)) byType.set(m.type, new Map())
    byType.get(m.type)!.set(m.key, { in: m.in, out: m.out })
  }

  // Types that have data (in order)
  const activeTypes = types.filter((t) => byType.has(t))

  // Row totals per type
  const typeTotal = (t: string) => {
    const m = byType.get(t)
    if (!m) return { in: 0, out: 0 }
    let i = 0, o = 0
    for (const v of m.values()) { i += v.in; o += v.out }
    return { in: i, out: o }
  }

  // Column totals per key
  const colTotal = (k: string) => {
    let i = 0, o = 0
    for (const m of byType.values()) {
      const v = m.get(k)
      if (v) { i += v.in; o += v.out }
    }
    return { in: i, out: o }
  }

  const span = keys.length
  const cols = `72px repeat(${span}, minmax(40px, 1fr)) 64px`

  const CellVal = ({ v, color }: { v: number; color: string }) => (
    <span style={{ fontSize: 13, color: v ? color : 'var(--text-disabled)', fontVariantNumeric: 'tabular-nums' }}>
      {v || '·'}
    </span>
  )

  const KeyBadge = ({ k }: { k: string }) => {
    const rh = keyRh(k)
    const g = keyGroup(k)
    const gc = groupColor(g)
    if (!rh) {
      // No Rh: solid pill
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '1px 6px', borderRadius: 'var(--radius-full, 99px)',
          background: gc, color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1.4,
        }}>{displayKey(k)}</span>
      )
    }
    // With Rh: outlined pill
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '1px 6px', borderRadius: 'var(--radius-full, 99px)',
        background: 'var(--surface, #fff)', boxShadow: `inset 0 0 0 1.5px ${gc}`,
        color: gc, fontSize: 11, fontWeight: 700, lineHeight: 1.4,
      }}>{displayKey(k)}</span>
    )
  }

  return (
    <div style={{
      background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)',
      padding: 20, marginBottom: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>สรุปตามชนิด · หมู่เลือด</h3>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatRange(data.from, data.to, data.days)}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
        <span style={{ color: 'var(--success-ink, #166534)' }}>↑ นำเข้า</span>
        {' \u00A0 '}
        <span style={{ color: 'var(--danger-ink, #991B1B)' }}>↓ นำออก</span>
        {' \u00A0 (ถุง)'}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div role="table" style={{ display: 'grid', gridTemplateColumns: cols, gap: '4px 2px', minWidth: 72 + span * 48 + 64, fontSize: 13 }}>
          {/* Header */}
          <div role="columnheader" style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', padding: '6px 4px' }}>ชนิด</div>
          {keys.map((k) => (
            <div key={`h-${k}`} role="columnheader" style={{ textAlign: 'center', padding: '4px 0' }}>
              <KeyBadge k={k} />
            </div>
          ))}
          <div role="columnheader" style={{ textAlign: 'center', fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', padding: '6px 0' }}>รวม</div>

          {/* Data rows */}
          {activeTypes.map((t) => {
            const tt = typeTotal(t)
            return [
              <div key={`r-${t}`} role="rowheader" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 4px' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: plasmaChartColor(t), flexShrink: 0 }} />
                <span style={{ fontWeight: 600, fontSize: 13 }}>{t}</span>
              </div>,
              ...keys.map((k) => {
                const v = byType.get(t)?.get(k)
                return (
                  <div key={`c-${t}-${k}`} role="cell" style={{ textAlign: 'center', padding: '4px 0', lineHeight: 1.5 }}>
                    <div><CellVal v={v?.in || 0} color="var(--success-ink, #166534)" /></div>
                    <div><CellVal v={v?.out || 0} color="var(--danger-ink, #991B1B)" /></div>
                  </div>
                )
              }),
              <div key={`t-${t}`} role="cell" style={{
                textAlign: 'center', padding: '4px 0', lineHeight: 1.5,
                background: 'var(--surface-raised, #F4F4F5)', borderRadius: 4,
              }}>
                <div><CellVal v={tt.in} color="var(--success-ink, #166534)" /></div>
                <div><CellVal v={tt.out} color="var(--danger-ink, #991B1B)" /></div>
              </div>,
            ]
          }).flat()}

          {/* Totals row */}
          <div role="rowheader" style={{
            fontWeight: 700, fontSize: 12, padding: '8px 4px',
            background: 'var(--surface-raised, #F4F4F5)', borderRadius: '6px 0 0 6px',
          }}>รวม</div>
          {keys.map((k) => {
            const ct = colTotal(k)
            return (
              <div key={`ft-${k}`} role="cell" style={{
                textAlign: 'center', padding: '6px 0', lineHeight: 1.5,
                background: 'var(--surface-raised, #F4F4F5)',
              }}>
                <div><CellVal v={ct.in} color="var(--success-ink, #166534)" /></div>
                <div><CellVal v={ct.out} color="var(--danger-ink, #991B1B)" /></div>
              </div>
            )
          })}
          <div role="cell" style={{
            textAlign: 'center', padding: '6px 0', lineHeight: 1.5, fontWeight: 700,
            background: 'var(--surface-raised, #F4F4F5)', borderRadius: '0 0 6px 0',
          }}>
            <div style={{ color: 'var(--success-ink, #166534)' }}>↑{totals.in.toLocaleString('th-TH')}</div>
            <div style={{ color: 'var(--danger-ink, #991B1B)' }}>↓{totals.out.toLocaleString('th-TH')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
