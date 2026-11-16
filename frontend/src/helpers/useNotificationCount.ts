// ============================================================
//  src/helpers/useNotificationCount.ts
//  Polling hook — เอกสารรออนุมัติ
//  Poll ทุก 60s, หยุดเมื่อ tab ไม่ active
//  (การแจ้งเตือนสต็อกต่ำย้ายไป useMinStockStatus.ts — ราย ชนิด × หมู่ ใช้ cache เดียวกับแดชบอร์ด)
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react'
import apiAdapter from './http/apiAdapter'
import { EXT_COMMITTEE } from './url_helper'

const POLL_INTERVAL = 60_000

// ── Types ──

interface ExtCounts {
  mine: number
  byStatus: Record<string, number>
}

export interface NotificationData {
  approvalCount: number
  loading: boolean
}

// ── Hook ──

export default function useNotificationCount(): NotificationData & { refetch: () => void } {
  const [approvalCount, setApprovalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      const ext = await apiAdapter.get<ExtCounts>(`${EXT_COMMITTEE}/counts`)
      setApprovalCount(ext.mine)
    } catch {
      // network error → ไม่ update
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    timerRef.current = setInterval(fetchAll, POLL_INTERVAL)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [fetchAll])

  // หยุด poll เมื่อ tab ไม่ active
  useEffect(() => {
    const onVis = () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
      if (!document.hidden) {
        fetchAll()
        timerRef.current = setInterval(fetchAll, POLL_INTERVAL)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [fetchAll])

  return { approvalCount, loading, refetch: fetchAll }
}
