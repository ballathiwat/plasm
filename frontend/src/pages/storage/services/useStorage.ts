// ============================================================
//  src/pages/storage/services/useStorage.ts
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import storageService from './StorageService'
import type {
  StorageBoxItem,
  StorageFormData,
  ToastState,
  MasterOptions,
  QuickAddKind,
} from './StorageType'
import type { BarcodeLabelData } from '../components/BarcodeLabel'

const EMPTY_FORM: StorageFormData = {
  boxName: '',
  type: '',
  blood: '',
  collectionDate: new Date().toISOString().split('T')[0],
  zoneId: '',
  shelf: '',
}

export default function useStorage() {
  const [boxes, setBoxes] = useState<StorageBoxItem[]>([])
  const [loading, setLoading] = useState(true)
  const [master, setMaster] = useState<MasterOptions>({ plasmaTypes: [], bloodTypes: [], zones: [] })
  const [form, setForm] = useState<StorageFormData>(EMPTY_FORM)
  const [nextLabel, setNextLabel] = useState('')
  const [scannedUnits, setScannedUnits] = useState<string[]>([])
  const [unitInput, setUnitInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [printData, setPrintData] = useState<BarcodeLabelData | null>(null)

  // ── Load boxes ──
  const loadBoxes = useCallback(async () => {
    setLoading(true)
    try {
      setBoxes(await storageService.getStoredBoxes())
    } catch {
      setBoxes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadBoxes() }, [loadBoxes])

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

  // ── โหลดครั้งแรก + ตั้งค่าเริ่มต้นของฟอร์ม ──
  useEffect(() => {
    loadMaster()
      .then(({ plasmaTypes, bloodTypes, zones }) => {
        setForm((f) => ({
          ...f,
          type: f.type || plasmaTypes[0]?.code || '',
          blood: f.blood || bloodTypes[0]?.code || '',
          zoneId: f.zoneId || zones[0]?.id || '',
          shelf: f.shelf || zones[0]?.shelves[0]?.code || '',
        }))
      })
      .catch((err: any) => {
        setToast({ type: 'error', msg: err?.message || 'โหลดข้อมูลหลักไม่สำเร็จ' })
      })
  }, [loadMaster])

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  // ── เลขกล่องถัดไป (แสดงตัวอย่างเท่านั้น เลขจริง backend ออกตอนบันทึก) ──
  const refreshNextLabel = useCallback(async (type: string, blood: string) => {
    if (!type || !blood) { setNextLabel(''); return }
    try {
      const res = await storageService.getNextLabel(type, blood)
      setNextLabel(res.label)
    } catch {
      setNextLabel('')
    }
  }, [])

  useEffect(() => { refreshNextLabel(form.type, form.blood) }, [form.type, form.blood, refreshNextLabel])

  // ── Shelves ของสถานที่ที่เลือก ──
  const availableShelves = useMemo(
    () => master.zones.find((z) => z.id === form.zoneId)?.shelves ?? [],
    [master.zones, form.zoneId],
  )

  // ── Form handlers ──
  const handleFormChange = (field: keyof StorageFormData, value: string) => {
    setForm((f) => {
      const updated = { ...f, [field]: value }
      if (field === 'zoneId') {
        const zone = master.zones.find((z) => z.id === value)
        updated.shelf = zone?.shelves[0]?.code || ''
      }
      return updated
    })
  }

  // ── เพิ่มชนิด/หมู่เลือด/สถานที่/ชั้นวางใหม่ทันทีหน้างาน แล้วเลือกให้เลย ──
  const handleQuickAdd = async (kind: QuickAddKind, value: string): Promise<boolean> => {
    const v = value.trim()
    if (!v) return false

    try {
      let patch: Partial<StorageFormData>
      let msg: string

      if (kind === 'type') {
        const created = await storageService.createPlasmaType(v)
        patch = { type: created.code }
        msg = `เพิ่มชนิด "${created.code}" สำเร็จ`
      } else if (kind === 'blood') {
        const created = await storageService.createBloodType(v)
        patch = { blood: created.code }
        msg = `เพิ่มหมู่เลือด "${created.code}" สำเร็จ`
      } else if (kind === 'zone') {
        const created = await storageService.createZone(v)
        // สถานที่ใหม่ยังไม่มีชั้นวาง → เคลียร์ชั้นไว้ให้เพิ่มต่อ
        patch = { zoneId: created.id, shelf: '' }
        msg = `เพิ่มสถานที่ "${created.name}" สำเร็จ — เพิ่มชั้นวางต่อได้เลย`
      } else {
        if (!form.zoneId) {
          setToast({ type: 'error', msg: 'กรุณาเลือกสถานที่ก่อนเพิ่มชั้นวาง' })
          return false
        }
        const created = await storageService.createShelf(form.zoneId, v)
        patch = { shelf: created.code }
        msg = `เพิ่มชั้น "${created.code}" สำเร็จ`
      }

      await loadMaster()
      setForm((f) => ({ ...f, ...patch }))
      setToast({ type: 'success', msg })
      return true
    } catch (err: any) {
      setToast({ type: 'error', msg: err?.message || 'เกิดข้อผิดพลาด' })
      return false
    }
  }

  // ── Unit scanning ──
  const handleAddUnit = () => {
    const trimmed = unitInput.trim().toUpperCase()
    if (!trimmed) return

    const newUnits = trimmed.split(/[,\s\n]+/).map((u) => u.trim()).filter(Boolean)
    const dupes: string[] = []
    const added: string[] = []

    for (const u of newUnits) {
      if (scannedUnits.includes(u) || added.includes(u)) dupes.push(u)
      else added.push(u)
    }

    if (added.length > 0) setScannedUnits((prev) => [...prev, ...added])
    if (dupes.length > 0) setToast({ type: 'error', msg: `Unit ซ้ำ: ${dupes.join(', ')}` })
    setUnitInput('')
  }

  const handleUnitKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddUnit()
    }
  }

  const handleRemoveUnit = (unit: string) => {
    setScannedUnits((prev) => prev.filter((u) => u !== unit))
  }

  // ── Submit + auto print ──
  const handleSubmit = async () => {
    if (scannedUnits.length === 0) {
      setToast({ type: 'error', msg: 'กรุณาเพิ่ม Unit อย่างน้อย 1 รายการ' })
      return
    }
    if (!form.type || !form.blood || !form.zoneId || !form.shelf) {
      setToast({ type: 'error', msg: 'กรุณาเลือกชนิด หมู่เลือด สถานที่ และชั้นวางให้ครบ' })
      return
    }

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
      })

      const zoneName = master.zones.find((z) => z.id === form.zoneId)?.name ?? created.zoneName ?? ''

      setToast({ type: 'success', msg: `บันทึกกล่อง ${created.boxLabel} สำเร็จ (${scannedUnits.length} units)` })

      // ใช้เลขที่ backend ออกให้จริง
      setPrintData({
        boxLabel: created.boxLabel,
        type: created.type,
        blood: created.blood,
        location: zoneName,
        shelf: created.shelf,
        collectionDate: created.collectionDate,
        unitCount: scannedUnits.length,
      })

      setScannedUnits([])
      setUnitInput('')
      setForm((f) => ({ ...f, boxName: '' }))
      loadBoxes()
      refreshNextLabel(form.type, form.blood)
    } catch (err: any) {
      setToast({ type: 'error', msg: err?.message || 'เกิดข้อผิดพลาด' })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Print existing box ──
  const handlePrintBox = (box: StorageBoxItem) => {
    setPrintData({
      boxLabel: box.boxLabel,
      type: box.type,
      blood: box.blood,
      location: box.zoneName || String(box.location),
      shelf: box.shelf,
      collectionDate: box.collectionDate,
      unitCount: box.units.length,
    })
  }

  const closePrint = () => setPrintData(null)
  const dismissToast = () => setToast(null)

  return {
    boxes, loading, form, master, scannedUnits, unitInput, submitting, toast,
    availableShelves, nextLabel, printData,
    handleFormChange, handleQuickAdd, setUnitInput, handleAddUnit, handleUnitKeyDown,
    handleRemoveUnit, handleSubmit, handlePrintBox, closePrint, dismissToast,
  }
}