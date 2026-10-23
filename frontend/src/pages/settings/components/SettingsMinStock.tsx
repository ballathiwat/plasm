// ============================================================
//  src/pages/settings/components/SettingsMinStock.tsx
// ============================================================

import { Save } from 'lucide-react'
import type { MinimumStock } from '../services/SettingsType'
import { groupSurface, groupInk } from '../../../helpers/blood'

interface Props {
  groups: string[]                         // หมู่เลือดที่ active จาก master
  minimumStock: MinimumStock
  saving: boolean
  loading: boolean
  onChange: (group: string, value: string) => void
  onSave: () => void
}

export default function SettingsMinStock({ groups, minimumStock, saving, loading, onChange, onSave }: Props) {
  return (
    <div style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg, 10px)',
      padding: 24, boxShadow: 'var(--shadow-sm)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>จำนวนขั้นต่ำ (Minimum Stock)</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
        กำหนดจำนวน unit ขั้นต่ำต่อหมู่เลือด — ต่ำกว่านี้จะแจ้งเตือน · เว้นว่างไว้ = ไม่กำหนด (ไม่แจ้งเตือน)
      </p>

      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
          {groups.map((g) => (
            <div key={g} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--border)',
            }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 36, height: 36, padding: '0 6px', borderRadius: 99,
                background: groupSurface(g), color: groupInk(g),
                fontSize: 14, fontWeight: 700, flexShrink: 0,
              }}>{g}</span>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>หมู่เลือด {g}</label>
                <input
                  type="number"
                  min={0}
                  placeholder="ไม่กำหนด"
                  value={minimumStock[g] ?? ''}
                  onChange={(e) => onChange(g, e.target.value)}
                  style={{
                    width: '100%', padding: '6px 10px', marginTop: 4,
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                    textAlign: 'center',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onSave}
        disabled={saving || loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '10px 24px', borderRadius: 'var(--radius-sm, 6px)',
          border: 'none', background: 'var(--primary, #2563EB)', color: '#fff',
          fontWeight: 600, fontSize: 14, cursor: saving ? 'wait' : 'pointer',
          opacity: saving || loading ? 0.7 : 1,
        }}
      >
        <Save size={14} />
        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
      </button>
    </div>
  )
}