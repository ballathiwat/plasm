// ============================================================
//  src/pages/report/components/ReportTable.tsx
// ============================================================

import { useMemo } from 'react'
import type { ReportData } from '../services/ReportType'
import { groupSurface, groupInk } from '../services/ReportType'

interface Props {
  data: ReportData
  selectedType: string
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

export default function ReportTable({ data, selectedType }: Props) {
  const { bloods } = data

  // ── ดึงข้อมูลเฉพาะชนิดที่เลือก ──
  const typeData = data.data?.[selectedType] ?? {}
  const typeStock = data.stock?.[selectedType] ?? {}

  // ── สร้าง rows + คำนวณ total แยกจาก render ──
  const { rows, totalStored, totalWithdrawn, totalStock } = useMemo(() => {
    let sumStored = 0
    let sumWithdrawn = 0
    let sumStock = 0

    const list = bloods.map((blood) => {
      const stored = typeData[blood]?.stored ?? 0
      const withdrawn = typeData[blood]?.withdrawn ?? 0
      const stock = typeStock[blood] ?? 0

      sumStored += stored
      sumWithdrawn += withdrawn
      sumStock += stock

      return { blood, stored, withdrawn, stock }
    })

    return {
      rows: list,
      totalStored: sumStored,
      totalWithdrawn: sumWithdrawn,
      totalStock: sumStock,
    }
  }, [bloods, typeData, typeStock])

  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
    }}>
      {/* Type header */}
      <div style={{
        padding: '14px 20px',
        background: 'var(--surface-raised, #F4F4F5)',
        borderBottom: '1px solid var(--border, #E4E4E7)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{selectedType}</span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ชนิดพลาสมา</span>
      </div>

      {/* Table */}
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
            {rows.map((row) => (
              <tr key={row.blood}>
                <td style={{ ...td, textAlign: 'left', paddingLeft: 20 }}>
                  <span style={badgeStyle(row.blood)}>{row.blood}</span>
                </td>
                <td style={td}>
                  {row.stored > 0
                    ? <span style={{ color: '#16A34A', fontWeight: 600 }}>+{row.stored}</span>
                    : <span style={{ color: 'var(--text-disabled, #A1A1AA)' }}>0</span>}
                </td>
                <td style={td}>
                  {row.withdrawn > 0
                    ? <span style={{ color: '#DC2626', fontWeight: 600 }}>-{row.withdrawn}</span>
                    : <span style={{ color: 'var(--text-disabled, #A1A1AA)' }}>0</span>}
                </td>
                <td style={td}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{row.stock}</span>
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr style={{ background: 'var(--surface-raised, #F4F4F5)' }}>
              <td style={{ ...td, textAlign: 'left', paddingLeft: 20, fontWeight: 700, borderBottom: 'none' }}>
                รวม {selectedType}
              </td>
              <td style={{ ...td, fontWeight: 700, borderBottom: 'none', color: '#16A34A' }}>
                +{totalStored}
              </td>
              <td style={{ ...td, fontWeight: 700, borderBottom: 'none', color: '#DC2626' }}>
                -{totalWithdrawn}
              </td>
              <td style={{ ...td, fontWeight: 700, borderBottom: 'none', fontSize: 15 }}>
                {totalStock}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}