// ============================================================
//  src/pages/dashboard/components/DashboardStockCards.tsx
// ============================================================

import { TrendingUp, TrendingDown } from 'lucide-react'
import type { StockSummary } from '../services/DashboardType'
import { levelOf, levelColor, levelText } from '../services/DashboardType'
import { groupSurface, groupInk } from '../../../helpers/blood'

interface Props {
  data: StockSummary
}

export default function DashboardStockCards({ data }: Props) {
  const { groups, stocks, minimum, change } = data

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 12, marginBottom: 16,
    }}>
      {groups.map((g) => {
        const count = stocks[g] || 0
        const min = minimum[g]
        const lv = levelOf(count, min)
        const color = levelColor(lv)
        const pct = change[g] || 0
        const progress = min ? Math.min(count / min, 1) : 0

        return (
          <div key={g} style={{
            background: 'var(--surface, #fff)',
            border: '1px solid var(--border, #E4E4E7)',
            borderTop: `3px solid ${color}`,
            borderRadius: 'var(--radius-lg, 10px)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 32, height: 32, padding: '0 6px', borderRadius: 99,
                  background: groupSurface(g), color: groupInk(g),
                  fontSize: 13, fontWeight: 700,
                }}>{g}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary, #18181B)' }}>
                  หมู่เลือด {g}
                </span>
              </div>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 2,
                fontSize: 12, fontWeight: 600,
                color: pct >= 0 ? '#10B981' : '#EF4444',
              }}>
                {pct >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {pct >= 0 ? '▲' : '▼'}{Math.abs(pct)}%
              </span>
            </div>

            <div style={{
              fontSize: 36, fontWeight: 700, lineHeight: 1.1,
              color: 'var(--text-primary, #18181B)', marginBottom: 6,
            }}>
              {count.toLocaleString()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color }}>
                {levelText(lv)}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary, #71717A)' }}>
                {min ? `ขั้นต่ำ ${min} units` : '—'}
              </span>
            </div>

            <div style={{ height: 6, borderRadius: 99, background: 'var(--surface-raised, #F4F4F5)' }}>
              <div style={{
                height: '100%',
                width: `${progress * 100}%`,
                borderRadius: 99, background: color,
                transformOrigin: 'left',
                animation: 'plasm-grow 0.9s cubic-bezier(.2,.8,.2,1)',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}