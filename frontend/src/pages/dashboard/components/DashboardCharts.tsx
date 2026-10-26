// ============================================================
//  src/pages/dashboard/components/DashboardCharts.tsx
// ============================================================

import type { StockSummary } from '../services/DashboardType'
import { levelOf, levelColor, levelText } from '../services/DashboardType'
import { groupSurface, groupInk } from '../../../helpers/blood'
import { bloodChartColor, chartColorSurface } from '../../../helpers/blood'


interface Props {
  stockData: StockSummary
}

const BADGE: Record<string, { bg: string; fg: string }> = {
  danger:  { bg: '#FEF2F2', fg: '#DC2626' },
  warning: { bg: '#FFFBEB', fg: '#D97706' },
  normal:  { bg: '#F0FDF4', fg: '#16A34A' },
  none:    { bg: '#F4F4F5', fg: '#71717A' },
}

export default function DashboardCharts({ stockData }: Props) {
  const { groups, stocks, minimum } = stockData
  const scale = Math.max(
    ...groups.map((g) => Math.max(stocks[g] || 0, minimum[g] || 0)),
    1,
  ) * 1.2

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
        borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)', padding: 20,
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>สต็อกเทียบขั้นต่ำ</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {groups.map((g) => {
            const c = stocks[g] || 0
            const m = minimum[g]
            const lv = levelOf(c, m)
            const badge = BADGE[lv]

            return (
              <div key={g} style={{
                display: 'grid', gridTemplateColumns: '44px 1fr 50px 110px',
                alignItems: 'center', gap: 10,
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 36, height: 36, padding: '0 6px', borderRadius: 99,
                  background: groupSurface(g), color: groupInk(g),
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
                  {m ? (
                    <div style={{
                      position: 'absolute', top: -3, bottom: -3,
                      left: `${(m / scale) * 100}%`, width: 2,
                      background: 'var(--text-primary, #18181B)', borderRadius: 1,
                    }} />
                  ) : null}
                </div>

                <span style={{ fontSize: 14, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{c}</span>

                <span style={{
                  fontSize: 11, fontWeight: 600, textAlign: 'center',
                  padding: '3px 8px', borderRadius: 99,
                  background: badge.bg, color: badge.fg,
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