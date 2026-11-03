// frontend/src/pages/report-daily/components/MovementHeatmap.tsx

import { useState, useMemo, useRef, type KeyboardEvent } from 'react'
import { BarChart3 } from 'lucide-react'
import type { MovementResponse, MovementBucket } from '../services/DailyReportType'
import { displayKey, keyGroup, sumRecord, groupColor } from '../services/DailyReportType'
import MovementDivergingChart from './MovementDivergingChart'

type Tab = 'in' | 'out' | 'net' | 'chart'

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

const granLabel = (g: string) => g === 'day' ? 'รายวัน' : g === 'week' ? 'รายสัปดาห์' : 'รายเดือน'

// ── Heatmap cell color ──
function cellStyle(v: number, maxAbs: number, ink: string): React.CSSProperties {
  if (v === 0) return { background: 'var(--surface-raised, #F4F4F5)', color: 'var(--text-disabled)' }
  const p = 12 + (Math.abs(v) / (maxAbs || 1)) * 58
  return {
    background: `color-mix(in srgb, ${ink} ${Math.round(p)}%, var(--surface, #fff))`,
    color: p > 48 ? '#fff' : 'var(--text-primary)',
    fontWeight: 600,
  }
}

// ── Key badge (same as TypeBloodMatrix) ──
function KeyBadge({ k }: { k: string }) {
  const rh = k.endsWith('+') || k.endsWith('-')
  const g = keyGroup(k)
  const gc = groupColor(g)
  if (!rh) return (
    <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 99, background: gc, color: '#fff', fontSize: 11, fontWeight: 700 }}>{displayKey(k)}</span>
  )
  return (
    <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 99, background: 'var(--surface, #fff)', boxShadow: `inset 0 0 0 1.5px ${gc}`, color: gc, fontSize: 11, fontWeight: 700 }}>{displayKey(k)}</span>
  )
}

interface Props { data: MovementResponse; typesLabel: string }

