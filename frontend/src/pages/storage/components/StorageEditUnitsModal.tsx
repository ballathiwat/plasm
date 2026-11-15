// ============================================================
//  frontend/src/pages/storage/components/StorageEditUnitsModal.tsx
//  แก้ไข units ในกล่อง: สแกนเพิ่ม / ลบพร้อมหมายเหตุ
// ============================================================

import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Plus, ScanBarcode, X } from 'lucide-react'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import FormInput from '../../../components/common/FormInput'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import { BOX_CAPACITY, UNIT_FORMAT_ERROR, UNIT_PATTERN, cleanUnit } from '../../../helpers/rack'
import type {
  RemovalReasonOption, StorageListItem, UnitCheckResult, UnitRemovalInput,
} from '../services/StorageType'

interface Props {
  box: StorageListItem
  removalReasons: RemovalReasonOption[]
  onCheckUnit: (unit: string) => Promise<UnitCheckResult>
  /** คืน null เมื่อสำเร็จ (ผู้เรียกปิด modal เอง) / ข้อความ error */
  onSave: (box: StorageListItem, units: string[], removals: UnitRemovalInput[], addedCount: number) => Promise<string | null>
  onClose: () => void
}

export default function StorageEditUnitsModal({ box, removalReasons, onCheckUnit, onSave, onClose }: Props) {
  const existing = useMemo(
    () => box.unitItems.filter((u) => u.status === 'stored').map((u) => u.unitNumber),
    [box.unitItems],
  )
  const [added, setAdded] = useState<string[]>([])
  /** unit เดิมที่จะลบ → reasonId ('' = ยังไม่เลือกหมายเหตุ) */
  const [removing, setRemoving] = useState<Record<string, string>>({})
  const [input, setInput] = useState('')
  const [inputError, setInputError] = useState('')
  const [checking, setChecking] = useState(false)
  const [tried, setTried] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const scanRef = useRef<HTMLDivElement>(null)

  const reasonOptions = useMemo<OptionType[]>(
    () => removalReasons.map((r) => ({ value: r.id, label: r.name })),
    [removalReasons],
  )

  const removeCount = Object.keys(removing).length
  const remaining = existing.length - removeCount + added.length
  const full = remaining >= BOX_CAPACITY
  const changed = added.length > 0 || removeCount > 0

  const focusScan = () => scanRef.current?.querySelector('input')?.focus()

  const handleAdd = async () => {
    const u = cleanUnit(input)
    if (!u || checking) return
    setSaveError('')

    if (!UNIT_PATTERN.test(u)) return setInputError(UNIT_FORMAT_ERROR)
    if (added.includes(u)) return setInputError(`${u} สแกนแล้วในกล่องนี้`)
    if (existing.includes(u)) {
      if (!(u in removing)) return setInputError(`${u} อยู่ในกล่องนี้แล้ว`)
      // สแกน unit เดิมที่กดลบไว้ → ยกเลิกการลบ
      if (full) return setInputError(`กล่องเต็ม ${BOX_CAPACITY} ถุงแล้ว`)
      keepUnit(u)
      setInput('')
      setInputError('')
      return
    }
    if (full) return setInputError(`กล่องเต็ม ${BOX_CAPACITY} ถุงแล้ว`)

    setChecking(true)
    try {
      const res = await onCheckUnit(u)
      if (res.exists) {
        setInputError(
          res.status === 'withdrawn'
            ? `${u} เคยอยู่ในกล่อง ${res.boxLabel} และนำออกแล้ว — ใช้เลขซ้ำไม่ได้`
            : `${u} อยู่ในกล่อง ${res.boxLabel} แล้ว — ตรวจเลขถุงอีกครั้ง`,
        )
        return
      }
      setAdded((prev) => [...prev, u])
      setInput('')
      setInputError('')
    } catch (err) {
      setInputError((err as { message?: string } | null)?.message || 'ตรวจสอบ unit ไม่สำเร็จ')
    } finally {
      setChecking(false)
      focusScan()
    }
  }

  const onScanKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    handleAdd()
  }

  const markRemove = (u: string) => setRemoving((prev) => ({ ...prev, [u]: '' }))
  const keepUnit = (u: string) =>
    setRemoving((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== u)))

  const handleSave = async () => {
    setSaveError('')
    if (Object.values(removing).some((reasonId) => !reasonId)) {
      setTried(true)
      return
    }
    const units = [...existing.filter((u) => !(u in removing)), ...added]
    if (units.length === 0) {
      setSaveError('กล่องต้องเหลืออย่างน้อย 1 unit — ถ้าจะนำออกทั้งกล่องให้ใช้เมนูนำออก')
      return
    }
    const removals: UnitRemovalInput[] = Object.entries(removing).map(([unitNumber, reasonId]) => ({ unitNumber, reasonId }))

    setSaving(true)
    const err = await onSave(box, units, removals, added.length)
    setSaving(false)
    if (err) setSaveError(err)
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      closeOnOverlay={!changed}
      footerAlign="between"
      title={<span className="sto-modal-title sto-modal-title--stack"><span>แก้ไข units</span><span className="sto-mono sto-modal-title__sub">{box.boxLabel}</span></span>}
      footer={
        <>
          <span className="sto-edit__summary">
            เพิ่ม <b>{added.length}</b> · ลบ <b>{removeCount}</b> → {remaining} units
          </span>
          <span className="sto-edit__footer-actions">
            <Button variant="secondary" onClick={onClose} disabled={saving}>ยกเลิก</Button>
            <Button variant="primary" onClick={handleSave} disabled={!changed} loading={saving}>บันทึกการแก้ไข</Button>
          </span>
        </>
      }
    >
      <div className="sto-edit__scan" ref={scanRef}>
        <FormInput
          label="สแกนเพิ่ม unit"
          mono
          icon={<ScanBarcode size={14} />}
          placeholder={full ? `กล่องเต็ม ${BOX_CAPACITY} ถุงแล้ว` : 'สแกนหรือพิมพ์เลข unit แล้วกด Enter'}
          value={input}
          onChange={(v) => { setInput(v.toUpperCase()); setInputError('') }}
          onKeyDown={onScanKeyDown}
          disabled={full || saving}
          error={inputError || undefined}
          helper={full ? undefined : `${remaining}/${BOX_CAPACITY} ถุง · ตรวจ unit ซ้ำอัตโนมัติ`}
          autoFocus
        />
        <Button variant="outline" icon={<Plus size={14} />} onClick={handleAdd} disabled={full || saving || !input.trim()} loading={checking}>
          เพิ่ม
        </Button>
      </div>

      <ul className="sto-edit__list">
        {added.map((u) => (
          <li key={u} className="sto-edit__row sto-edit__row--new">
            <span className="sto-mono sto-edit__no">{u}</span>
            <span className="sto-edit__tag">ใหม่</span>
            <button type="button" className="sto-icon-btn" aria-label={`ยกเลิกการเพิ่ม ${u}`} onClick={() => setAdded((prev) => prev.filter((x) => x !== u))}>
              <X size={16} />
            </button>
          </li>
        ))}
        {existing.map((u) => {
          const marked = u in removing
          const missing = tried && marked && !removing[u]
          return (
            <li key={u} className={`sto-edit__row ${marked ? 'sto-edit__row--remove' : ''}`}>
              <span className="sto-mono sto-edit__no">{u}</span>
              {marked ? (
                <>
                  <div className="sto-edit__reason">
                    <SelectDropdown
                      placeholder="เลือกหมายเหตุการลบ..."
                      options={reasonOptions}
                      value={reasonOptions.find((o) => o.value === removing[u]) ?? null}
                      onChange={(o) => setRemoving((prev) => ({ ...prev, [u]: o?.value ?? '' }))}
                      isClearable={false}
                      isSearchable={false}
                      noOptionsMessage="ยังไม่มีตัวเลือก — ให้ผู้ดูแลเพิ่มในเมนูตั้งค่า"
                      error={missing ? 'เลือกหมายเหตุการลบ' : undefined}
                    />
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => keepUnit(u)} disabled={full}>ไม่ลบ</Button>
                </>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => markRemove(u)} aria-label={`ลบ ${u}`}>ลบ</Button>
              )}
            </li>
          )
        })}
      </ul>

      {saveError && <p className="sto-error" role="alert">{saveError}</p>}
      <p className="sto-note">การลบจะบันทึกหมายเหตุในประวัติ — ใช้เมนูนำออกสำหรับการจ่ายเลือด</p>
    </Modal>
  )
}
