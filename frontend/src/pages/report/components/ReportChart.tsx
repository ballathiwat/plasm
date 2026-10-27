// src/pages/report/components/ReportChart.tsx

import type { ReportData } from '../services/ReportType'
import { groupSurface, groupInk } from '../services/ReportType'

interface Props {
  data: ReportData
}

const BAR_H = 180
const STORE_COLOR = '#16A34A'
const WITHDRAW_COLOR = '#DC2626'
const STOCK_COLOR = '#2563EB'

export default function ReportChart({ data }: Props) {
  const { types, bloods, data: movement, stock } = data
  if (!types.length) return null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      gap: 16,
      marginBottom: 16,
    }}>
      {types.map((type) => {
        const typeData = movement[type] || {}
        const typeStock = stock[type] || {}

        let maxVal = 1
        for (const b of bloods) {
          const d = typeData[b] || { stored: 0, withdrawn: 0 }
          const s = typeStock[b] || 0
          maxVal = Math.max(maxVal, d.stored, d.withdrawn, s)
        }

        return (
          <div
            key={type}
            style={{
              background: 'var(--surface, #fff)',
              border: '1px solid var(--border, #E4E4E7)',
              borderRadius: 'var(--radius-lg, 10px)',
              boxShadow: 'var(--shadow-sm)',
              padding: 20,
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
              {type} — จัดเก็บ / นำออก / คงเหลือ
            </h3>

            <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: 2, background: STORE_COLOR }} />
                จัดเก็บ
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: 2, background: WITHDRAW_COLOR }} />
                นำออก
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: 2, background: STOCK_COLOR }} />
                คงเหลือ
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 6,
              height: BAR_H,
              paddingBottom: 28,
            }}>
              {bloods.map((blood) => {
                const d = typeData[blood] || { stored: 0, withdrawn: 0 }
                const s = typeStock[blood] || 0

                return (
                  <div key={blood} style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: 2,
                      width: '100%',
                      justifyContent: 'center',
                    }}>
                      <div
                        title={`จัดเก็บ: ${d.stored}`}
                        style={{
                          width: '28%', maxWidth: 24,
                          height: Math.max((d.stored / maxVal) * (BAR_H - 40), d.stored ? 4 : 0),
                          background: STORE_COLOR,
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 0.3s ease',
                        }}
                      />
                      <div
                        title={`นำออก: ${d.withdrawn}`}
                        style={{
                          width: '28%', maxWidth: 24,
                          height: Math.max((d.withdrawn / maxVal) * (BAR_H - 40), d.withdrawn ? 4 : 0),
                          background: WITHDRAW_COLOR,
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 0.3s ease',
                        }}
                      />
                      <div
                        title={`คงเหลือ: ${s}`}
                        style={{
                          width: '28%', maxWidth: 24,
                          height: Math.max((s / maxVal) * (BAR_H - 40), s ? 4 : 0),
                          background: STOCK_COLOR,
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 0.3s ease',
                        }}
                      />
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 28, height: 20,
                      padding: '0 6px',
                      borderRadius: 99,
                      fontSize: 11, fontWeight: 700,
                      marginTop: 6,
                      background: groupSurface(blood),
                      color: groupInk(blood),
                    }}>
                      {blood}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}