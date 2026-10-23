// ============================================================
//  src/pages/storage/components/StorageQuickAdd.tsx
//  ปุ่ม "+ เพิ่มใหม่" ใต้ dropdown — พิมพ์ค่าใหม่แล้วบันทึกได้ทันที
// ============================================================

import { useState } from 'react'
import { Plus, Check, X } from 'lucide-react'

interface Props {
  placeholder: string
  disabled?: boolean
  maxLength?: number
  uppercase?: boolean
  onAdd: (value: string) => Promise<boolean>
}

export default function StorageQuickAdd({
  placeholder, disabled, maxLength = 20, uppercase, onAdd,
}: Props) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)

  const close = () => { setOpen(false); setValue('') }

  const submit = async () => {
    if (!value.trim() || busy) return
    setBusy(true)
    const ok = await onAdd(value.trim())
    setBusy(false)
    if (ok) close()
  }

  if (!open) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 6,
          padding: 0, border: 'none', background: 'none',
          fontSize: 12, fontWeight: 600,
          color: disabled ? 'var(--text-disabled)' : 'var(--primary, #2563EB)',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <Plus size={12} /> เพิ่มใหม่
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 6, animation: 'plasm-fade-in 0.15s ease' }}>
      <input
        autoFocus
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); submit() }
          if (e.key === 'Escape') close()
        }}
        style={{
          flex: 1, minWidth: 0, padding: '6px 10px', fontSize: 13,
          border: '1px solid var(--primary, #2563EB)',
          borderRadius: 'var(--radius-sm, 6px)',
          background: 'var(--surface, #fff)', color: 'var(--text-primary)',
          textTransform: uppercase ? 'uppercase' : 'none',
        }}
      />
      <button
        type="button"
        onClick={submit}
        disabled={busy || !value.trim()}
        title="บันทึก"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 30, borderRadius: 'var(--radius-sm, 6px)', border: 'none',
          background: 'var(--primary, #2563EB)', color: '#fff', cursor: 'pointer',
          opacity: busy || !value.trim() ? 0.6 : 1,
        }}
      >
        <Check size={14} />
      </button>
      <button
        type="button"
        onClick={close}
        title="ยกเลิก"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 30, borderRadius: 'var(--radius-sm, 6px)',
          border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer',
        }}
      >
        <X size={14} color="var(--text-secondary)" />
      </button>
    </div>
  )
}
