// ============================================================
//  src/pages/settings/components/SettingsRemovalReasons.tsx
//  ตั้งค่าตัวเลือก "หมายเหตุการลบ unit" (ใช้ในหน้าแก้ไข Units)
// ============================================================

import { useState, type CSSProperties } from 'react'
import { Plus, Pencil, Check, X } from 'lucide-react'
import type { RemovalReasonItem } from '../services/SettingsType'
import Button from '../../../components/common/Button'
import FormInput from '../../../components/common/FormInput'

interface Props {
  items: RemovalReasonItem[]
  loading: boolean
  onAdd: (name: string) => Promise<boolean>
  onRename: (item: RemovalReasonItem, name: string) => Promise<boolean>
  onToggle: (item: RemovalReasonItem) => void
}

export default function SettingsRemovalReasons({
  items, loading, onAdd, onRename, onToggle,
}: Props) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const submit = async () => {
    if (!value.trim() || busy) return
    setBusy(true)
    const ok = await onAdd(value.trim())
    setBusy(false)
    if (ok) setValue('')
  }

  const saveRename = async (it: RemovalReasonItem) => {
    const name = editValue.trim()
    if (!name || name === it.name) { setEditingId(null); return }
    setBusy(true)
    const ok = await onRename(it, name)
    setBusy(false)
    if (ok) setEditingId(null)
  }

  const activeCount = items.filter((i) => i.active).length

  return (
    <div style={{
      background: 'var(--surface, #fff)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg, 10px)', padding: 24, boxShadow: 'var(--shadow-sm)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>หมายเหตุการลบ unit</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 16px' }}>
        ตัวเลือกที่ต้องเลือกทุกครั้งเมื่อลบ unit ออกจากกล่อง · เปิดใช้งาน {activeCount} / {items.length} รายการ
      </p>

      {/* ── Add form ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, maxWidth: 520 }}>
        <FormInput
          style={{ flex: 1, minWidth: 160 }}
          value={value}
          maxLength={100}
          placeholder="หมายเหตุใหม่ เช่น สแกนผิดกล่อง"
          onChange={setValue}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
        />
        <Button
          icon={<Plus size={14} />}
          onClick={submit}
          loading={busy && !editingId}
          disabled={busy || !value.trim()}
        >
          เพิ่ม
        </Button>
      </div>

      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
      ) : items.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
          ยังไม่มีหมายเหตุ — เพิ่มอย่างน้อย 1 รายการเพื่อให้ลบ unit ได้
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 640 }}>
          {items.map((it, idx) => (
            <div key={it.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border)', opacity: it.active ? 1 : 0.5,
              background: 'var(--surface, #fff)',
            }}>
              <span style={{ width: 22, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right' }}>
                {idx + 1}.
              </span>

              {editingId === it.id ? (
                <>
                  <input
                    autoFocus
                    value={editValue}
                    maxLength={100}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename(it)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    style={{
                      flex: 1, padding: '6px 10px', fontSize: 14,
                      border: '1px solid var(--primary, #2563EB)', borderRadius: 6,
                    }}
                  />
                  <button title="บันทึก" onClick={() => saveRename(it)} disabled={busy}
                    style={iconBtn('var(--primary, #2563EB)')}>
                    <Check size={15} />
                  </button>
                  <button title="ยกเลิก" onClick={() => setEditingId(null)}
                    style={iconBtn('var(--text-secondary)')}>
                    <X size={15} />
                  </button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>{it.name}</span>
                  <button title="แก้ไขข้อความ"
                    onClick={() => { setEditingId(it.id); setEditValue(it.name) }}
                    style={iconBtn('var(--text-secondary)')}>
                    <Pencil size={14} />
                  </button>
                  <Button
                    pill
                    size="sm"
                    variant={it.active ? 'outline-success' : 'outline-danger'}
                    onClick={() => onToggle(it)}
                  >
                    {it.active ? 'เปิด' : 'ปิด'}
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const iconBtn = (color: string): CSSProperties => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 30, height: 30, borderRadius: 6, border: '1px solid var(--border)',
  background: 'transparent', cursor: 'pointer', color,
})
