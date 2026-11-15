// ============================================================
//  frontend/src/pages/storage/components/StorageMoveModal.tsx
//  ย้ายตำแหน่งกล่อง: ห้อง/ตู้ + ชั้นวาง (+ ชั้น/ช่อง ของ rack)
// ============================================================

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, Info, MapPin } from 'lucide-react'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import { POSITION_LIST, ROOM_LEGACY_KEY, positionLabel } from '../../../helpers/rack'
import type { MasterZone, MoveBoxPayload, RackSlotMap, StorageListItem } from '../services/StorageType'
import RackSlotPicker from './RackSlotPicker'

interface Props {
  box: StorageListItem
  /** ห้อง/ตู้ที่เปิดใช้งาน (พร้อมชั้นวางที่เปิดใช้งาน) */
  zones: MasterZone[]
  onLoadRack: (zoneId: string, shelf: string) => Promise<RackSlotMap>
  /** คืน null เมื่อสำเร็จ (ผู้เรียกปิด modal เอง) / ข้อความ error */
  onMove: (box: StorageListItem, target: MoveBoxPayload, zoneName: string) => Promise<string | null>
  onClose: () => void
}

export default function StorageMoveModal({ box, zones, onLoadRack, onMove, onClose }: Props) {
  const [zoneId, setZoneId] = useState(box.zoneId ?? '')
  const [shelf, setShelf] = useState(box.shelf)
  const [level, setLevel] = useState<number | null>(box.level ?? null)
  const [position, setPosition] = useState<number | null>(box.position ?? null)
  const [slots, setSlots] = useState<RackSlotMap>({})
  const [rackError, setRackError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const zone = zones.find((z) => z.id === zoneId)
  const isRack = zone?.legacyKey === ROOM_LEGACY_KEY
  const shelfValid = !!zone?.shelves.some((s) => s.code === shelf)

  const zoneOptions = useMemo<OptionType[]>(() => zones.map((z) => ({ value: z.id, label: z.name })), [zones])
  const shelfOptions = useMemo<OptionType[]>(
    () => (zone?.shelves ?? []).map((s) => ({ value: s.code, label: s.code })),
    [zone],
  )

  // ── โหลดช่องที่มีกล่องของ rack ที่เลือก ──
  useEffect(() => {
    if (!isRack || !zoneId || !shelfValid) {
      setSlots({})
      return
    }
    let cancelled = false
    setRackError('')
    onLoadRack(zoneId, shelf)
      .then((map) => { if (!cancelled) setSlots(map) })
      .catch((err: unknown) => {
        if (cancelled) return
        setSlots({})
        setRackError((err as { message?: string } | null)?.message || 'โหลดข้อมูล rack ไม่สำเร็จ')
      })
    return () => { cancelled = true }
  }, [isRack, zoneId, shelf, shelfValid, onLoadRack])

  // ช่องที่กล่องนี้วางอยู่เองไม่นับว่าไม่ว่าง
  const freeSlots = useCallback(
    (lv: number) => POSITION_LIST.filter((p) => {
      const occupant = slots[lv]?.[p]
      return !occupant || occupant.boxId === box.id
    }),
    [slots, box.id],
  )
  const occupantLabel = useCallback((lv: number, p: number) => slots[lv]?.[p]?.boxLabel, [slots])

  const changeZone = (id: string) => {
    setZoneId(id)
    setShelf('')
    setPosition(null)
    setError('')
  }
  const changeShelf = (code: string) => {
    setShelf(code)
    setPosition(null)
    setError('')
  }
  const changeLevel = (lv: number) => {
    setLevel(lv)
    setPosition(null)
    setError('')
  }

  const complete = !!zone && shelfValid && (!isRack || (level != null && position != null))
  const changed =
    zoneId !== box.zoneId ||
    shelf !== box.shelf ||
    (isRack && (level !== (box.level ?? null) || position !== (box.position ?? null)))

  const target: MoveBoxPayload | null = complete
    ? { zoneId, shelf, ...(isRack && level != null && position != null ? { level, position } : {}) }
    : null

  const oldLabel = `${box.zoneName ? `${box.zoneName} · ` : ''}${positionLabel(box)}`
  const newLabel = target && zone ? `${zone.name} · ${positionLabel(target)}` : ''

  const handleMove = async () => {
    if (!target || !zone || !changed) return
    setSaving(true)
    setError('')
    const err = await onMove(box, target, zone.name)
    setSaving(false)
    if (err) {
      setError(err)
      // ช่องอาจเพิ่งถูกใช้ไป → โหลดสถานะ rack ใหม่
      if (isRack) onLoadRack(zoneId, shelf).then(setSlots).catch(() => setSlots({}))
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title={<span className="sto-modal-title sto-modal-title--stack"><span>ย้ายตำแหน่ง</span><span className="sto-mono sto-modal-title__sub">{box.boxLabel}</span></span>}
      titleIcon={<MapPin size={18} />}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>ยกเลิก</Button>
          <Button variant="primary" onClick={handleMove} disabled={!complete || !changed} loading={saving}>ย้ายกล่อง</Button>
        </>
      }
    >
      <div className="sto-move__compare">
        <div className="sto-move__side">
          <div className="sto-move__caption">ตำแหน่งเดิม</div>
          <div className="sto-move__value">{oldLabel}</div>
        </div>
        <ArrowRight size={18} className="sto-move__arrow" aria-hidden="true" />
        <div className="sto-move__side">
          <div className="sto-move__caption">ตำแหน่งใหม่</div>
          <div className={`sto-move__value ${changed && newLabel ? 'sto-move__value--new' : 'sto-move__value--idle'}`}>
            {!changed ? 'ยังไม่เปลี่ยน' : newLabel || 'เลือกตำแหน่งให้ครบ'}
          </div>
        </div>
      </div>

      <div className="sto-move__fields">
        <SelectDropdown
          label="ห้อง/ตู้ *"
          placeholder="เลือกห้อง/ตู้"
          options={zoneOptions}
          value={zoneOptions.find((o) => o.value === zoneId) ?? null}
          onChange={(o) => changeZone(o?.value ?? '')}
          isClearable={false}
          isSearchable={false}
        />
        <SelectDropdown
          label="ชั้นวาง *"
          placeholder={zone ? 'เลือกชั้นวาง' : 'เลือกห้อง/ตู้ก่อน'}
          options={shelfOptions}
          value={shelfOptions.find((o) => o.value === shelf) ?? null}
          onChange={(o) => changeShelf(o?.value ?? '')}
          disabled={!zone}
          isClearable={false}
          isSearchable={false}
        />
      </div>

      {zone && shelfValid && (isRack ? (
        <RackSlotPicker
          level={level}
          position={position}
          freeSlots={freeSlots}
          occupantLabel={occupantLabel}
          onLevelChange={changeLevel}
          onPositionChange={(p) => { setPosition(p); setError('') }}
          error={rackError || undefined}
          disabled={saving}
        />
      ) : (
        <p className="sto-info"><Info size={16} aria-hidden="true" /> ตู้ไม่ใช้ rack — วางกล่องในชั้น {shelf} ได้เลย</p>
      ))}

      {error && <p className="sto-error" role="alert">{error}</p>}
    </Modal>
  )
}
