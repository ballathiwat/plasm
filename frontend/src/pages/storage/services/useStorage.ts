// ============================================================
//  frontend/src/pages/storage/services/useStorage.ts
//  state + logic ของฟอร์มจัดเก็บกล่องใหม่ (/storage/new)
//  (รายการกล่อง / แก้ไข units / ย้ายตำแหน่ง อยู่ใน useStorageList.ts)
// ============================================================

import { useCallback, useEffect, useMemo, useState } from 'react'
import storageService from './StorageService'
import type {
  MasterOptions, RackSlotMap, StorageBoxItem, StorageFormData,
} from './StorageType'
import type { ToastState } from '../../../components/common/Toast'
import type { BarcodeLabelData } from '../components/BarcodeLabel'
import type { ApiError } from '../../../helpers/http/types'
import {
  BOX_CAPACITY, LEVEL_LIST, POSITION_LIST, ROOM_LEGACY_KEY,
  UNIT_FORMAT_ERROR, UNIT_PATTERN, cleanUnit, positionLabel,
} from '../../../helpers/rack'

/** วันนี้ตามเวลาเครื่อง (yyyy-MM-dd) */
export const todayISO = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const emptyForm = (): StorageFormData => ({
  boxName: '', type: '', blood: '', collectionDate: todayISO(), zoneId: '', shelf: '',
})

const errorMessage = (err: unknown, fallback: string) =>
  (err as Partial<ApiError> | null)?.message || fallback

/** ช่องของฟอร์มที่ตรวจความครบถ้วน */
export type StorageField = 'type' | 'blood' | 'collectionDate' | 'zoneId' | 'shelf' | 'slot' | 'units'
export type StorageErrors = Partial<Record<StorageField, string>>

/** กล่องที่เพิ่งบันทึกสำเร็จ — ใช้แสดง banner + พิมพ์ฉลาก */
export interface SavedBox {
  boxLabel: string
  unitCount: number
  location: string
  print: BarcodeLabelData
}

const labelData = (box: StorageBoxItem, zoneName: string): BarcodeLabelData => ({
  boxLabel: box.boxLabel,
  type: box.type,
  blood: box.blood,
  location: box.zoneName || zoneName,
  shelf: box.level != null && box.position != null
    ? `${box.shelf}-${box.level} ช่อง ${box.position}`
    : box.shelf,
  collectionDate: box.collectionDate,
  unitCount: box.units.length,
})

