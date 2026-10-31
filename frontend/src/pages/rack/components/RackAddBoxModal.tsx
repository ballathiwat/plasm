// ============================================================
//  src/pages/rack/components/RackAddBoxModal.tsx
//  Modal "กล่องใหม่" — ตำแหน่งล็อกจากช่องที่เลือก, สแกนถุง 1 → 10
// ============================================================

import { useEffect, useState } from 'react'
import { Info, Lock, PackagePlus } from 'lucide-react'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import FormInput from '../../../components/common/FormInput'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import DateInput from '../../../components/common/DateInput'
import { BOX_CAPACITY, cleanUnit, slotLabel } from '../../../helpers/rack'
import BagStack from './BagStack'
import rackService from '../services/RackService'
import type { ApiError } from '../services/RackType'

export interface SavedBox {
  id: string
  boxLabel: string
  type: string
  blood: string
  collectionDate: string
  units: string[]
}

interface Props {
  open: boolean
  zoneId: string
  code: string
  level: number
  position: number
  plasmaTypes: string[]
  bloodTypes: string[]
  /** ปิด Esc ของ modal ระหว่างที่ dialog ยืนยันทิ้งข้อมูลเปิดอยู่ */
  escEnabled: boolean
  onClose: () => void
  onDirty: (dirty: boolean) => void
  onSaved: (box: SavedBox) => void
  onError: (msg: string, conflict: boolean) => void
}

const SCAN_ID = 'rack-add-scan'
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
const opt = (v: string): OptionType => ({ value: v, label: v })

export default function RackAddBoxModal({
  open, zoneId, code, level, position, plasmaTypes, bloodTypes, escEnabled,
  onClose, onDirty, onSaved, onError,
}: Props) {
  const [type, setType] = useState<OptionType | null>(null)
  const [blood, setBlood] = useState<OptionType | null>(null)
  const [date, setDate] = useState(today())
  const [units, setUnits] = useState<string[]>([])
  const [scan, setScan] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)
  const [nextLabel, setNextLabel] = useState('')

  // reset เมื่อเปิดใหม่
  useEffect(() => {
    if (!open) return
    setType(plasmaTypes[0] ? opt(plasmaTypes[0]) : null)
    setBlood(null)
    setDate(today())
    setUnits([])
    setScan('')
    setErr('')
  }, [open, plasmaTypes])

  useEffect(() => { onDirty(open && (units.length > 0 || !!blood)) }, [open, units, blood, onDirty])

  // เลขกล่องถัดไป (ตัวอย่าง — เลขจริง backend ออกตอนบันทึก)
  useEffect(() => {
    if (!open || !type || !blood) { setNextLabel(''); return }
    let alive = true
    rackService.nextLabel(type.value, blood.value)
      .then((r) => { if (alive) setNextLabel(r.label) })
      .catch(() => { if (alive) setNextLabel('') })
    return () => { alive = false }
  }, [open, type, blood])

  const focusScan = () => setTimeout(() => document.getElementById(SCAN_ID)?.focus(), 50)

  const addUnit = async () => {
    const u = cleanUnit(scan)
    if (!u) return
    if (units.length >= BOX_CAPACITY) { setErr(`กล่องเต็มแล้ว (สูงสุด ${BOX_CAPACITY} ถุง)`); return }
    if (units.includes(u)) { setErr(`Unit ${u} สแกนซ้ำในกล่องนี้`); setScan(''); return }
    try {
      const chk = await rackService.checkUnit(u)
      if (chk.exists) {
        setErr(`Unit ${u} มีอยู่ในระบบแล้ว${chk.boxLabel ? ` (กล่อง ${chk.boxLabel})` : ''}`)
        setScan('')
        return
      }
    } catch { /* ตรวจไม่ได้ → ให้ backend ตรวจซ้ำตอนบันทึก */ }
    setUnits((prev) => [...prev, u])
    setScan('')
    setErr('')
  }

  const missing = [
    !blood && 'เลือกหมู่เลือด',
    !date && 'ใส่วันที่เก็บ',
    !units.length && 'สแกนอย่างน้อย 1 ถุง',
  ].filter(Boolean) as string[]
  const ready = !!type && missing.length === 0

  const save = async () => {
    if (!ready || !type || !blood) {
      setErr(!blood ? 'กรุณาเลือกหมู่เลือด' : 'กรุณาสแกนอย่างน้อย 1 ถุง')
      return
    }
    setSaving(true)
    try {
      const created = await rackService.createBox({
        type: type.value, blood: blood.value, zoneId, shelf: code, level, position,
        collectionDate: date, units,
      })
      onSaved({
        id: created.id, boxLabel: created.boxLabel, type: type.value, blood: blood.value,
        collectionDate: date, units: created.units ?? units,
      })
    } catch (e) {
      const ae = e as ApiError
      setErr(ae?.message || 'บันทึกไม่สำเร็จ')
      onError(ae?.message || 'บันทึกไม่สำเร็จ', ae?.statusCode === 409)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      closeOnOverlay={false}
      closeOnEsc={escEnabled}
      titleIcon={<PackagePlus size={18} color="var(--primary)" />}
      title={
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span>กล่องใหม่</span>
          <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)' }}>
            {code}-{level} · {slotLabel(position)}
          </span>
        </span>
      }
    >
      <form
        className="rack-add"
        aria-label={`กล่องใหม่ที่ ${code}-${level} ช่อง ${position}`}
        onSubmit={(e) => { e.preventDefault(); void save() }}
      >
        <div className="rack-add__fields">
          <div className="rack-add__lockbar">
            <Lock size={12} />
            ตำแหน่งล็อกจากช่องที่เลือก
            <strong>{nextLabel || '—'}</strong>
          </div>
          <SelectDropdown
            label="ชนิดพลาสมา"
            options={plasmaTypes.map(opt)}
            value={type}
            onChange={setType}
            isClearable={false}
          />
          <SelectDropdown
            label="หมู่เลือด"
            placeholder="เลือกหมู่เลือด..."
            options={bloodTypes.map(opt)}
            value={blood}
            onChange={(o) => { setBlood(o); setErr(''); focusScan() }}
            isClearable={false}
          />
          <DateInput label="วันที่เก็บ" value={date} onChange={setDate} />
          <div>
            <label htmlFor={SCAN_ID} className="rack-field-label">สแกนถุง · {units.length}/{BOX_CAPACITY}</label>
            <div className="rack-scan">
              <FormInput
                id={SCAN_ID}
                size="sm"
                mono
                autoComplete="off"
                disabled={units.length >= BOX_CAPACITY}
                placeholder={units.length >= BOX_CAPACITY ? 'กล่องเต็ม' : `สแกนถุงที่ ${units.length + 1}`}
                value={scan}
                onChange={(v) => { setScan(v.toUpperCase()); setErr('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void addUnit() } }}
              />
              <Button type="button" size="sm" variant="outline" disabled={units.length >= BOX_CAPACITY} onClick={() => void addUnit()}>
                เพิ่ม
              </Button>
            </div>
            {err && <p role="alert" className="rack-field-error">{err}</p>}
          </div>
        </div>

        <div>
          <BagStack
            blood={blood?.value ?? ''}
            units={units}
            fill
            onRemoveLast={() => setUnits((prev) => prev.slice(0, -1))}
          />
        </div>

        <div className="rack-add__foot">
          {!ready && (
            <span className="rack-add__hint" role="status">
              <Info size={14} />
              ก่อนบันทึก: {missing.join(' · ')}
            </span>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>ยกเลิก</Button>
          <Button type="submit" loading={saving} disabled={!ready} style={{ minWidth: 200 }}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
