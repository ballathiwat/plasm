// frontend/src/helpers/useNotifications.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import apiAdapter from './http/apiAdapter'
import { NOTIFICATIONS, NOTIFICATIONS_READ } from './url_helper'

export type NotificationKind = 'approve' | 'rejected' | 'approved' | 'lowstock' | 'info'
export interface NotificationItem {
  id: string
  kind: NotificationKind
  group: 'action' | 'info'
  title: string
  detail?: string
  at: string
  read: boolean
  target?: { path: string; docId?: string }
}

const POLL_MS = 30_000

/** เรียก window.dispatchEvent(new Event('plasm:noti-refresh')) หลังอนุมัติ/ส่งเอกสาร เพื่ออัปเดตทันที */
export default function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const location = useLocation()
  const busy = useRef(false)

  const load = useCallback(async () => {
    if (busy.current || document.hidden) return
    busy.current = true
    try { setItems((await apiAdapter.get<{ items: NotificationItem[] }>(NOTIFICATIONS)).items) } catch { /* เงียบไว้ — ไม่ให้ TopBar พัง */ }
    finally { busy.current = false }
  }, [])

  useEffect(() => { load() }, [load, location.pathname])
  useEffect(() => {
    const t = window.setInterval(load, POLL_MS)
    const on = () => load()
    window.addEventListener('focus', on); window.addEventListener('plasm:noti-refresh', on)
    return () => { window.clearInterval(t); window.removeEventListener('focus', on); window.removeEventListener('plasm:noti-refresh', on) }
  }, [load])

  const markRead = useCallback(async (ids?: string[]) => {
    setItems((xs) => xs.map((n) => (n.group === 'info' && (!ids || ids.includes(n.id)) ? { ...n, read: true } : n)))
    try { await apiAdapter.post(NOTIFICATIONS_READ, ids ? { ids } : {}) } catch { load() }
  }, [load])

  return { items, markRead, reload: load }
}
