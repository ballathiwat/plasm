// ============================================================
//  src/components/layout/NotificationBell.tsx
//  🔔 Notification bell — แสดงเอกสารที่รอฉันอนุมัติ
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react'
import { Bell, Clock, CheckCircle, ChevronRight, Loader2 } from 'lucide-react'
import apiAdapter from '../../helpers/http/apiAdapter'
import { EXT_COMMITTEE } from '../../helpers/url_helper'
import '../../assets/styles/components/notification-bell.css'

// ── Types ──

interface ExtCommitteeMember {
  role: 'VERIFIER' | 'STORER' | 'APPROVER'
  status: string
  userId: string
}

interface InboxDoc {
  id: string
  docNumber: string
  bloodProduct: { code: string }
  bloodGroup: string
  source: { name: string }
  submittedAt?: string | null
  committee?: ExtCommitteeMember[]
}

interface InboxResponse {
  data: InboxDoc[]
  total: number
}

const ROLE_LABEL: Record<string, string> = {
  VERIFIER: 'ผู้ตรวจ',
  STORER: 'ผู้จัดเก็บ',
  APPROVER: 'ผู้อนุมัติ',
}

// ── Relative time helper ──

function relativeTime(iso?: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'เมื่อสักครู่'
  if (mins < 60) return `${mins} นาทีที่แล้ว`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} วันที่แล้ว`
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}

// ── Component ──

interface Props {
  count: number
  onNavigate?: (key: string) => void
  userId: string
}

export default function NotificationBell({ count, onNavigate, userId }: Props) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<InboxDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // ── Fetch inbox เมื่อเปิด dropdown ──
  const fetchInbox = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiAdapter.get<InboxResponse>(
        `${EXT_COMMITTEE}/inbox`,
        { page: 1, limit: 5 },
      )
      setItems(res.data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
      setFetched(true)
    }
  }, [])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next && !fetched) fetchInbox()
    if (next && fetched) fetchInbox() // refresh ทุกครั้งที่เปิด
  }

  // ── Close on outside click / Escape ──
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // ── หาบทบาทของฉันในเอกสาร ──
  const myRole = (doc: InboxDoc): string => {
    const m = doc.committee?.find((c) => c.userId === userId && c.status === 'PENDING')
    return m ? ROLE_LABEL[m.role] || m.role : 'รออนุมัติ'
  }

  // ── Navigate → ext-blood แท็บ MINE ──
  const goToInbox = () => {
    setOpen(false)
    onNavigate?.('ext-blood-list')
  }

  const displayCount = count > 99 ? '99+' : String(count)

  return (
    <div ref={ref} className="plasm-noti">
      {/* Bell button */}
      <button
        className="plasm-noti__btn"
        aria-label={`การแจ้งเตือน${count > 0 ? ` ${count} รายการ` : ''}`}
        aria-expanded={open}
        onClick={toggle}
      >
        <Bell size={20} />
        {count > 0 && (
          <span className="plasm-noti__badge">{displayCount}</span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="plasm-noti__panel">
          {/* Header */}
          <div className="plasm-noti__header">
            <h3 className="plasm-noti__title">การแจ้งเตือน</h3>
            {count > 0 && (
              <span className="plasm-noti__count-badge">{displayCount}</span>
            )}
          </div>

          {/* List */}
          <div className="plasm-noti__list">
            {loading && !fetched ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="plasm-noti__skeleton">
                    <div className="plasm-noti__skeleton-circle" />
                    <div className="plasm-noti__skeleton-lines">
                      <div className="plasm-noti__skeleton-line" />
                      <div className="plasm-noti__skeleton-line plasm-noti__skeleton-line--short" />
                    </div>
                  </div>
                ))}
              </>
            ) : items.length > 0 ? (
              items.map((doc) => (
                <div
                  key={doc.id}
                  className="plasm-noti__item"
                  onClick={goToInbox}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') goToInbox() }}
                >
                  <div className="plasm-noti__item-icon">
                    <Clock size={16} />
                  </div>
                  <div className="plasm-noti__item-body">
                    <p className="plasm-noti__item-title">
                      {doc.docNumber} · {doc.bloodProduct.code} {doc.bloodGroup}
                    </p>
                    <p className="plasm-noti__item-desc">
                      {doc.source.name}
                    </p>
                    <div className="plasm-noti__item-meta">
                      <span className="plasm-noti__role-tag">{myRole(doc)}</span>
                      <span className="plasm-noti__time">{relativeTime(doc.submittedAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="plasm-noti__empty">
                <div className="plasm-noti__empty-icon">
                  <CheckCircle size={20} />
                </div>
                <span className="plasm-noti__empty-text">ไม่มีรายการรออนุมัติ</span>
              </div>
            )}

            {/* Loading indicator เมื่อ refresh */}
            {loading && fetched && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
                <Loader2 size={16} className="ext-spin" color="var(--primary)" />
              </div>
            )}
          </div>

          {/* Footer */}
          {count > 0 && (
            <div className="plasm-noti__footer">
              <button className="plasm-noti__footer-btn" onClick={goToInbox}>
                ดูทั้งหมด <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
