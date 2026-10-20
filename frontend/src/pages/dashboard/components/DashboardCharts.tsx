// ============================================================
//  src/pages/dashboard/components/DashboardCharts.tsx
// ============================================================

import type { StockSummary, DailyData } from '../services/DashboardType'
import { BLOOD_GROUPS, GROUP_COLOR, GROUP_SURFACE, levelOf, levelColor, levelText } from '../services/DashboardType'

interface Props {
  stockData: StockSummary
  dailyData: DailyData[]
  maxDailyValue: number
}

export default function DashboardCharts({ stockData, dailyData, maxDailyValue }: Props) {
  const { stocks, minimum } = stockData
  const scale = Math.max(...BLOOD_GROUPS.map((x) => Math.max(stocks[x], minimum[x]))) * 1.2

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: 16, marginBottom: 16,
    }}>
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
                  background: GROUP_SURFACE[g], color: GROUP_COLOR[g],
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

      {/* 7-Day Storage */}
      <div style={{
        background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
        borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)', padding: 20,
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>การจัดเก็บ 7 วันล่าสุด</h3>
        {dailyData.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160 }}>
            {dailyData.map((d, i) => {
              const isLast = i === dailyData.length - 1
              return (
                <div key={i} style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{d.value}</span>
                  <div style={{
                    width: '100%', maxWidth: 48,
                    height: `${(d.value / maxDailyValue) * 100}%`,
                    minHeight: d.value > 0 ? 4 : 0,
                    borderRadius: '6px 6px 2px 2px',
                    background: isLast ? 'var(--primary, #2563EB)' : 'var(--group-a-surface, #DBEAFE)',
                    transformOrigin: 'bottom',
                    animation: `plasm-rise 0.7s cubic-bezier(.2,.8,.2,1) ${i * 0.05}s both`,
                  }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.label}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
            ยังไม่มีข้อมูล
          </div>
        )}
      </div>
    </div>
  )
}
