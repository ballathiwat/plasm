// ============================================================
//  src/components/layout/NotificationBell.tsx
//  🔔 รวม สต็อกต่ำ (ราย ชนิดเลือด × หมู่เลือด) + เอกสารรออนุมัติ
// ============================================================

import { Fragment, useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Clock, Check, CheckCircle, ChevronRight } from 'lucide-react'
import apiAdapter from '../../helpers/http/apiAdapter'
import { EXT_COMMITTEE } from '../../helpers/url_helper'
import {
  MIN_STATUS, alertDetail, cellKey, dashboardCellPath, groupStockAlerts,
  type MinStockStatusItem,
} from '../../helpers/minStock'
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

// ── Helpers ──

function relativeTime(iso?: string | null): string {
  if (!iso) return ''
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (mins < 1) return 'เมื่อสักครู่'
  if (mins < 60) return `${mins} นาทีที่แล้ว`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} ชม.ที่แล้ว`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} วันที่แล้ว`
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}

// ── Props ──

interface Props {
  totalCount: number
  approvalCount: number
  /** คู่ ชนิด × หมู่ ที่ ต่ำกว่าขั้นต่ำ / ใกล้ต่ำ (จาก useMinStockStatus — ชุดเดียวกับแดชบอร์ด) */
  stockAlerts: MinStockStatusItem[]
  onNavigate?: (key: string) => void
  /** กด "รับทราบ" การแจ้งเตือนสต็อก */
  onAcknowledge?: (n: MinStockStatusItem) => Promise<void> | void
  userId: string
}

