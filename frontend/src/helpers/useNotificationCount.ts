// ============================================================
//  src/helpers/useNotificationCount.ts
//  Polling hook — สต็อกต่ำกว่าขั้นต่ำ + เอกสารรออนุมัติ
//  Poll ทุก 60s, หยุดเมื่อ tab ไม่ active
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react'
import apiAdapter from './http/apiAdapter'
import { GET_STOCK_SUMMARY, EXT_COMMITTEE } from './url_helper'

const POLL_INTERVAL = 60_000

// ── Types ──

interface StockSummary {
  groups: string[]
  stocks: Record<string, number>
  minimum: Record<string, number>
}

interface ExtCounts {
  mine: number
  byStatus: Record<string, number>
}

export type StockLevel = 'danger' | 'warning'

export interface StockAlert {
  group: string
  current: number
  minimum: number
  level: StockLevel
}

export interface NotificationData {
  approvalCount: number
  stockAlerts: StockAlert[]
  totalCount: number
  loading: boolean
}

// ── Hook ──

export default function useNotificationCount(): NotificationData & { refetch: () => void } {
  const [approvalCount, setApprovalCount] = useState(0)
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      const [stock, ext] = await Promise.all([
        apiAdapter.get<StockSummary>(GET_STOCK_SUMMARY).catch(() => null),
        apiAdapter.get<ExtCounts>(`${EXT_COMMITTEE}/counts`).catch(() => null),
      ])

      // สต็อก: เอาเฉพาะ danger + warning
      if (stock) {
        const alerts: StockAlert[] = []
        for (const g of stock.groups) {
          const c = stock.stocks[g] || 0
          const m = stock.minimum[g]
          if (!m) continue
          if (c < m) alerts.push({ group: g, current: c, minimum: m, level: 'danger' })
          else if (c < m * 1.2) alerts.push({ group: g, current: c, minimum: m, level: 'warning' })
        }
        setStockAlerts(alerts)
      }

      // อนุมัติ
      if (ext) setApprovalCount(ext.mine)
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
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current)
      } else {
        fetchAll()
        timerRef.current = setInterval(fetchAll, POLL_INTERVAL)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [fetchAll])

  const totalCount = approvalCount + stockAlerts.length

  return { approvalCount, stockAlerts, totalCount, loading, refetch: fetchAll }
}
