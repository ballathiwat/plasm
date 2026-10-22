// ============================================================
//  src/pages/dashboard/components/DashboardDaily.tsx
// ============================================================

import type { BloodGroup } from '../../../types/models'
import type { DailyData } from '../services/DashboardType'
import { BLOOD_GROUPS, sumBlood } from '../services/DashboardType'
import { groupSurface, groupInk ,groupColor} from '../../../helpers/blood'


const CHART_H = 140
const STORE_COLOR = '#16A34A'
const WITHDRAW_COLOR = '#DC2626'

interface Props {
  dailyData: DailyData[]
  maxDailyValue: number
}

function StackedBar({ values, max }: { values: Record<BloodGroup, number>; max: number }) {
  const total = sumBlood(values)
  return (
    <div style={{ flex: 1, maxWidth: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{total || ''}</span>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column-reverse', borderRadius: '4px 4px 2px 2px', overflow: 'hidden' }}>
        {BLOOD_GROUPS.map((g) => {
          const v = values[g] || 0
          if (!v) return null
          return (
            <div
              key={g}
              title={`${g}: ${v}`}
              style={{
                height: (v / max) * CHART_H,
                minHeight: 3,
                background: groupColor(g),
                transformOrigin: 'bottom',
                animation: 'plasm-rise 0.7s cubic-bezier(.2,.8,.2,1) both',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

const cell = (key: string, v: number) => (
  <span
    key={key}
    style={{
      textAlign: 'center',
      fontVariantNumeric: 'tabular-nums',
      color: v ? 'var(--text-primary)' : 'var(--text-disabled)',
    }}
  >
    {v || '-'}
  </span>
)

export default function DashboardDaily({ dailyData, maxDailyValue }: Props) {
  const cols = '70px repeat(5, 1fr) repeat(5, 1fr)'

  const totals = dailyData.reduce(
    (acc, d) => {
      for (const g of BLOOD_GROUPS) {
        acc.store[g] += d.store[g] || 0
        acc.withdraw[g] += d.withdraw[g] || 0
      }
      return acc
    },
    {
      store: { A: 0, B: 0, O: 0, AB: 0 } as Record<BloodGroup, number>,
      withdraw: { A: 0, B: 0, O: 0, AB: 0 } as Record<BloodGroup, number>,
    },
  )

  return (
    <div style={{
      background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)', padding: 20,
      marginBottom: 16,
    }}>
      {/* Title + legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>นำเข้า / นำออก รายวัน (7 วันล่าสุด)</h3>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
          {BLOOD_GROUPS.map((g) => (
            <span key={g} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: groupColor(g) }} /> {g}
            </span>
          ))}
        </div>
      </div>

      {/* Chart: แต่ละวันมี 2 แท่ง (ซ้าย = นำเข้า, ขวา = นำออก) */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: CHART_H + 40 }}>
        {dailyData.map((d) => (
          <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, justifyContent: 'flex-end', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, width: '100%', justifyContent: 'center' }}>
              <StackedBar values={d.store} max={maxDailyValue} />
              <StackedBar values={d.withdraw} max={maxDailyValue} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8, fontSize: 11, color: 'var(--text-secondary)' }}>
        <span>แท่งซ้าย = นำเข้า</span>
        <span>แท่งขวา = นำออก</span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', marginTop: 20 }}>
        <div style={{ minWidth: 760, fontSize: 13 }}>
          {/* group header */}
          <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 4, padding: '6px 0', fontSize: 12, fontWeight: 700 }}>
            <span />
            <span style={{ gridColumn: 'span 5', textAlign: 'center', color: STORE_COLOR, background: '#F0FDF4', borderRadius: 6, padding: '4px 0' }}>
              นำเข้า (units)
            </span>
            <span style={{ gridColumn: 'span 5', textAlign: 'center', color: WITHDRAW_COLOR, background: '#FEF2F2', borderRadius: 6, padding: '4px 0' }}>
              นำออก (units)
            </span>
          </div>

          {/* column header */}
          <div style={{
            display: 'grid', gridTemplateColumns: cols, gap: 4, padding: '8px 0',
            borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
          }}>
            <span>วันที่</span>
            {BLOOD_GROUPS.map((g) => (
              <span key={`hs-${g}`} style={{ textAlign: 'center', color: groupColor(g) }}>{g}</span>
            ))}
            <span style={{ textAlign: 'center' }}>รวม</span>
            {BLOOD_GROUPS.map((g) => (
              <span key={`hw-${g}`} style={{ textAlign: 'center', color: groupColor(g) }}>{g}</span>
            ))}
            <span style={{ textAlign: 'center' }}>รวม</span>
          </div>

          {/* rows */}
          {dailyData.map((d) => {
            const st = sumBlood(d.store)
            const wd = sumBlood(d.withdraw)
            return (
              <div key={d.date} style={{
                display: 'grid', gridTemplateColumns: cols, gap: 4, padding: '9px 0',
                borderBottom: '1px solid var(--border)', alignItems: 'center',
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>{d.label}</span>
                {BLOOD_GROUPS.map((g) => cell(`s-${g}`, d.store[g]))}
                <span style={{ textAlign: 'center', fontWeight: 700, color: st ? STORE_COLOR : 'var(--text-disabled)' }}>
                  {st || '-'}
                </span>
                {BLOOD_GROUPS.map((g) => cell(`w-${g}`, d.withdraw[g]))}
                <span style={{ textAlign: 'center', fontWeight: 700, color: wd ? WITHDRAW_COLOR : 'var(--text-disabled)' }}>
                  {wd || '-'}
                </span>
              </div>
            )
          })}

          {/* totals */}
          <div style={{
            display: 'grid', gridTemplateColumns: cols, gap: 4, padding: '10px 0',
            fontWeight: 700, background: 'var(--surface-raised, #F4F4F5)', borderRadius: 6, marginTop: 6,
          }}>
            <span style={{ paddingLeft: 8 }}>รวม</span>
            {BLOOD_GROUPS.map((g) => cell(`ts-${g}`, totals.store[g]))}
            <span style={{ textAlign: 'center', color: STORE_COLOR }}>{sumBlood(totals.store)}</span>
            {BLOOD_GROUPS.map((g) => cell(`tw-${g}`, totals.withdraw[g]))}
            <span style={{ textAlign: 'center', color: WITHDRAW_COLOR }}>{sumBlood(totals.withdraw)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}