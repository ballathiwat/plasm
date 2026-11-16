// frontend/src/helpers/useMinStockStatus.ts
// สถานะสต็อกเทียบขั้นต่ำ (GET /stock/min-stock/status) — cache เดียวทั้งแอป
// แดชบอร์ดและกระดิ่งแจ้งเตือนอ่านจาก store ตัวเดียวกัน จึงเห็นตัวเลขและสถานะตรงกันเสมอ
//   - refetch ทุก 60 วินาทีขณะมีคนใช้ hook (หยุดเมื่อแท็บถูกซ่อน, ดึงใหม่ทันทีเมื่อกลับมา)
//   - refreshMinStockStatus() เรียกหลังบันทึกค่าขั้นต่ำ / กดรับทราบ เพื่ออัปเดตทุกหน้าโดยไม่ต้อง refresh

import { useEffect, useSyncExternalStore } from 'react'
import minStockService from './services/minStockService'
import type { MinStockStatus } from './minStock'

const POLL_MS = 60_000

interface Snapshot { data: MinStockStatus | null; loading: boolean; error: boolean }

let snapshot: Snapshot = { data: null, loading: true, error: false }
const listeners = new Set<() => void>()
let users = 0
let timer: number | null = null
let inFlight: Promise<void> | null = null

const emit = (next: Snapshot) => { snapshot = next; listeners.forEach((l) => l()) }

/** ดึงสถานะล่าสุด — คำขอที่ซ้อนกันใช้ promise เดียว */
export function refreshMinStockStatus(): Promise<void> {
  if (inFlight) return inFlight
  inFlight = minStockService.getStatus()
    .then((data) => emit({ data, loading: false, error: false }))
    // ดึงไม่ได้ → คงข้อมูลเดิมไว้และตั้งธง error ให้หน้าที่ใช้แสดงผลเอง
    .catch(() => emit({ ...snapshot, loading: false, error: true }))
    .finally(() => { inFlight = null })
  return inFlight
}

const startTimer = () => { if (timer == null) timer = window.setInterval(refreshMinStockStatus, POLL_MS) }
const stopTimer = () => { if (timer != null) { window.clearInterval(timer); timer = null } }
const onVisibility = () => {
  if (document.hidden) stopTimer()
  else { refreshMinStockStatus(); startTimer() }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
const getSnapshot = () => snapshot

export default function useMinStockStatus() {
  const snap = useSyncExternalStore(subscribe, getSnapshot)

  useEffect(() => {
    users += 1
    if (users === 1) {
      refreshMinStockStatus()
      startTimer()
      document.addEventListener('visibilitychange', onVisibility)
    }
    return () => {
      users -= 1
      if (users === 0) {
        stopTimer()
        document.removeEventListener('visibilitychange', onVisibility)
      }
    }
  }, [])

  return { status: snap.data, loading: snap.loading, error: snap.error, refetch: refreshMinStockStatus }
}
