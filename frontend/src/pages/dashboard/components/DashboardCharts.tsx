// ============================================================
//  src/pages/dashboard/components/DashboardCharts.tsx
// ============================================================

import type { StockSummary } from '../services/DashboardType'
import { BLOOD_GROUPS, levelOf, levelColor, levelText } from '../services/DashboardType'
import { groupSurface,groupColor } from '../../../helpers/blood'


interface Props {
  stockData: StockSummary
}

export default function DashboardCharts({ stockData }: Props) {
  const { stocks, minimum } = stockData
  const scale = Math.max(...BLOOD_GROUPS.map((x) => Math.max(stocks[x], minimum[x]))) * 1.2

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Stock vs Minimum */}
      <div style={{
        background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
        borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)', padding: 20,
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>สต็อกเทียบขั้นต่ำ</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {BLOOD_GROUPS.map((g) => {
            const c = stocks[g]
            const m = minimum[g]
            const lv = levelOf(c, m)

            return (
              <div key={g} style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 50px 80px',
                alignItems: 'center', gap: 10,
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: '50%',
                  background: groupSurface(g), color: groupColor(g),
                  fontSize: 13, fontWeight: 700,
                }}>{g}</span>

                <div style={{ position: 'relative', height: 14, borderRadius: 99, background: 'var(--surface-raised, #F4F4F5)' }}>
                  <div style={{
                    height: '100%',
                    width: `${(c / scale) * 100}%`,
                    borderRadius: 99,
                    background: levelColor(lv),
                    transformOrigin: 'left',
                    animation: 'plasm-grow 0.9s cubic-bezier(.2,.8,.2,1)',
                  }} />
                  <div style={{
                    position: 'absolute', top: -3, bottom: -3,
                    left: `${(m / scale) * 100}%`, width: 2,
                    background: 'var(--text-primary, #18181B)', borderRadius: 1,
                  }} />
                </div>

                <span style={{ fontSize: 14, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{c}</span>

                <span style={{
                  fontSize: 11, fontWeight: 600, textAlign: 'center',
                  padding: '3px 8px', borderRadius: 99,
                  background: lv === 'danger' ? '#FEF2F2' : lv === 'warning' ? '#FFFBEB' : '#F0FDF4',
                  color: lv === 'danger' ? '#DC2626' : lv === 'warning' ? '#D97706' : '#16A34A',
                }}>
                  {levelText(lv)}
                </span>
              </div>
            )
          })}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginTop: 16,
          fontSize: 12, color: 'var(--text-secondary, #71717A)',
        }}>
          <span style={{ width: 2, height: 12, background: 'var(--text-primary, #18181B)' }} />
          เส้นขั้นต่ำ (Minimum stock)
        </div>
      </div>
    </div>
  )
}