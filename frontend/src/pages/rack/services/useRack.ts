// ============================================================
//  src/pages/rack/services/useRack.ts
//  โหลด rack + master data, sync ?level=&slot= กับ URL, จัดการ slot lock
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import rackService from './RackService'
import { SLOT_LOCKS } from '../../../helpers/url_helper'
import { ROOM_LEGACY_KEY, RACK_LEVELS, RACK_POSITIONS } from '../../../helpers/rack'
import type {
  ApiError, MasterOption, RackData, RackZone, RemovalReason, SlotRef,
} from './RackType'

const HEARTBEAT_MS = 20_000

const clampInt = (v: string | null, min: number, max: number): number | null => {
  const n = Number(v)
  return Number.isInteger(n) && n >= min && n <= max ? n : null
}

export default function useRack(code: string) {
  const [params, setParams] = useSearchParams()
  const level = clampInt(params.get('level'), 1, RACK_LEVELS) ?? 1
  const slot = clampInt(params.get('slot'), 1, RACK_POSITIONS)

  const [zone, setZone] = useState<RackZone | null>(null)
  const [rackCodes, setRackCodes] = useState<string[]>([])
  const [plasmaTypes, setPlasmaTypes] = useState<string[]>([])
  const [bloodTypes, setBloodTypes] = useState<string[]>([])
  const [reasons, setReasons] = useState<RemovalReason[]>([])
  const [rack, setRack] = useState<RackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── master data (ครั้งเดียว) ──
  useEffect(() => {
    let alive = true
    Promise.all([
      rackService.listZones(),
      rackService.listPlasmaTypes(),
      rackService.listBloodTypes(),
      rackService.listRemovalReasons(),
    ])
      .then(([zones, pts, bts, rr]) => {
        if (!alive) return
        const room = zones.find((z) => z.legacyKey === ROOM_LEGACY_KEY) ?? null
        setZone(room)
        setRackCodes(room ? room.shelves.filter((s) => s.active).map((s) => s.code) : [])
        const act = (xs: MasterOption[]) => xs.filter((x) => x.active).map((x) => x.code)
        setPlasmaTypes(act(pts))
        setBloodTypes(act(bts))
        setReasons(rr.filter((r) => r.active))
        if (!room) {
          setError('ไม่พบห้อง -30°C ในข้อมูลสถานที่')
          setLoading(false)
        }
      })
      .catch((e: ApiError) => {
        if (!alive) return
        setError(e?.message || 'โหลดข้อมูลหลักไม่สำเร็จ')
        setLoading(false)
      })
    return () => { alive = false }
  }, [])

  // ── rack data ──
  const refetch = useCallback(async () => {
    if (!zone) return
    try {
      const data = await rackService.getRack(zone.id, code)
      setRack(data)
      setError(null)
    } catch (e) {
      setError((e as ApiError)?.message || 'โหลดข้อมูล rack ไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [zone, code])

  useEffect(() => {
    setLoading(true)
    setRack(null)
    refetch()
  }, [refetch])

  // ── URL state ──
  const select = useCallback(
    (next: { level?: number; slot?: number | null }) => {
      setParams(
        (prev) => {
          const q = new URLSearchParams(prev)
          if (next.level !== undefined) q.set('level', String(next.level))
          if (next.slot === null) q.delete('slot')
          else if (next.slot !== undefined) q.set('slot', String(next.slot))
          return q
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const currentLevel = useMemo(
    () => rack?.levels.find((l) => l.level === level) ?? null,
    [rack, level],
  )

  // ── locks ──
  const lockRef = useRef<{ id: string; slot: SlotRef } | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [myLockId, setMyLockId] = useState<string | null>(null)

  /** ชื่อคนอื่นที่ถือ lock ช่องนี้ (ไม่นับ lock ของเราเอง) */
  const lockOf = useCallback(
    (lv: number, pos: number): string | null => {
      const l = rack?.locks.find((x) => x.level === lv && x.position === pos)
      if (!l || l.id === myLockId) return null
      return l.userName
    },
    [rack, myLockId],
  )

  const stopHeartbeat = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }

  const release = useCallback(async () => {
    stopHeartbeat()
    const cur = lockRef.current
    lockRef.current = null
    setMyLockId(null)
    if (cur) await rackService.releaseLock(cur.id).catch(() => {})
  }, [])

  /** ขอ lock ช่อง (throws ApiError 409 ถ้าคนอื่นถืออยู่) */
  const acquire = useCallback(
    async (s: SlotRef) => {
      if (!zone) return
      const cur = lockRef.current
      if (cur && cur.slot.level === s.level && cur.slot.position === s.position) return
      if (cur) await release()
      const res = await rackService.acquireLock({ zoneId: zone.id, shelf: code, ...s })
      lockRef.current = { id: res.id, slot: s }
      setMyLockId(res.id)
      stopHeartbeat()
      timerRef.current = setInterval(() => {
        const l = lockRef.current
        if (l) rackService.heartbeatLock(l.id).catch(() => {})
      }, HEARTBEAT_MS)
    },
    [zone, code, release],
  )

  // ปล่อย lock เมื่อเปลี่ยน rack / ออกจากหน้า
  useEffect(() => () => { void release() }, [code, release])

  // ปิดแท็บ → ปล่อย lock แบบ best effort
  useEffect(() => {
    const onUnload = () => {
      const l = lockRef.current
      if (l) navigator.sendBeacon?.(`${import.meta.env.VITE_API_URL || ''}${SLOT_LOCKS}/${l.id}/release`)
    }
    window.addEventListener('pagehide', onUnload)
    return () => window.removeEventListener('pagehide', onUnload)
  }, [])

  return {
    zone, rackCodes, plasmaTypes, bloodTypes, reasons,
    rack, currentLevel, loading, error, refetch,
    level, slot, select,
    lockOf, acquire, release,
  }
}
