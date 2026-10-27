// frontend/src/pages/report-daily/components/DailyChart.tsx

import type { DailyData } from '../services/DailyReportType'
import { sumBlood } from '../services/DailyReportType'
import { groupColor, bloodChartColor } from '../../../helpers/blood'

const CHART_H = 140

interface Props {
  dailyData: DailyData[]
  groups: string[]
  maxValue: number
}

function StackedBar({ values, groups, max }: { values: Record<string, number>; groups: string[]; max: number }) {
  const total = sumBlood(values)
  return (
    <div style={{ flex: 1, maxWidth: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{total || ''}</span>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column-reverse', borderRadius: '4px 4px 2px 2px', overflow: 'hidden' }}>
        {groups.map((g) => {
          const v = values[g] || 0
          if (!v) return null
          return (
            <div
              key={g}
              title={`${g}: ${v}`}
              style={{
                height: (v / max) * CHART_H,
                minHeight: 3,
                background: bloodChartColor(g),
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

export default function DailyChart({ dailyData, groups, maxValue }: Props) {
  return (
    <div
      style={{
        background: 'var(--surface, #fff)',
        border: '1px solid var(--border, #E4E4E7)',
        borderRadius: 'var(--radius-lg, 10px)',
        boxShadow: 'var(--shadow-sm)',
        padding: 20,
        marginBottom: 16,
      }}
    >
      {/* Title + Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
          นำเข้า / นำออก รายวัน (7 วันล่าสุด)
        </h3>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
          {groups.map((g) => (
            <span key={g} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: groupColor(g) }} /> {g}
            </span>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: CHART_H + 40 }}>
        {dailyData.map((d) => (
          <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, justifyContent: 'flex-end', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, width: '100%', justifyContent: 'center' }}>
              <StackedBar values={d.store} groups={groups} max={maxValue} />
              <StackedBar values={d.withdraw} groups={groups} max={maxValue} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8, fontSize: 11, color: 'var(--text-secondary)' }}>
        <span>แท่งซ้าย = นำเข้า</span>
        <span>แท่งขวา = นำออก</span>
      </div>
    </div>
  )
}