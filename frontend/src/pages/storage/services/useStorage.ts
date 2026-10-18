// ============================================================
//  src/pages/storage/services/useStorage.ts
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import storageService from './StorageService'
import type {
  StorageBoxItem,
  StorageFormData,
  ToastState,
} from './StorageType'
import { SHELVES_ROOM, SHELVES_CABINET } from './StorageType'

const DEFAULT_FORM: StorageFormData = {
  type: 'FFP',
  blood: 'A',
  collectionDate: new Date().toISOString().split('T')[0],
  location: 'room',
  shelf: 'M1',
}

export default function useStorage() {
  const [boxes, setBoxes] = useState<StorageBoxItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<StorageFormData>(DEFAULT_FORM)
  const [scannedUnits, setScannedUnits] = useState<string[]>([])
  const [unitInput, setUnitInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  // ── Load boxes ──
  const loadBoxes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await storageService.getStoredBoxes()
      setBoxes(data)
    } catch {
      setBoxes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadBoxes() }, [loadBoxes])

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  // ── Auto-generate box label ──
  const generateBoxLabel = useCallback(() => {
    const prefix = `${form.type}-${form.blood}-`
    const existing = boxes
      .filter((b) => b.boxLabel.startsWith(prefix))
      .map((b) => {
        const num = parseInt(b.boxLabel.replace(prefix, ''), 10)
        return isNaN(num) ? 0 : num
      })
    const next = existing.length > 0 ? Math.max(...existing) + 1 : 1
    return `${prefix}${String(next).padStart(4, '0')}`
  }, [boxes, form.type, form.blood])

  // ── Available shelves ──
  const availableShelves = form.location === 'room' ? SHELVES_ROOM : SHELVES_CABINET

  // ── Form handlers ──
  const handleFormChange = (field: keyof StorageFormData, value: string) => {
    setForm((f) => {
      const updated = { ...f, [field]: value }
      // Reset shelf when location changes
      if (field === 'location') {
        const shelves = value === 'room' ? SHELVES_ROOM : SHELVES_CABINET
        updated.shelf = shelves[0]
      }
      return updated
    })
  }

  // ── Unit scanning ──
  const handleAddUnit = () => {
    const trimmed = unitInput.trim().toUpperCase()
    if (!trimmed) return

    // Split by comma, space, or newline
    const newUnits = trimmed
      .split(/[,\s\n]+/)
      .map((u) => u.trim())
      .filter(Boolean)

    const dupes: string[] = []
    const added: string[] = []

    for (const u of newUnits) {
      if (scannedUnits.includes(u)) {
        dupes.push(u)
      } else {
        added.push(u)
      }
    }

    if (added.length > 0) {
      setScannedUnits((prev) => [...prev, ...added])
    }
    if (dupes.length > 0) {
      setToast({ type: 'error', msg: `Unit ซ้ำ: ${dupes.join(', ')}` })
    }

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

  // ── Submit ──
  const handleSubmit = async () => {
    if (scannedUnits.length === 0) {
      setToast({ type: 'error', msg: 'กรุณาเพิ่ม Unit อย่างน้อย 1 รายการ' })
      return
    }

    const boxLabel = generateBoxLabel()

    setSubmitting(true)
    try {
      await storageService.createBox({
        boxLabel,
        type: form.type,
        blood: form.blood,
        location: form.location.toUpperCase(),
        shelf: form.shelf,
        collectionDate: form.collectionDate,
        units: scannedUnits,
      })
      setToast({ type: 'success', msg: `บันทึกกล่อง ${boxLabel} สำเร็จ (${scannedUnits.length} units)` })
      setScannedUnits([])
      setUnitInput('')
      loadBoxes()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'เกิดข้อผิดพลาด'
      setToast({ type: 'error', msg })
    } finally {
      setSubmitting(false)
    }
  }

  const dismissToast = () => setToast(null)

  return {
    // data
    boxes,
    loading,
    form,
    scannedUnits,
    unitInput,
    submitting,
    toast,
    availableShelves,
    boxLabel: generateBoxLabel(),
    // actions
    handleFormChange,
    setUnitInput,
    handleAddUnit,
    handleUnitKeyDown,
    handleRemoveUnit,
    handleSubmit,
    dismissToast,
  }
}