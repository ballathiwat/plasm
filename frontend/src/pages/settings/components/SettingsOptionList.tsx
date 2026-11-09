// src/pages/settings/components/SettingsOptionList.tsx
// รายการตัวเลือกในฟอร์ม (หมายเหตุการลบ, สถานที่ส่งเลือด, ตำแหน่งจัดเก็บ, เหตุผลการนำออก) — รูปแบบเดียวทุกหมวด
import { useState, useRef } from 'react'
import { Plus, GripVertical, Trash2, Lock, Pencil, Check, X, AlertTriangle, Loader2 } from 'lucide-react'
import Button from '../../../components/common/Button'
import FormInput from '../../../components/common/FormInput'
import { ConfirmModal } from '../../../components/common/Modal'
import StgSwitch from './StgSwitch'
import { card, h3, sub, iconBtn, TGT } from './settingsStyles'

export interface OptionItem { id: string; name: string; active: boolean; locked?: boolean; sort: number }

interface Props {
  title: string
  description: string
  placeholder?: string
  items: OptionItem[]
  loading?: boolean
  maxLength?: number
  hasLocked?: boolean
  /** ต้องเปิดใช้งานไว้อย่างน้อยกี่รายการ (0 = ไม่บังคับ) */
  minActive?: number
  minActiveMsg?: string
  onAdd: (name: string) => Promise<unknown>
  onToggle: (item: OptionItem) => Promise<unknown> | void
  onRename?: (item: OptionItem, name: string) => Promise<unknown>
  onDelete?: (item: OptionItem) => Promise<unknown>
  onReorder?: (ids: string[]) => Promise<unknown> | void
}

const errMsg = (e: any) => e?.message || 'บันทึกไม่สำเร็จ — ลองใหม่อีกครั้ง'

