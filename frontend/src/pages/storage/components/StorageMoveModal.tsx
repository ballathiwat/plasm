// ============================================================
//  frontend/src/pages/storage/components/StorageMoveModal.tsx
//  ย้ายตำแหน่งกล่อง: ห้อง/ตู้ + ชั้นวาง (+ ชั้น/ช่อง ของ rack)
// ============================================================

import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, Info, MapPin } from 'lucide-react'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import { POSITION_LIST, ROOM_LEGACY_KEY, positionLabel } from '../../../helpers/rack'
import type { MasterZone, MoveBoxPayload, RackSlotMap, StorageListItem } from '../services/StorageType'
import RackSlotPicker from './RackSlotPicker'

const ZONE_SCROLL_AT = 9

/** Arrow-key handler สำหรับ radiogroup — ใช้ร่วมทั้งห้อง/ตู้ และชั้นวาง */
function onRadioKey(
  e: KeyboardEvent,
  list: { key: string }[],
  currentIndex: number,
  pick: (key: string) => void,
) {
  let next = -1
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    next = currentIndex + 1 >= list.length ? 0 : currentIndex + 1
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    next = currentIndex - 1 < 0 ? list.length - 1 : currentIndex - 1
  }
  if (next < 0) return
  e.preventDefault()
  pick(list[next].key)
}

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
  const [zoneQuery, setZoneQuery] = useState('')

  const zoneGroupRef = useRef<HTMLDivElement>(null)
  const shelfGroupRef = useRef<HTMLDivElement>(null)

  const zone = zones.find((z) => z.id === zoneId)
  const isRack = zone?.legacyKey === ROOM_LEGACY_KEY
  const shelfValid = !!zone?.shelves.some((s) => s.code === shelf)

  const many = zones.length > ZONE_SCROLL_AT
  const visibleZones = zones.filter(
    (z) => !zoneQuery.trim() || z.id === zoneId || z.name.toLowerCase().includes(zoneQuery.trim().toLowerCase()),
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
    // focus ตัวที่เลือก
    requestAnimationFrame(() => {
      zoneGroupRef.current?.querySelector<HTMLButtonElement>(`[aria-checked="true"]`)?.focus()
    })
  }
  const changeShelf = (code: string) => {
    setShelf(code)
    setPosition(null)
    setError('')
    requestAnimationFrame(() => {
      shelfGroupRef.current?.querySelector<HTMLButtonElement>(`[aria-checked="true"]`)?.focus()
    })
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

  // ── zone radio key items ──
  const zoneItems = visibleZones.map((z) => ({ key: z.id }))
  const zoneIdx = zoneItems.findIndex((i) => i.key === zoneId)

  // ── shelf radio key items ──
  const shelfItems = (zone?.shelves ?? []).map((s) => ({ key: s.code }))
  const shelfIdx = shelfItems.findIndex((i) => i.key === shelf)

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
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

      {/* ── ห้อง/ตู้ ── */}
      <div className="sto-move__group" role="radiogroup" aria-labelledby="sto-move-zone-lbl" ref={zoneGroupRef}>
        <div className="sto-move__group-head">
          <span id="sto-move-zone-lbl" className="sto-move__label">
            ห้อง/ตู้ <span className="sto-req">*</span>
            {many && <span className="sto-muted"> · {zones.length} รายการ</span>}
          </span>
          {many && (
            <input
              type="search"
              className="sto-move__search"
              placeholder="ค้นหาห้อง / ตู้..."
              aria-label="ค้นหาห้อง / ตู้"
              value={zoneQuery}
              onChange={(e) => setZoneQuery(e.target.value)}
            />
          )}
        </div>
        <div className={`sto-move__zones ${many ? 'is-scroll' : ''}`}>
          {visibleZones.length === 0 ? (
            <p className="sto-muted">ไม่พบห้อง/ตู้ &quot;{zoneQuery}&quot;</p>
          ) : (
            visibleZones.map((z, i) => {
              const on = z.id === zoneId
              return (
                <button
                  key={z.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  title={z.name}
                  className={`sto-move__zone ${on ? 'is-on' : ''}`}
                  onClick={() => !on && changeZone(z.id)}
                  disabled={saving}
                  tabIndex={on ? 0 : zoneIdx < 0 && i === 0 ? 0 : -1}
                  onKeyDown={(e) => onRadioKey(e, zoneItems, zoneItems.findIndex((item) => item.key === z.id), changeZone)}
                >
                  <span className="sto-move__radio" aria-hidden="true" />
                  <span className="sto-move__zone-name">{z.name}</span>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── ชั้นวาง ── */}
      {zone && (
        (zone.shelves ?? []).length === 0 ? (
          <div className="sto-move__group">
            <span className="sto-move__label">ชั้นวาง <span className="sto-req">*</span></span>
            <p className="sto-muted">ห้อง/ตู้นี้ยังไม่มีชั้นวาง — เพิ่มได้ที่ ตั้งค่า › ข้อมูลหลัก</p>
          </div>
        ) : (
          <div className="sto-move__group" role="radiogroup" aria-labelledby="sto-move-shelf-lbl" ref={shelfGroupRef}>
            <span id="sto-move-shelf-lbl" className="sto-move__label">ชั้นวาง <span className="sto-req">*</span></span>
            <div className="sto-move__shelves">
              {zone.shelves.map((s, i) => {
                const on = s.code === shelf
                return (
                  <button
                    key={s.code}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={`sto-move__shelf ${on ? 'is-on' : ''}`}
                    onClick={() => changeShelf(s.code)}
                    disabled={saving}
                    tabIndex={on ? 0 : shelfIdx < 0 && i === 0 ? 0 : -1}
                    onKeyDown={(e) => onRadioKey(e, shelfItems, shelfItems.findIndex((item) => item.key === s.code), changeShelf)}
                  >
                    {s.code}
                  </button>
                )
              })}
            </div>
          </div>
        )
      )}

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
