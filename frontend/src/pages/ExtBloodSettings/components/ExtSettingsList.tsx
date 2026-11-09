// frontend/src/pages/ExtBloodSettings/components/ExtSettingsList.tsx
import { useState } from 'react'
import { Plus, GripVertical, Trash2, Lock, ToggleLeft, ToggleRight } from 'lucide-react'

interface Item { id: string; name: string; active: boolean; locked?: boolean; sort: number }

interface Props {
  title: string
  placeholder?: string
  items: Item[]
  onAdd: (n: string) => Promise<void>
  onUpdate: (id: string, d: Partial<Item>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onReorder: (ids: string[]) => Promise<void>
  hasLocked?: boolean
}

export default function ExtSettingsList({ title, placeholder, items, onAdd, onUpdate, onDelete, onReorder, hasLocked }: Props) {
  const [name, setName] = useState('')
  const [adding, setAdding] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const add = async () => {
    const n = name.trim()
    if (!n) return
    setAdding(true)
    try { await onAdd(n); setName('') }
    finally { setAdding(false) }
  }

  return (
    <div className="ext-settings-card">
      <h3 className="ext-settings-card-title">{title}</h3>

      <div className="ext-settings-add">
        <input
          type="text"
          className="ext-form-input"
          placeholder={placeholder || `เพิ่ม${title}...`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add() }}
          disabled={adding}
        />
        <button
          className="plasm-btn plasm-btn--primary plasm-btn--sm"
          onClick={add}
          disabled={adding || !name.trim()}
        >
          <Plus size={16} /> เพิ่ม
        </button>
      </div>

      <div className="ext-settings-list">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`ext-settings-item ${dragIdx === i ? 'ext-settings-item--dragging' : ''}`}
            draggable
            onDragStart={() => setDragIdx(i)}
            onDragOver={(e) => {
              e.preventDefault()
              if (dragIdx === null || dragIdx === i) return
              const r = [...items]
              const [m] = r.splice(dragIdx, 1)
              r.splice(i, 0, m)
              onReorder(r.map((x) => x.id))
              setDragIdx(i)
            }}
            onDragEnd={() => setDragIdx(null)}
          >
            <GripVertical size={16} className="ext-settings-grip" />
            <span className="ext-settings-name">{item.name}</span>

            {hasLocked && item.locked && (
              <span className="ext-settings-locked" title="ค่าเริ่มต้น ลบไม่ได้">
                <Lock size={13} />
              </span>
            )}

            <button
              className="ext-settings-toggle"
              onClick={() => onUpdate(item.id, { active: !item.active })}
              title={item.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
            >
              {item.active
                ? <ToggleRight size={22} color="var(--success-ink)" />
                : <ToggleLeft size={22} color="var(--text-disabled)" />}
            </button>

            {!(hasLocked && item.locked) && (
              <button
                className="ext-action-btn ext-action-btn--danger"
                onClick={() => { if (confirm(`ลบ "${item.name}" ?`)) onDelete(item.id) }}
                title="ลบ"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <p className="ext-form-hint" style={{ padding: 16, textAlign: 'center' }}>
            ยังไม่มีรายการ
          </p>
        )}
      </div>
    </div>
  )
}
