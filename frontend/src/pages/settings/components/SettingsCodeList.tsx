// src/pages/settings/components/SettingsCodeList.tsx — ชนิดเลือด / หมู่เลือด
// สีกราฟเลือกให้อัตโนมัติ เปลี่ยนได้ที่ช่องสีหน้ารายการ (popover: Esc/คลิกนอกเพื่อปิด, คืน focus)
import { useState, useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import type { CodeItem } from '../services/SettingsType'
import Button from '../../../components/common/Button'
import FormInput from '../../../components/common/FormInput'
import { ConfirmModal } from '../../../components/common/Modal'
import StgSwitch from './StgSwitch'
import { card, h3, sub, TGT } from './settingsStyles'

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
  /** ข้อความผลกระทบที่แสดงก่อนปิดใช้งาน (ไม่ส่ง = ปิดได้ทันที) */
  impact?: (item: CodeItem) => string[]
}

export default function SettingsCodeList({
  title, description, placeholder, items, loading, onAdd, onToggle, onColorChange, impact,
}: Props) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [dupErr, setDupErr] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [offAsk, setOffAsk] = useState<CodeItem | null>(null)
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({})
  const pop = useRef<HTMLDivElement>(null)

  const close = (focus = true) => {
    const id = editing
    setEditing(null)
    if (focus && id) triggers.current[id]?.focus()
  }

  useEffect(() => {
    if (!editing) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (pop.current?.contains(t) || triggers.current[editing]?.contains(t)) return
      close(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); close() } }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    requestAnimationFrame(() => {
      const b = pop.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]') || pop.current?.querySelector<HTMLButtonElement>('button')
      b?.focus()
    })
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  const nextColor = () =>
    PRESET_COLORS.find((c) => !items.some((i) => i.color === c)) || PRESET_COLORS[items.length % PRESET_COLORS.length]

  const submit = async () => {
    const v = value.trim()
    if (!v || busy) return
    if (items.some((i) => i.code.toLowerCase() === v.toLowerCase())) { setDupErr(`มี "${v}" อยู่แล้ว — ถ้าถูกปิดไว้ ให้เปิดใช้งานแทน`); return }
    setBusy(true)
    const ok = await onAdd(v, undefined, nextColor())
    setBusy(false)
    if (ok) setValue('')
  }

  const toggle = (it: CodeItem) => { if (it.active && impact) setOffAsk(it); else onToggle(it) }
  const pick = (it: CodeItem, c: string) => { onColorChange?.(it, c); close() }

  return (
    <div style={card}>
      <h3 style={h3}>{title}</h3>
      <p style={sub}>{description} · {items.length} รายการ</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 6, maxWidth: 520 }}>
        <FormInput
          style={{ flex: 1, minWidth: 140 }}
          aria-label={`เพิ่ม${title}`}
          value={value}
          maxLength={20}
          placeholder={placeholder}
          error={dupErr || undefined}
          onChange={(v: string) => { setValue(v); setDupErr('') }}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') submit() }}
        />
        <Button icon={<Plus size={14} />} onClick={submit} loading={busy} disabled={busy || !value.trim()}>เพิ่ม</Button>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
        ระบบเลือกสีกราฟให้อัตโนมัติ — คลิกที่ช่องสีหน้ารายการเพื่อเปลี่ยน
      </p>

      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {items.map((it) => (
            <div key={it.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 4px 2px 2px',
              borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--border)',
              background: it.active ? 'var(--surface, #fff)' : 'var(--surface-raised)',
            }}>
              {onColorChange && (
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    ref={(el) => { triggers.current[it.id] = el }}
                    onClick={() => (editing === it.id ? close() : setEditing(it.id))}
                    title="เปลี่ยนสีกราฟ" aria-label={`เปลี่ยนสีกราฟ ${it.code}`}
                    aria-haspopup="dialog" aria-expanded={editing === it.id}
                    style={{ width: TGT, height: TGT, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', borderRadius: 6, cursor: 'pointer', padding: 0 }}
                  >
                    <span style={{ width: 20, height: 20, borderRadius: 4, background: it.color || '#71717A', border: '1px solid rgba(0,0,0,0.12)' }} />
                  </button>
                  {editing === it.id && (
                    <div ref={pop} role="dialog" aria-label={`เลือกสีกราฟของ ${it.code}`} style={{
                      position: 'absolute', top: TGT + 4, left: 0, zIndex: 100, background: 'var(--surface, #fff)',
                      border: '1px solid var(--border)', borderRadius: 'var(--radius-md, 8px)', boxShadow: 'var(--shadow-md)',
                      padding: 8, width: 168, animation: 'plasm-fade-in 0.15s ease',
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 8 }}>
                        {PRESET_COLORS.map((c) => (
                          <button key={c} type="button" aria-pressed={it.color === c} aria-label={`สี ${c}`} onClick={() => pick(it, c)} style={{
                            width: 36, height: 36, borderRadius: 6, background: c, padding: 0, cursor: 'pointer',
                            border: it.color === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                          }} />
                        ))}
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 32, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <input type="color" value={it.color || '#71717A'} onChange={(e) => onColorChange(it, e.target.value)} style={{ width: 28, height: 24, border: 'none', padding: 0, cursor: 'pointer' }} />
                        สีกำหนดเอง
                      </label>
                    </div>
                  )}
                </div>
              )}
              <span style={{ fontSize: 14, fontWeight: 600, paddingLeft: onColorChange ? 0 : 8, color: it.active ? 'var(--text-primary)' : 'var(--text-disabled)' }}>{it.code}</span>
              <StgSwitch on={it.active} label={it.code} onChange={() => toggle(it)} />
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!offAsk}
        type="warning"
        title={offAsk ? `ปิดใช้งาน ${offAsk.code}?` : ''}
        confirmText="ปิดใช้งาน"
        message={offAsk && impact ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
            {impact(offAsk).map((t, i) => <div key={i} style={{ display: 'flex', gap: 8 }}><span aria-hidden="true">•</span><span>{t}</span></div>)}
            <div style={{ color: 'var(--text-secondary)' }}>ข้อมูลและเอกสารเดิมไม่หาย เปิดกลับได้ทุกเมื่อ</div>
          </div>
        ) : ''}
        onClose={() => setOffAsk(null)}
        onConfirm={() => { onToggle(offAsk!); setOffAsk(null) }}
      />
    </div>
  )
}