export default function MovementHeatmap({ data, typesLabel }: Props) {
  const { buckets, keys, granularity, totals } = data
  const [tab, setTab] = useState<Tab>('in')
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])

  const TABS: { id: Tab; label: string; badge?: string; icon?: React.ReactNode }[] = [
    { id: 'in', label: 'นำเข้า', badge: totals.in.toLocaleString('th-TH') },
    { id: 'out', label: 'นำออก', badge: totals.out.toLocaleString('th-TH') },
    { id: 'net', label: 'สุทธิ', badge: `${totals.in - totals.out >= 0 ? '+' : ''}${(totals.in - totals.out).toLocaleString('th-TH')}` },
    { id: 'chart', label: '', icon: <BarChart3 size={16} /> },
  ]

  const tabUnderColor = (t: Tab) =>
    t === 'in' ? 'var(--success-ink, #166534)' : t === 'out' ? 'var(--danger-ink, #991B1B)' : 'var(--primary, #2563EB)'

  // Roving tabindex
  const onKeyDown = (e: KeyboardEvent, idx: number) => {
    const len = TABS.length
    let next = -1
    if (e.key === 'ArrowRight') next = (idx + 1) % len
    if (e.key === 'ArrowLeft') next = (idx - 1 + len) % len
    if (next >= 0) {
      e.preventDefault()
      setTab(TABS[next].id)
      tabsRef.current[next]?.focus()
    }
  }

  // ── Compute VBL keys per tab ──
  const vblKeys = useMemo(() => {
    const hasIn = new Set<string>(), hasOut = new Set<string>()
    for (const b of buckets) {
      for (const k of keys) {
        if (b.store[k]) hasIn.add(k)
        if (b.withdraw[k]) hasOut.add(k)
      }
    }
    return {
      in: keys.filter((k) => hasIn.has(k)),
      out: keys.filter((k) => hasOut.has(k)),
      net: keys.filter((k) => {
        let s = 0
        for (const b of buckets) s += (b.store[k] || 0) - (b.withdraw[k] || 0)
        return s !== 0
      }),
    }
  }, [buckets, keys])

  const activeKeys = tab === 'chart' ? keys : vblKeys[tab]

  // ── Row max for heatmap ──
  const getValue = (b: MovementBucket, k: string): number => {
    if (tab === 'in') return b.store[k] || 0
    if (tab === 'out') return b.withdraw[k] || 0
    return (b.store[k] || 0) - (b.withdraw[k] || 0)
  }

  const rowMax = useMemo(() => {
    const m: Record<string, number> = {}
    for (const k of activeKeys) {
      let mx = 0
      for (const b of buckets) mx = Math.max(mx, Math.abs(getValue(b, k)))
      m[k] = mx
    }
    return m
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buckets, activeKeys, tab])

  // Row total
  const rowTotal = (k: string): number => {
    let s = 0
    for (const b of buckets) s += getValue(b, k)
    return s
  }

  // Grand total per bucket
  const bucketTotal = (b: MovementBucket): number => {
    if (tab === 'in') return sumRecord(b.store)
    if (tab === 'out') return sumRecord(b.withdraw)
    return sumRecord(b.store) - sumRecord(b.withdraw)
  }

  const inkColor = (v?: number) => {
    if (tab === 'in') return 'var(--success-ink, #166534)'
    if (tab === 'out') return 'var(--danger-ink, #991B1B)'
    return (v ?? 0) >= 0 ? 'var(--success-ink, #166534)' : 'var(--danger-ink, #991B1B)'
  }

  const fmtNet = (v: number) => v > 0 ? `+${v}` : v < 0 ? `\u2212${Math.abs(v)}` : '0'

  // ── Check if previous key is different group → add gap ──
  const needsGap = (i: number) => i > 0 && keyGroup(activeKeys[i]) !== keyGroup(activeKeys[i - 1])

  const bLen = buckets.length
  const cols = `76px repeat(${bLen}, minmax(44px, 1fr)) 64px`

  // Empty text
  const emptyText = tab === 'in' ? 'ไม่มีรายการนำเข้าในช่วงนี้'
    : tab === 'out' ? 'ไม่มีรายการนำออกในช่วงนี้'
    : 'นำเข้าและนำออกเท่ากันทุกหมู่ในช่วงนี้'

  return (
    <div style={{
      background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)', padding: 20,
    }}>
      {/* Header */}
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>
        แยกตามหมู่เลือด × Rh · {granLabel(granularity)} · {typesLabel}
      </h3>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
        A / A+ / A{'\u2212'} นับแยกกัน (A = ไม่ระบุ Rh) · ตัวเลข = จำนวนถุง · สีเข้ม = มากที่สุดในแถวนั้น
      </div>

      {/* Tabs */}
      <div role="tablist" style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border, #E4E4E7)', marginBottom: 16 }}>
        {TABS.map((t, i) => {
          const sel = tab === t.id
          return (
            <button key={t.id} role="tab" ref={(el) => { tabsRef.current[i] = el }}
              aria-selected={sel} aria-controls={`panel-${t.id}`}
              tabIndex={sel ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              style={{
                minHeight: 44, padding: '8px 16px', border: 'none', background: 'none',
                borderBottom: sel ? `2px solid ${tabUnderColor(t.id)}` : '2px solid transparent',
                marginBottom: -1, fontSize: 13, fontWeight: sel ? 700 : 500,
                color: sel ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
              }}>
              {t.icon || t.label}
              {t.badge && (
                <span style={{
                  fontSize: 11, padding: '1px 7px', borderRadius: 99, fontWeight: 600,
                  background: sel ? tabUnderColor(t.id) : 'var(--surface-raised, #F4F4F5)',
                  color: sel ? '#fff' : 'var(--text-secondary)',
                }}>{t.badge}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Panel */}
      <div id={`panel-${tab}`} role="tabpanel">
        {tab === 'chart' ? (
          <MovementDivergingChart data={data} typesLabel={typesLabel} />
        ) : activeKeys.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-disabled)', fontSize: 14 }}>
            {emptyText}
          </div>
        ) : (
          <>
            {tab === 'net' && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                สุทธิ = นำเข้า − นำออก ·{' '}
                <span style={{ color: 'var(--success-ink)' }}>เขียว = เพิ่มขึ้น</span> ·{' '}
                <span style={{ color: 'var(--danger-ink)' }}>แดง = ลดลง</span>
              </div>
            )}
            <div style={{ overflowX: 'auto' }}>
              <div role="table" style={{ display: 'grid', gridTemplateColumns: cols, gap: '2px', minWidth: 76 + bLen * 52 + 64, fontSize: 13 }}>
                {/* Column headers */}
                <div role="columnheader" style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', padding: '6px 4px' }}>หมู่</div>
                {buckets.map((b, i) => (
                  <div key={i} role="columnheader" style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-secondary)', padding: '6px 0', whiteSpace: 'nowrap' }}>
                    {bucketLabel(b, granularity)}
                  </div>
                ))}
                <div role="columnheader" style={{ textAlign: 'center', fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', padding: '6px 0' }}>รวม</div>

                {/* Data rows */}
                {activeKeys.map((k, ki) => {
                  const gap = needsGap(ki)
                  const rt = rowTotal(k)
                  const mx = rowMax[k] || 1
                  return [
                    gap && <div key={`gap-${k}`} style={{ gridColumn: '1 / -1', height: 10 }} />,
                    <div key={`rh-${k}`} role="rowheader" style={{ padding: '4px', display: 'flex', alignItems: 'center' }}>
                      <KeyBadge k={k} />
                    </div>,
                    ...buckets.map((b, bi) => {
                      const v = getValue(b, k)
                      const ink = inkColor(v)
                      return (
                        <div key={`${k}-${bi}`} role="cell" style={{
                          textAlign: 'center', height: 30, borderRadius: 4,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontVariantNumeric: 'tabular-nums', fontSize: 12,
                          ...cellStyle(v, mx, ink),
                        }}>
                          {v === 0 ? '·' : tab === 'net' ? fmtNet(v) : v}
                        </div>
                      )
                    }),
                    <div key={`rt-${k}`} role="cell" style={{
                      textAlign: 'center', height: 30, borderRadius: 4,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontVariantNumeric: 'tabular-nums', fontSize: 12, fontWeight: 700,
                      background: 'var(--surface-raised, #F4F4F5)',
                      color: rt === 0 ? 'var(--text-disabled)' : inkColor(rt),
                    }}>
                      {rt === 0 ? '·' : tab === 'net' ? fmtNet(rt) : rt}
                    </div>,
                  ]
                }).flat()}

                {/* Footer totals row */}
                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border, #E4E4E7)', marginTop: 4 }} />
                <div role="rowheader" style={{ fontWeight: 700, fontSize: 12, padding: '6px 4px' }}>รวม</div>
                {buckets.map((b, bi) => {
                  const v = bucketTotal(b)
                  return (
                    <div key={`ft-${bi}`} role="cell" style={{
                      textAlign: 'center', fontWeight: 700, fontSize: 12, padding: '6px 0',
                      color: v === 0 ? 'var(--text-disabled)' : inkColor(v),
                    }}>
                      {v === 0 ? '·' : tab === 'net' ? fmtNet(v) : v}
                    </div>
                  )
                })}
                <div role="cell" style={{
                  textAlign: 'center', fontWeight: 700, fontSize: 12, padding: '6px 0',
                  background: 'var(--surface-raised, #F4F4F5)', borderRadius: '0 0 6px 0',
                  color: inkColor(tab === 'in' ? totals.in : tab === 'out' ? totals.out : totals.in - totals.out),
                }}>
                  {tab === 'in' ? totals.in : tab === 'out' ? totals.out : fmtNet(totals.in - totals.out)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
