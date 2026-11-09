// src/pages/settings/components/SettingsMinStock.tsx — ต้องกด "บันทึก" (หมวดเดียวที่ไม่บันทึกอัตโนมัติ)
import { Save, AlertCircle, EyeOff } from 'lucide-react'
import type { MinimumStock } from '../services/SettingsType'
import { groupSurface, groupInk } from '../../../helpers/blood'
import Button from '../../../components/common/Button'
import FormInput from '../../../components/common/FormInput'
import { card, linkBtn } from './settingsStyles'

interface Props {
  groups: string[]
  hiddenGroups: string[]
  minimumStock: MinimumStock
  saving: boolean
  loading: boolean
  dirty: boolean
  onChange: (group: string, value: string) => void
  onSave: () => void
  onReset: () => void
  onOpenGroups: () => void
}

export default function SettingsMinStock({
  groups, hiddenGroups, minimumStock, saving, loading, dirty, onChange, onSave, onReset, onOpenGroups,
}: Props) {
  return (
    <div style={card}>
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>จำนวนขั้นต่ำ (Minimum Stock)</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
        กำหนดจำนวน unit ขั้นต่ำต่อหมู่เลือด — ต่ำกว่านี้จะแจ้งเตือน · เว้นว่างไว้ = ไม่กำหนด (ไม่แจ้งเตือน)
      </p>

      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
          {groups.map((g) => (
            <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border)' }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, height: 36, padding: '0 6px',
                borderRadius: 99, background: groupSurface(g), color: groupInk(g), fontSize: 14, fontWeight: 700, flexShrink: 0,
              }}>{g}</span>
              <FormInput
                style={{ flex: 1 }}
                label={`หมู่เลือด ${g}`}
                type="number"
                min={0}
                step={1}
                size="sm"
                placeholder="ไม่กำหนด"
                value={minimumStock[g] ?? ''}
                onChange={(v: string) => onChange(g, v)}
              />
            </div>
          ))}
        </div>
      )}

      {hiddenGroups.length > 0 && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-secondary)', margin: '-8px 0 20px' }}>
          <EyeOff size={14} />หมู่เลือดที่ปิดใช้งาน ({hiddenGroups.join(', ')}) ไม่แสดงที่นี่และไม่แจ้งเตือน —
          <button type="button" onClick={onOpenGroups} style={linkBtn}>เปิดได้ที่ หมู่เลือด</button>
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Button icon={<Save size={14} />} onClick={onSave} loading={saving} disabled={saving || loading || !dirty}>
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
        {dirty && !saving && (
          <>
            <span role="status" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--warning-ink)' }}>
              <AlertCircle size={14} />มีการแก้ไขที่ยังไม่บันทึก
            </span>
            <Button variant="ghost" size="sm" onClick={onReset}>ยกเลิกการแก้ไข</Button>
          </>
        )}
      </div>
    </div>
  )
}
