// frontend/src/pages/settings/services/useMinStockSettings.ts
// state + logic ของ ตั้งค่า › สต็อกขั้นต่ำ (ราย ชนิดเลือด × หมู่เลือด)
// ค่าในฟอร์มเก็บเป็น string ดิบ เพื่อแสดงข้อความผิดพลาดใต้ช่องได้ (เช่น "2.5", "abc")

import { useCallback, useEffect, useMemo, useState } from 'react'
import minStockService, { type MinStockCell, type MinStockMeta } from '../../../helpers/services/minStockService'
import { refreshMinStockStatus } from '../../../helpers/useMinStockStatus'
import { cellKey, type MinStockType } from '../../../helpers/minStock'
import type { ToastState } from '../../../components/common/Toast'

export const MIN_STOCK_ERROR = 'ต้องเป็นจำนวนเต็ม 0 ขึ้นไป'
const MAX_MIN_UNITS = 1_000_000

/** ว่าง = ไม่ได้ตั้งค่า (null) · อื่นๆ ต้องเป็นจำนวนเต็ม ≥ 0 */
export const parseMinInput = (raw: string): { ok: true; value: number | null } | { ok: false } => {
  const s = raw.trim()
  if (s === '') return { ok: true, value: null }
  if (!/^\d+$/.test(s)) return { ok: false }
  const n = Number(s)
  return n <= MAX_MIN_UNITS ? { ok: true, value: n } : { ok: false }
}

export interface MinStockChange { type: string; group: string; from: number | null; to: number | null }

type Saved = Record<string, number | null>
type Draft = Record<string, string>

const toDraft = (saved: Saved): Draft =>
  Object.fromEntries(Object.entries(saved).map(([k, v]) => [k, v == null ? '' : String(v)]))

export default function useMinStockSettings(notify: (t: ToastState) => void) {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [types, setTypes] = useState<MinStockType[]>([])
  const [groups, setGroups] = useState<string[]>([])
  const [saved, setSaved] = useState<Saved>({})
  const [draft, setDraft] = useState<Draft>({})
  const [meta, setMeta] = useState<MinStockMeta>({ updatedBy: null, updatedAt: null })

  const apply = useCallback((res: { types: MinStockType[]; groups: string[]; items: MinStockCell[]; meta: MinStockMeta }) => {
    const next: Saved = {}
    for (const it of res.items) next[cellKey(it.type, it.group)] = it.minUnits
    setTypes(res.types)
    setGroups(res.groups)
    setSaved(next)
    setDraft(toDraft(next))
    setMeta(res.meta)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      apply(await minStockService.getMinStock())
      setLoadError(false)
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [apply])

  useEffect(() => { load() }, [load])

  // ── สถานะของแต่ละช่อง ──
  const isInvalid = useCallback((key: string) => !parseMinInput(draft[key] ?? '').ok, [draft])
  const isDirty = useCallback((key: string) => {
    const p = parseMinInput(draft[key] ?? '')
    return !p.ok || p.value !== (saved[key] ?? null)
  }, [draft, saved])

  const keys = useMemo(() => types.flatMap((t) => groups.map((g) => cellKey(t.code, g))), [types, groups])
  const dirtyCount = useMemo(() => keys.filter(isDirty).length, [keys, isDirty])
  const invalidCount = useMemo(() => keys.filter(isInvalid).length, [keys, isInvalid])
  /** ทุกช่องว่างจาก server → แสดง empty state */
  const serverEmpty = useMemo(() => keys.length > 0 && keys.every((k) => saved[k] == null), [keys, saved])

  const changes = useMemo<MinStockChange[]>(() => types.flatMap((t) => groups.flatMap((g) => {
    const key = cellKey(t.code, g)
    const p = parseMinInput(draft[key] ?? '')
    const from = saved[key] ?? null
    return p.ok && p.value !== from ? [{ type: t.code, group: g, from, to: p.value }] : []
  })), [types, groups, draft, saved])

  /** ผลรวมขั้นต่ำของแถว — null เมื่อว่างทั้งแถว (ช่องที่ค่าไม่ถูกต้องไม่นับ) */
  const rowTotal = useCallback((type: string): number | null => {
    let sum = 0
    let any = false
    for (const g of groups) {
      const p = parseMinInput(draft[cellKey(type, g)] ?? '')
      if (p.ok && p.value != null) { sum += p.value; any = true }
    }
    return any ? sum : null
  }, [groups, draft])

  // ── แก้ค่าในฟอร์ม (ยังไม่บันทึก) ──
  const setCell = useCallback((type: string, group: string, raw: string) => {
    setDraft((d) => ({ ...d, [cellKey(type, group)]: raw }))
  }, [])

  /** ใช้ค่าเดียวกันทุกหมู่ของชนิดนี้ */
  const fillRow = useCallback((type: string, raw: string) => {
    setDraft((d) => {
      const next = { ...d }
      for (const g of groups) next[cellKey(type, g)] = raw.trim()
      return next
    })
  }, [groups])

  /** คัดลอกค่าทุกหมู่จากชนิดอื่น */
  const copyRow = useCallback((from: string, to: string) => {
    setDraft((d) => {
      const next = { ...d }
      for (const g of groups) next[cellKey(to, g)] = d[cellKey(from, g)] ?? ''
      return next
    })
  }, [groups])

  const reset = useCallback(() => setDraft(toDraft(saved)), [saved])

  const save = useCallback(async (): Promise<boolean> => {
    if (invalidCount > 0 || changes.length === 0) return false
    setSaving(true)
    try {
      const res = await minStockService.saveMinStock(
        changes.map((c) => ({ type: c.type, group: c.group, minUnits: c.to })),
      )
      apply(res)
      // แดชบอร์ดและกระดิ่งใช้ cache เดียวกัน → คำนวณใหม่ทันทีโดยไม่ต้อง refresh หน้า
      await refreshMinStockStatus()
      notify({ type: 'success', msg: 'บันทึกค่าขั้นต่ำเรียบร้อย — สถานะสต็อกคำนวณใหม่แล้ว' })
      return true
    } catch (err) {
      // apiAdapter reject เป็น { message, status }
      const msg = (err as { message?: string } | null)?.message
      notify({ type: 'error', msg: msg || 'บันทึกไม่สำเร็จ — ลองใหม่อีกครั้ง' })
      return false
    } finally {
      setSaving(false)
    }
  }, [invalidCount, changes, apply, notify])

  return {
    loading, loadError, saving, types, groups, draft, saved, meta,
    dirtyCount, invalidCount, serverEmpty, changes,
    isDirty, isInvalid, rowTotal,
    setCell, fillRow, copyRow, reset, save, reload: load,
  }
}

export type MinStockSettings = ReturnType<typeof useMinStockSettings>
