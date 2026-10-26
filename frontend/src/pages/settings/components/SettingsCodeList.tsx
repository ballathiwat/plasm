// ============================================================
//  src/pages/settings/components/SettingsCodeList.tsx
// ============================================================

import { useState, useRef } from 'react'
import { Plus, Palette } from 'lucide-react'
import type { CodeItem } from '../services/SettingsType'

// สีเริ่มต้นที่แนะนำ (เลือกได้เร็ว)
const PRESET_COLORS = [
  '#EAB308', '#EC4899', '#0EA5E9', '#8B5CF6',
  '#EF4444', '#F97316', '#10B981', '#2563EB',
  '#14B8A6', '#6366F1', '#D946EF', '#78716C',
]

interface Props {
  title: string
  description: string
  placeholder: string
  items: CodeItem[]
  loading: boolean
  onAdd: (code: string, name?: string, color?: string) => Promise<boolean>
  onToggle: (item: CodeItem) => void
  onColorChange?: (item: CodeItem, color: string) => void
}

export default function SettingsCodeList({
  title, description, placeholder, items, loading, onAdd, onToggle, onColorChange,
}: Props) {
  const [value, setValue] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [busy, setBusy] = useState(false)

  // color picker popover state
  const [editingColorId, setEditingColorId] = useState<string | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const submit = async () => {
    if (!value.trim() || busy) return
    setBusy(true)
    const ok = await onAdd(value.trim(), undefined, newColor)
    setBusy(false)
    if (ok) {
      setValue('')
      // เลื่อนไปสีถัดไปที่ยังไม่ได้ใช้
      const usedColors = items.map(it => it.color).filter(Boolean)
      const next = PRESET_COLORS.find(c => !usedColors.includes(c) && c !== newColor)
      if (next) setNewColor(next)
    }
  }

  const handleColorPick = (item: CodeItem, color: string) => {
    onColorChange?.(item, color)
    setEditingColorId(null)
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

      {/* ── Add form ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, maxWidth: 520, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={value}
          maxLength={20}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
          style={{
            flex: 1, minWidth: 140, padding: '8px 12px', fontSize: 14,
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm, 6px)',
            background: 'var(--surface, #fff)', color: 'var(--text-primary)',
          }}
        />

        {/* Color picker for new item */}
        <div style={{ position: 'relative' }}>
          <label
            title="เลือกสีกราฟ"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 10px', borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border)', cursor: 'pointer',
              background: 'var(--surface, #fff)',
            }}
          >
            <span style={{
              width: 20, height: 20, borderRadius: 4,
              background: newColor, border: '1px solid rgba(0,0,0,0.1)',
              flexShrink: 0,
            }} />
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              style={{
                position: 'absolute', opacity: 0, width: 0, height: 0,
                pointerEvents: 'none',
              }}
            />
            <Palette size={14} style={{ color: 'var(--text-secondary)' }} />
          </label>
        </div>

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

      {/* ── Preset quick-pick (for new item) ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setNewColor(c)}
            title={c}
            style={{
              width: 22, height: 22, borderRadius: 4,
              background: c, border: newColor === c ? '2px solid var(--text-primary)' : '2px solid transparent',
              cursor: 'pointer', padding: 0, transition: 'border-color 0.15s',
            }}
          />
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {items.map((it) => (
            <div key={it.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '6px 6px 6px 10px', borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border)', opacity: it.active ? 1 : 0.45,
              background: 'var(--surface, #fff)', position: 'relative',
            }}>
              {/* Color swatch (clickable) */}
              {onColorChange && (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setEditingColorId(editingColorId === it.id ? null : it.id)}
                    title="เปลี่ยนสีกราฟ"
                    style={{
                      width: 22, height: 22, borderRadius: 4,
                      background: it.color || '#71717A',
                      border: '1px solid rgba(0,0,0,0.12)',
                      cursor: 'pointer', padding: 0, flexShrink: 0,
                    }}
                  />

                  {/* Popover color picker */}
                  {editingColorId === it.id && (
                    <div
                      ref={popoverRef}
                      style={{
                        position: 'absolute', top: 30, left: 0, zIndex: 100,
                        background: 'var(--surface, #fff)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md, 8px)',
                        boxShadow: 'var(--shadow-md, 0 12px 28px rgba(26,35,50,0.14))',
                        padding: 8, width: 160,
                        animation: 'plasm-fade-in 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 8 }}>
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => handleColorPick(it, c)}
                            style={{
                              width: 32, height: 32, borderRadius: 6,
                              background: c,
                              border: it.color === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                              cursor: 'pointer', padding: 0, transition: 'border-color 0.15s',
                            }}
                          />
                        ))}
                      </div>
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer',
                      }}>
                        <input
                          type="color"
                          value={it.color || '#71717A'}
                          onChange={(e) => handleColorPick(it, e.target.value)}
                          style={{ width: 28, height: 24, border: 'none', padding: 0, cursor: 'pointer' }}
                        />
                        สีกำหนดเอง
                      </label>
                    </div>
                  )}
                </div>
              )}

              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {it.code}
              </span>

              <button
                onClick={() => onToggle(it)}
                style={{
                  padding: '4px 10px', borderRadius: 99,
                  fontSize: 12, fontWeight: 600, border: 'none',
                  cursor: 'pointer',
                  background: it.active ? '#F0FDF4' : '#FEF2F2',
                  color: it.active ? '#166534' : '#991B1B',
                }}
              >
                {it.active ? 'เปิด' : 'ปิด'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}