export default function NotificationBell({ totalCount, approvalCount, stockAlerts, onNavigate, onAcknowledge, userId }: Props) {
  const navigate = useNavigate()
  const [acking, setAcking] = useState<string[]>([])
  const stockGroups = useMemo(() => groupStockAlerts(stockAlerts), [stockAlerts])
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<InboxDoc[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // ── Fetch inbox เมื่อเปิด dropdown ──
  const fetchInbox = useCallback(async () => {
    if (approvalCount === 0) { setItems([]); return }
    setLoading(true)
    try {
      const res = await apiAdapter.get<InboxResponse>(`${EXT_COMMITTEE}/inbox`, { page: 1, limit: 5 })
      setItems(res.data)
    } catch { setItems([]) }
    finally { setLoading(false) }
  }, [approvalCount])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) fetchInbox()
  }

  // ── Close on outside click / Escape ──
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const myRole = (doc: InboxDoc): string => {
    const m = doc.committee?.find((c) => c.userId === userId && c.status === 'PENDING')
    return m ? ROLE_LABEL[m.role] || m.role : 'รออนุมัติ'
  }

  const goInbox = () => { setOpen(false); onNavigate?.('ext-blood-list') }
  const goDashboard = () => { setOpen(false); onNavigate?.('dashboard') }
  // คลิกรายการสต็อก → แดชบอร์ด พร้อมไฮไลต์ช่องของคู่นั้น
  const goCell = (a: MinStockStatusItem) => { setOpen(false); navigate(dashboardCellPath(a.type, a.group)) }
  const acknowledge = async (a: MinStockStatusItem) => {
    const key = cellKey(a.type, a.group)
    setAcking((xs) => [...xs, key])
    try { await onAcknowledge?.(a) } finally { setAcking((xs) => xs.filter((x) => x !== key)) }
  }
  const displayCount = totalCount > 99 ? '99+' : String(totalCount)

  const hasStock = stockAlerts.length > 0
  const hasApproval = approvalCount > 0

  return (
    <div ref={ref} className="plasm-noti">
      <button
        className="plasm-noti__btn"
        aria-label={`การแจ้งเตือน${totalCount > 0 ? ` ${totalCount} รายการ` : ''}`}
        aria-expanded={open}
        onClick={toggle}
      >
        <Bell size={20} />
        {totalCount > 0 && <span className="plasm-noti__badge">{displayCount}</span>}
      </button>

      {open && (
        <div className="plasm-noti__panel">
          {/* Header */}
          <div className="plasm-noti__header">
            <h3 className="plasm-noti__title">การแจ้งเตือน</h3>
            {totalCount > 0 && <span className="plasm-noti__count-badge">{displayCount}</span>}
          </div>

          <div className="plasm-noti__list">
            {/* ═══ Section: สต็อก — 1 รายการต่อคู่ ชนิด × หมู่ จัดกลุ่มตามชนิดเลือด ═══ */}
            {stockGroups.map((g) => (
              <Fragment key={g.type}>
                <div className="plasm-noti__section plasm-noti__section--stock">สต็อก {g.type} ({g.items.length})</div>
                {g.items.map((a) => {
                  const key = cellKey(a.type, a.group)
                  const { icon: Icon, label } = MIN_STATUS[a.status]
                  return (
                    // root ไม่ใช่ปุ่ม — เนื้อหาและ "รับทราบ" เป็นปุ่มแยกกัน (ไม่ซ้อน button ใน button)
                    <div key={key} role="none" className={`plasm-noti__item plasm-noti__item--split${a.acknowledged ? ' is-read' : ''}`}>
                      <button type="button" className="plasm-noti__item-main" onClick={() => goCell(a)}>
                        <span className={`plasm-noti__item-icon plasm-noti__item-icon--${a.status}`}>
                          <Icon size={16} aria-hidden="true" />
                        </span>
                        <span className="plasm-noti__item-body">
                          <span className={`plasm-noti__stock-tag plasm-noti__stock-tag--${a.status}`}>
                            <Icon size={11} aria-hidden="true" />{label}
                          </span>
                          <span className="plasm-noti__item-title">{a.type} หมู่ {a.group}</span>
                          <span className="plasm-noti__item-desc plasm-noti__item-desc--wrap">{alertDetail(a)}</span>
                          <span className="plasm-noti__item-meta">
                            <span className="plasm-noti__time">
                              {relativeTime(a.since)}{a.acknowledged && ' · รับทราบแล้ว'}
                            </span>
                          </span>
                        </span>
                      </button>
                      {!a.acknowledged && a.notificationId && onAcknowledge && (
                        <button
                          type="button"
                          className="plasm-noti__ack"
                          disabled={acking.includes(key)}
                          aria-label={`รับทราบ ${a.type} หมู่ ${a.group}`}
                          onClick={() => acknowledge(a)}
                        >
                          <Check size={13} aria-hidden="true" />รับทราบ
                        </button>
                      )}
                    </div>
                  )
                })}
              </Fragment>
            ))}

            {/* ═══ Section: รออนุมัติ ═══ */}
            {hasApproval && (
              <>
                <div className="plasm-noti__section">รออนุมัติ ({approvalCount})</div>
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="plasm-noti__skeleton">
                      <div className="plasm-noti__skeleton-circle" />
                      <div className="plasm-noti__skeleton-lines">
                        <div className="plasm-noti__skeleton-line" />
                        <div className="plasm-noti__skeleton-line plasm-noti__skeleton-line--short" />
                      </div>
                    </div>
                  ))
                ) : (
                  items.map((doc) => (
                    <div key={doc.id} className="plasm-noti__item" onClick={goInbox} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') goInbox() }}>
                      <div className="plasm-noti__item-icon plasm-noti__item-icon--approval">
                        <Clock size={16} />
                      </div>
                      <div className="plasm-noti__item-body">
                        <p className="plasm-noti__item-title">
                          {doc.docNumber} · {doc.bloodProduct.code} {doc.bloodGroup}
                        </p>
                        <p className="plasm-noti__item-desc">{doc.source.name}</p>
                        <div className="plasm-noti__item-meta">
                          <span className="plasm-noti__role-tag">{myRole(doc)}</span>
                          <span className="plasm-noti__time">{relativeTime(doc.submittedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {!loading && approvalCount > 5 && (
                  <div className="plasm-noti__footer" style={{ borderTop: 'none' }}>
                    <button className="plasm-noti__footer-btn" onClick={goInbox}>
                      ดูทั้งหมด {approvalCount} รายการ <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ═══ Empty ═══ */}
            {!hasStock && !hasApproval && (
              <div className="plasm-noti__empty">
                <div className="plasm-noti__empty-icon"><CheckCircle size={20} /></div>
                <span className="plasm-noti__empty-text">ไม่มีการแจ้งเตือน</span>
              </div>
            )}
          </div>

          {/* Footer — ดู dashboard เมื่อมีสต็อกเตือน */}
          {hasStock && !hasApproval && (
            <div className="plasm-noti__footer">
              <button className="plasm-noti__footer-btn" onClick={goDashboard}>
                ดูแดชบอร์ด <ChevronRight size={14} />
              </button>
            </div>
          )}
          {hasApproval && approvalCount <= 5 && (
            <div className="plasm-noti__footer">
              <button className="plasm-noti__footer-btn" onClick={goInbox}>
                ดูรายการรออนุมัติ <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
