// ============================================================
//  src/pages/settings/components/SettingsCodeList.tsx
// ============================================================

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { CodeItem } from '../services/SettingsType'

interface Props {
  title: string
  description: string
  placeholder: string
  items: CodeItem[]
  loading: boolean
  onAdd: (code: string) => Promise<boolean>
  onToggle: (item: CodeItem) => void
}

export default function SettingsCodeList({
  title, description, placeholder, items, loading, onAdd, onToggle,
}: Props) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!value.trim() || busy) return
    setBusy(true)
    const ok = await onAdd(value.trim())
    setBusy(false)
    if (ok) setValue('')
  }

  return (
    <div style={{
      background: 'var(--surface, #fff)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg, 10px)', padding: 24, boxShadow: 'var(--shadow-sm)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 16px' }}>
        {description} · {items.length} รายการ
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, maxWidth: 420 }}>
        <input
          value={value}
          maxLength={20}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
          style={{
            flex: 1, padding: '8px 12px', fontSize: 14,
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm, 6px)',
            background: 'var(--surface, #fff)', color: 'var(--text-primary)',
          }}
        />
        <button
          onClick={submit}
          disabled={busy || !value.trim()}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            borderRadius: 'var(--radius-sm, 6px)', border: 'none',
            background: 'var(--primary, #2563EB)', color: '#fff',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            opacity: busy || !value.trim() ? 0.6 : 1,
          }}
        >
          <Plus size={14} /> เพิ่ม
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {items.map((it) => (
            <div key={it.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '6px 6px 6px 14px', borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border)', opacity: it.active ? 1 : 0.5,
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>{it.code}</span>
              <button
                onClick={() => onToggle(it)}
                style={{
                  padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${it.active ? '#BBF7D0' : '#FECACA'}`,
                  background: it.active ? '#F0FDF4' : '#FEF2F2',
                  color: it.active ? '#16A34A' : '#DC2626',
                }}
              >
                {it.active ? 'ใช้งาน' : 'ปิดอยู่'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}