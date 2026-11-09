// ============================================================
//  src/helpers/useNotificationCount.ts
//  Polling hook — ดึงจำนวนเอกสารที่รอฉันอนุมัติ ทุก 60 วินาที
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react'
import apiAdapter from './http/apiAdapter'
import { EXT_COMMITTEE } from './url_helper'

const POLL_INTERVAL = 60_000 // 60 วินาที

interface ExtCounts {
  mine: number
  byStatus: Record<string, number>
}

export default function useNotificationCount() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetch = useCallback(async () => {
    try {
      const res = await apiAdapter.get<ExtCounts>(`${EXT_COMMITTEE}/counts`)
      setCount(res.mine)
    } catch {
      // session หมดอายุหรือ network error → ไม่แสดง badge
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    timerRef.current = setInterval(fetch, POLL_INTERVAL)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fetch])

  // หยุด poll เมื่อ tab ไม่ active, กลับมา poll ทันที
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current)
      } else {
        fetch()
        timerRef.current = setInterval(fetch, POLL_INTERVAL)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [fetch])

  return { count, loading, refetch: fetch }
}
