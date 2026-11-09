// ============================================================
//  src/pages/settings/components/SettingsMinStock.tsx
// ============================================================

import { Save } from 'lucide-react'
import type { MinimumStock } from '../services/SettingsType'
import { groupSurface, groupInk } from '../../../helpers/blood'
import Button from '../../../components/common/Button'
import FormInput from '../../../components/common/FormInput'

interface Props {
  groups: string[]
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12, marginBottom: 20,
        }}>
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

              <FormInput
                style={{ flex: 1 }}
                label={`หมู่เลือด ${g}`}
                type="number"
                min={0}
                size="sm"
                placeholder="ไม่กำหนด"
                value={minimumStock[g] ?? ''}
                onChange={(v) => onChange(g, v)}
              />
            </div>
          ))}
        </div>
      )}

      <Button
        icon={<Save size={14} />}
        onClick={onSave}
        loading={saving}
        disabled={saving || loading}
      >
        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
      </Button>
    </div>
  )
}