export default function SettingsOptionList({
  title, description, placeholder, items, loading, maxLength = 100, hasLocked,
  minActive = 0, minActiveMsg, onAdd, onToggle, onRename, onDelete, onReorder,
}: Props) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOrder, setDragOrder] = useState<OptionItem[] | null>(null)
  const [delItem, setDelItem] = useState<OptionItem | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const list = dragOrder ?? items
  const activeCount = items.filter((i) => i.active).length
  const exists = (n: string, exceptId?: string) =>
    items.some((x) => x.id !== exceptId && x.name.trim().toLowerCase() === n.toLowerCase())

  const guard = async (fn: () => Promise<unknown> | void) => {
    setBusy(true); setErr('')
    try { await fn(); return true } catch (e) { setErr(errMsg(e)); return false } finally { setBusy(false) }
  }

  const add = async () => {
    const v = value.trim()
    if (!v || busy) return
    if (exists(v)) { setErr(`มี "${v}" อยู่แล้ว — ถ้าถูกปิดไว้ ให้เปิดใช้งานแทนการเพิ่มใหม่`); return }
    if (await guard(() => onAdd(v))) setValue('')
  }

  const rename = async (it: OptionItem) => {
    const n = editVal.trim()
    if (!n || n === it.name || !onRename) { setEditId(null); return }
    if (exists(n, it.id)) { setErr(`มี "${n}" อยู่แล้ว`); return }
    if (await guard(() => onRename(it, n))) setEditId(null)
  }

  const toggle = (it: OptionItem) => {
    if (it.active && minActive && activeCount <= minActive) {
      setErr(minActiveMsg || `ต้องเปิดใช้งานอย่างน้อย ${minActive} รายการ`); return
    }
    guard(() => onToggle(it))
  }

  const move = (i: number, dir: number) => {
    if (!onReorder) return
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const r = [...items]; [r[i], r[j]] = [r[j], r[i]]
    guard(() => onReorder(r.map((x) => x.id)))
    requestAnimationFrame(() => listRef.current?.querySelectorAll<HTMLButtonElement>('[data-grip]')[j]?.focus())
  }

  const endDrag = () => {
    if (dragOrder && onReorder && dragOrder.some((x, k) => x.id !== items[k]?.id)) guard(() => onReorder(dragOrder.map((x) => x.id)))
    setDragOrder(null); setDragIdx(null)
  }

  // ช่องว่างแทนปุ่มที่ไม่มี เพื่อให้คอลัมน์สวิตช์ตรงกันทุกแถว
  const actionSlots = (onRename ? 1 : 0) + (onDelete ? 1 : 0)

  return (
    <div style={card}>
      <h3 style={h3}>{title}</h3>
      <p style={sub}>{description} · เปิดใช้งาน {activeCount} / {items.length} รายการ</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: err ? 8 : 16, maxWidth: 520 }}>
        <FormInput
          style={{ flex: 1, minWidth: 160 }}
          aria-label={`เพิ่ม${title}`}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(v: string) => { setValue(v); setErr('') }}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') add() }}
        />
        <Button icon={<Plus size={14} />} onClick={add} loading={busy && !editId} disabled={busy || !value.trim()}>เพิ่ม</Button>
      </div>

      {err && (
        <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--danger-ink)', marginBottom: 16 }}>
          <AlertTriangle size={14} />{err}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Loader2 size={20} className="ext-spin" /> กำลังโหลด...
        </div>
      ) : list.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md, 8px)', maxWidth: 640 }}>
          ยังไม่มีรายการ — พิมพ์ในช่องด้านบนแล้วกด Enter เพื่อเพิ่มรายการแรก
        </div>
      ) : (
        <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 640 }}>
          {list.map((it, i) => {
            const locked = !!(hasLocked && it.locked)
            return (
              <div
                key={it.id}
                draggable={!!onReorder && editId !== it.id}
                onDragStart={() => { setDragOrder(items); setDragIdx(i) }}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (dragIdx === null || dragIdx === i || !dragOrder) return
                  const r = [...dragOrder]; const [m] = r.splice(dragIdx, 1); r.splice(i, 0, m)
                  setDragOrder(r); setDragIdx(i)
                }}
                onDragEnd={endDrag}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                  borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--border)',
                  background: it.active ? 'var(--surface, #fff)' : 'var(--surface-raised)',
                  opacity: dragIdx === i ? 0.5 : 1,
                }}
              >
                {onReorder && (
                  <button
                    type="button" data-grip=""
                    aria-label={`จัดลำดับ ${it.name} — กดลูกศรขึ้น/ลงเพื่อย้าย`} title="ลากหรือกด ↑/↓ เพื่อจัดลำดับ"
                    onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); move(i, e.key === 'ArrowUp' ? -1 : 1) } }}
                    style={{ cursor: 'grab', color: 'var(--text-disabled)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: TGT, height: TGT, background: 'none', border: 'none', padding: 0, borderRadius: 4, flexShrink: 0 }}
                  >
                    <GripVertical size={16} />
                  </button>
                )}
                <span style={{ width: 20, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>{i + 1}.</span>

                {editId === it.id ? (
                  <>
                    <input
                      autoFocus aria-label={`แก้ไข ${it.name}`} value={editVal} maxLength={maxLength}
                      onChange={(e) => setEditVal(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') rename(it); if (e.key === 'Escape') setEditId(null) }}
                      style={{ flex: 1, minWidth: 0, padding: '6px 10px', fontSize: 14, font: 'inherit', border: '1px solid var(--primary)', borderRadius: 6, outline: 'none', boxShadow: '0 0 0 3px var(--primary-surface)' }}
                    />
                    <button type="button" title="บันทึก" aria-label="บันทึก" onClick={() => rename(it)} disabled={busy} style={iconBtn('var(--primary)')}><Check size={15} /></button>
                    <button type="button" title="ยกเลิก" aria-label="ยกเลิก" onClick={() => setEditId(null)} style={iconBtn('var(--text-secondary)')}><X size={15} /></button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: it.active ? 'var(--text-primary)' : 'var(--text-disabled)' }}>{it.name}</span>
                    {locked && (
                      <span title="ค่าเริ่มต้นของระบบ — แก้ชื่อหรือลบไม่ได้ แต่ปิดใช้งานได้" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0 }}>
                        <Lock size={12} />ค่าเริ่มต้น
                      </span>
                    )}
                    <StgSwitch on={it.active} label={it.name} onChange={() => toggle(it)} disabled={busy} />
                    {locked ? (
                      actionSlots > 0 && <span style={{ width: TGT * actionSlots + 8 * (actionSlots - 1), flexShrink: 0 }} />
                    ) : (
                      <>
                        {onRename && (
                          <button type="button" title="แก้ไขชื่อ" aria-label={`แก้ไขชื่อ ${it.name}`} onClick={() => { setEditId(it.id); setEditVal(it.name) }} style={iconBtn('var(--text-secondary)')}>
                            <Pencil size={14} />
                          </button>
                        )}
                        {onDelete && (
                          <button type="button" title="ลบ" aria-label={`ลบ ${it.name}`} onClick={() => setDelItem(it)} style={iconBtn('var(--danger-ink)')}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      <ConfirmModal
        open={!!delItem}
        type="danger"
        title="ลบรายการ?"
        message={delItem ? <p>ลบ <b>{delItem.name}</b> ออกจากตัวเลือก? เอกสารเดิมที่ใช้ค่านี้จะไม่เปลี่ยน — ถ้าแค่ไม่ต้องการให้เลือกชั่วคราว ให้ปิดใช้งานแทน</p> : ''}
        confirmText="ลบ"
        loading={busy}
        onClose={() => setDelItem(null)}
        onConfirm={async () => { const it = delItem!; if (await guard(() => onDelete!(it))) setDelItem(null) }}
      />
    </div>
  )
}