export default function useStorage() {
  const [master, setMaster] = useState<MasterOptions>({ plasmaTypes: [], bloodTypes: [], zones: [] })
  const [form, setForm] = useState<StorageFormData>(emptyForm)
  const [nextLabel, setNextLabel] = useState('')
  const [scannedUnits, setScannedUnits] = useState<string[]>([])
  const [unitInput, setUnitInputState] = useState('')
  const [unitError, setUnitError] = useState('')
  const [checking, setChecking] = useState(false)
  // ── ตำแหน่งใน rack (เฉพาะห้อง -30°C) ──
  const [rackLevel, setRackLevelState] = useState<number | null>(null)
  const [rackPosition, setRackPosition] = useState<number | null>(null)
  const [slots, setSlots] = useState<RackSlotMap>({})

  const [tried, setTried] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [saved, setSaved] = useState<SavedBox | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [printData, setPrintData] = useState<BarcodeLabelData | null>(null)

  // ── Load master (เฉพาะรายการที่ active) ──
  const loadMaster = useCallback(async (): Promise<MasterOptions> => {
    const [p, b, z] = await Promise.all([
      storageService.listPlasmaTypes(),
      storageService.listBloodTypes(),
      storageService.listZones(),
    ])
    const options: MasterOptions = {
      plasmaTypes: p.filter((x) => x.active),
      bloodTypes: b.filter((x) => x.active),
      zones: z
        .filter((x) => x.active)
        .map((x) => ({ ...x, shelves: x.shelves.filter((s) => s.active) })),
    }
    setMaster(options)
    return options
  }, [])

  useEffect(() => {
    loadMaster().catch((err: unknown) => {
      setToast({ type: 'error', msg: errorMessage(err, 'โหลดข้อมูลหลักไม่สำเร็จ') })
    })
  }, [loadMaster])

  // ── เลขกล่องถัดไป (แสดงตัวอย่างเท่านั้น เลขจริง backend ออกตอนบันทึก) ──
  const refreshNextLabel = useCallback(async (type: string, blood: string) => {
    if (!type || !blood) {
      setNextLabel('')
      return
    }
    try {
      const res = await storageService.getNextLabel(type, blood)
      setNextLabel(res.label)
    } catch {
      setNextLabel('')
    }
  }, [])

  useEffect(() => {
    refreshNextLabel(form.type, form.blood)
  }, [form.type, form.blood, refreshNextLabel])

  // ── ห้อง/ตู้ + ชั้นวางที่เลือก ──
  const zone = useMemo(() => master.zones.find((z) => z.id === form.zoneId), [master.zones, form.zoneId])
  const availableShelves = useMemo(() => zone?.shelves ?? [], [zone])
  const isRackZone = zone?.legacyKey === ROOM_LEGACY_KEY

  // ── ห้อง -30°C: กล่องที่วางอยู่ในแต่ละช่องของ rack ที่เลือก ──
  const loadOccupancy = useCallback(async () => {
    if (!isRackZone || !form.zoneId || !form.shelf) {
      setSlots({})
      return
    }
    try {
      setSlots(await storageService.getRackSlots(form.zoneId, form.shelf))
    } catch {
      setSlots({})
    }
  }, [isRackZone, form.zoneId, form.shelf])

  useEffect(() => {
    loadOccupancy()
  }, [loadOccupancy])

  const freeSlots = useCallback(
    (lv: number) => POSITION_LIST.filter((p) => !slots[lv]?.[p]),
    [slots],
  )
  const occupantLabel = useCallback((lv: number, p: number) => slots[lv]?.[p]?.boxLabel, [slots])

  // ชั้น: เลือกชั้นแรกที่ยังมีช่องว่างให้ · ช่อง: ผู้ใช้ต้องเลือกเอง (ช่องที่เพิ่งถูกใช้ไป → ยกเลิกการเลือก)
  useEffect(() => {
    if (!isRackZone || !form.shelf) {
      setRackLevelState(null)
      setRackPosition(null)
      return
    }
    setRackLevelState((cur) =>
      cur && freeSlots(cur).length > 0 ? cur : (LEVEL_LIST.find((lv) => freeSlots(lv).length > 0) ?? null),
    )
  }, [isRackZone, form.shelf, freeSlots])

  useEffect(() => {
    setRackPosition((cur) => (cur && rackLevel && freeSlots(rackLevel).includes(cur) ? cur : null))
  }, [rackLevel, freeSlots])

  const setRackLevel = (lv: number) => {
    setRackLevelState(lv)
    setRackPosition(null)
  }

  // ── Form handlers ──
  const handleFormChange = (field: keyof StorageFormData, value: string) => {
    setSubmitError('')
    setForm((f) => {
      const updated = { ...f, [field]: value }
      // เปลี่ยนห้อง/ตู้ → ต้องเลือกชั้นวางใหม่
      if (field === 'zoneId' && value !== f.zoneId) updated.shelf = ''
      return updated
    })
    if (field === 'zoneId' || field === 'shelf') setRackPosition(null)
  }

  // ── สแกนถุง: ตรวจรูปแบบ → ซ้ำในกล่อง → ซ้ำในระบบ (/units/check) ──
  const setUnitInput = (v: string) => {
    setUnitInputState(v)
    setUnitError('')
  }

  const handleAddUnit = async () => {
    if (checking) return
    const incoming = unitInput.split(/[,\s]+/).map(cleanUnit).filter(Boolean)
    if (incoming.length === 0) return

    const units = [...scannedUnits]
    let error = ''
    let rest: string[] = []
    setChecking(true)
    try {
      for (let i = 0; i < incoming.length; i++) {
        const u = incoming[i]
        rest = incoming.slice(i)
        if (!UNIT_PATTERN.test(u)) { error = UNIT_FORMAT_ERROR; break }
        const at = units.indexOf(u)
        if (at >= 0) { error = `${u} สแกนแล้วในกล่องนี้ (ถุงที่ ${at + 1})`; break }
        if (units.length >= BOX_CAPACITY) { error = `กล่องเต็มแล้ว (สูงสุด ${BOX_CAPACITY} ถุง)`; break }
        const res = await storageService.checkUnit(u)
        if (res.exists) {
          error = res.status === 'withdrawn'
            ? `${u} เคยอยู่ในกล่อง ${res.boxLabel} และนำออกแล้ว — ใช้เลขซ้ำไม่ได้`
            : `${u} อยู่ในกล่อง ${res.boxLabel} แล้ว — ตรวจเลขถุงอีกครั้ง`
          break
        }
        units.push(u)
        rest = incoming.slice(i + 1)
      }
    } catch (err) {
      error = errorMessage(err, 'ตรวจสอบ unit ไม่สำเร็จ')
    } finally {
      setChecking(false)
    }

    setScannedUnits(units)
    setUnitInputState(error ? rest.join(' ') : '')
    setUnitError(error)
    setSubmitError('')
  }

  const handleUnitKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddUnit()
    }
  }

  const handleRemoveUnit = (unit: string) => {
    setScannedUnits((prev) => prev.filter((u) => u !== unit))
    setUnitError('')
  }

  // ── ความครบถ้วนของฟอร์ม ──
  const errors = useMemo<StorageErrors>(() => {
    const e: StorageErrors = {}
    if (!form.type) e.type = 'เลือกชนิดเลือด'
    if (!form.blood) e.blood = 'เลือกหมู่เลือด'
    if (!form.collectionDate) e.collectionDate = 'ระบุวันที่เก็บ'
    else if (form.collectionDate > todayISO()) e.collectionDate = 'วันที่เก็บต้องไม่เกินวันนี้'
    if (!form.zoneId) e.zoneId = 'เลือกห้อง/ตู้'
    if (!form.shelf) e.shelf = 'เลือกชั้นวาง'
    else if (isRackZone && (!rackLevel || !rackPosition)) e.slot = 'เลือกช่องที่จะวางกล่อง'
    if (scannedUnits.length === 0) e.units = 'สแกนถุงอย่างน้อย 1 ถุง'
    return e
  }, [form, isRackZone, rackLevel, rackPosition, scannedUnits.length])

  const valid = Object.keys(errors).length === 0

  /** ตำแหน่งเต็ม เช่น "ห้อง -30°C · L1-2 ช่อง 7" — ว่างถ้ายังเลือกไม่ครบ */
  const locationLabel = useMemo(() => {
    if (!zone || !form.shelf || (isRackZone && (!rackLevel || !rackPosition))) return ''
    const pos = positionLabel({
      shelf: form.shelf,
      level: isRackZone ? rackLevel : null,
      position: isRackZone ? rackPosition : null,
    })
    return `${zone.name} · ${pos}`
  }, [zone, form.shelf, isRackZone, rackLevel, rackPosition])

  // ── Submit ──
  const handleSubmit = async () => {
    if (submitting) return
    setTried(true)
    setSubmitError('')
    if (!valid) return

    setSubmitting(true)
    try {
      const created = await storageService.createBox({
        boxName: form.boxName.trim() || undefined,
        type: form.type,
        blood: form.blood,
        zoneId: form.zoneId,
        shelf: form.shelf,
        collectionDate: form.collectionDate,
        units: scannedUnits,
        ...(isRackZone && rackLevel && rackPosition
          ? { level: rackLevel, position: rackPosition }
          : {}),
      })

      const unitCount = scannedUnits.length
      setToast({ type: 'success', msg: `จัดเก็บ ${created.boxLabel} (${unitCount} ถุง) แล้ว` })
      setSaved({
        boxLabel: created.boxLabel,
        unitCount,
        location: locationLabel,
        print: labelData(created, zone?.name ?? ''),
      })

      // พร้อมสำหรับกล่องถัดไป: ล้างเฉพาะถุง ช่อง rack และชื่อกล่อง — คงชนิด หมู่ วันที่ ห้อง ชั้นวาง
      setScannedUnits([])
      setUnitInputState('')
      setUnitError('')
      setRackPosition(null)
      setForm((f) => ({ ...f, boxName: '' }))
      setTried(false)
      refreshNextLabel(form.type, form.blood)
      loadOccupancy()
    } catch (err) {
      setSubmitError(errorMessage(err, 'บันทึกไม่สำเร็จ'))
      // ช่องถูกใช้ไปแล้ว / unit ซ้ำ → โหลดสถานะ rack ใหม่
      if ((err as Partial<ApiError> | null)?.statusCode === 409) loadOccupancy()
    } finally {
      setSubmitting(false)
    }
  }

  /** ล้างทั้งฟอร์มกลับเป็นค่าเริ่มต้น */
  const resetForm = () => {
    setForm(emptyForm())
    setScannedUnits([])
    setUnitInputState('')
    setUnitError('')
    setRackPosition(null)
    setTried(false)
    setSubmitError('')
  }

  return {
    // ข้อมูลหลัก + ฟอร์ม
    master, form, nextLabel, availableShelves, zoneName: zone?.name ?? '',
    handleFormChange,
    // rack
    isRackZone, rackLevel, setRackLevel, rackPosition, setRackPosition, freeSlots, occupantLabel,
    // สแกนถุง
    scannedUnits, unitInput, setUnitInput, unitError, checking,
    handleAddUnit, handleUnitKeyDown, handleRemoveUnit,
    // ตรวจ + บันทึก
    errors, valid, tried, locationLabel,
    submitting, submitError, handleSubmit, resetForm,
    // หลังบันทึก
    saved, dismissSaved: () => setSaved(null),
    printData, openPrint: setPrintData, closePrint: () => setPrintData(null),
    toast, dismissToast: () => setToast(null),
  }
}
