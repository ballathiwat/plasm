// src/pages/report/components/ReportTable.tsx

import type { ReportData } from '../services/ReportType'
import { groupSurface, groupInk } from '../services/ReportType'

interface Props {
  data: ReportData
}

const th: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-secondary, #71717A)',
  textAlign: 'center',
  borderBottom: '2px solid var(--border, #E4E4E7)',
  whiteSpace: 'nowrap',
}

const td: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: 13,
  textAlign: 'center',
  borderBottom: '1px solid var(--border, #E4E4E7)',
  fontVariantNumeric: 'tabular-nums',
}

const badgeStyle = (blood: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 32,
  height: 24,
  padding: '0 8px',
  borderRadius: 99,
  fontSize: 12,
  fontWeight: 700,
  background: groupSurface(blood),
  color: groupInk(blood),
})

export default function ReportTable({ data }: Props) {
  const { types, bloods, data: movement, stock } = data

  if (!types.length) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        ไม่มีข้อมูลในช่วงเวลาที่เลือก
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {types.map((type) => {
        const typeData = movement[type] || {}
        const typeStock = stock[type] || {}
        let totalStored = 0
        let totalWithdrawn = 0
        let totalStock = 0

        return (
          <div
            key={type}
            style={{
              background: 'var(--surface, #fff)',
              border: '1px solid var(--border, #E4E4E7)',
              borderRadius: 'var(--radius-lg, 10px)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
            }}
          >
            <div style={{
              padding: '14px 20px',
              background: 'var(--surface-raised, #F4F4F5)',
              borderBottom: '1px solid var(--border, #E4E4E7)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{type}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ชนิดพลาสมา</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...th, textAlign: 'left', paddingLeft: 20 }}>กรุ๊ปเลือด</th>
                    <th style={th}>จัดเก็บ</th>
                    <th style={th}>นำออก</th>
                    <th style={th}>คงเหลือในสต็อก</th>
                  </tr>
                </thead>
                <tbody>
                  {bloods.map((blood) => {
                    const d = typeData[blood] || { stored: 0, withdrawn: 0 }
                    const s = typeStock[blood] || 0
                    totalStored += d.stored
                    totalWithdrawn += d.withdrawn
                    totalStock += s

                    return (
                      <tr key={blood}>
                        <td style={{ ...td, textAlign: 'left', paddingLeft: 20 }}>
                          <span style={badgeStyle(blood)}>{blood}</span>
                        </td>
                        <td style={td}>
                          {d.stored > 0
                            ? <span style={{ color: '#16A34A', fontWeight: 600 }}>+{d.stored}</span>
                            : <span style={{ color: 'var(--text-disabled)' }}>0</span>}
                        </td>
                        <td style={td}>
                          {d.withdrawn > 0
                            ? <span style={{ color: '#DC2626', fontWeight: 600 }}>-{d.withdrawn}</span>
                            : <span style={{ color: 'var(--text-disabled)' }}>0</span>}
                        </td>
                        <td style={td}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{s}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'var(--surface-raised, #F4F4F5)' }}>
                    <td style={{ ...td, textAlign: 'left', paddingLeft: 20, fontWeight: 700, borderBottom: 'none' }}>
                      รวม {type}
                    </td>
                    <td style={{ ...td, fontWeight: 700, borderBottom: 'none', color: '#16A34A' }}>+{totalStored}</td>
                    <td style={{ ...td, fontWeight: 700, borderBottom: 'none', color: '#DC2626' }}>-{totalWithdrawn}</td>
                    <td style={{ ...td, fontWeight: 700, borderBottom: 'none', fontSize: 15 }}>{totalStock}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}