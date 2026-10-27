// ============================================================
//  src/pages/report/components/ReportChart.tsx
// ============================================================

import type { ReportData } from '../services/ReportType'
import { groupSurface, groupInk } from '../services/ReportType'

interface Props {
  data: ReportData
  selectedType: string
}

const BAR_H = 200
const STORE_COLOR = '#16A34A'
const WITHDRAW_COLOR = '#DC2626'
const STOCK_COLOR = '#2563EB'

export default function ReportChart({ data, selectedType }: Props) {
  const { bloods, data: movement, stock } = data

  const typeData = movement[selectedType] || {}
  const typeStock = stock[selectedType] || {}

  let maxVal = 1
  for (const b of bloods) {
    const d = typeData[b] || { stored: 0, withdrawn: 0 }
    const s = typeStock[b] || 0
    maxVal = Math.max(maxVal, d.stored, d.withdrawn, s)
  }

  const barMax = BAR_H - 50

  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      boxShadow: 'var(--shadow-sm)',
      padding: 20,
      marginBottom: 16,
    }}>
      {/* Header + Legend */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16, flexWrap: 'wrap', gap: 8,
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
          {selectedType} — จัดเก็บ / นำออก / คงเหลือ
        </h3>
        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: STORE_COLOR }} /> จัดเก็บ
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: WITHDRAW_COLOR }} /> นำออก
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: STOCK_COLOR }} /> คงเหลือ
          </span>
        </div>
      </div>

      {/* Bar chart — 1 กราฟ แยกตามกรุ๊ปเลือด */}
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        gap: 8, height: BAR_H, paddingBottom: 32,
      }}>
        {bloods.map((blood) => {
          const d = typeData[blood] || { stored: 0, withdrawn: 0 }
          const s = typeStock[blood] || 0

          return (
            <div key={blood} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', height: '100%', justifyContent: 'flex-end',
            }}>
              <div style={{
                display: 'flex', alignItems: 'flex-end', gap: 3,
                width: '100%', justifyContent: 'center',
              }}>
                <SingleBar value={d.stored} max={maxVal} barMax={barMax} color={STORE_COLOR} label={`จัดเก็บ: ${d.stored}`} />
                <SingleBar value={d.withdrawn} max={maxVal} barMax={barMax} color={WITHDRAW_COLOR} label={`นำออก: ${d.withdrawn}`} />
                <SingleBar value={s} max={maxVal} barMax={barMax} color={STOCK_COLOR} label={`คงเหลือ: ${s}`} />
              </div>

              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 30, height: 22, padding: '0 8px', borderRadius: 99,
                fontSize: 11, fontWeight: 700, marginTop: 8,
                background: groupSurface(blood), color: groupInk(blood),
              }}>
                {blood}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SingleBar({ value, max, barMax, color, label }: {
  value: number; max: number; barMax: number; color: string; label: string
}) {
  const h = Math.max((value / max) * barMax, value ? 4 : 0)
  return (
    <div
      title={label}
      style={{
        width: '28%', maxWidth: 32, height: h,
        background: color, borderRadius: '4px 4px 0 0',
        transition: 'height 0.3s ease', position: 'relative',
      }}
    >
      {value > 0 && (
        <span style={{
          position: 'absolute', top: -16, left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 10, fontWeight: 600,
          color: 'var(--text-secondary)', whiteSpace: 'nowrap',
        }}>
          {value}
        </span>
      )}
    </div>
  )
}