// ============================================================
//  src/pages/dashboard/components/DashboardRecentActivity.tsx
// ============================================================

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, PackageOpen } from 'lucide-react'
import { groupSurface, groupInk } from '../../../helpers/blood'
import type { LogEntryItem } from '../services/DashboardType'

interface Props {
  entries: LogEntryItem[]
}

export default function DashboardRecentActivity({ entries }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [wide, setWide] = useState(true)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setWide(entry.contentRect.width >= 640)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={cardRef}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg, 10px)',
        boxShadow: 'var(--shadow-sm)',
        padding: 20,
      }}
    >
      {/* Card header */}
      <div className="activity__card-header">
        <h3 className="activity__title" style={{ marginBottom: 0 }}>รายการล่าสุด</h3>
        <Link to="/log" className="activity__link">ดูประวัติทั้งหมด ›</Link>
      </div>

      {entries.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <p className="activity__empty-main">ยังไม่มีการจัดเก็บหรือนำออก</p>
          <p className="activity__empty-sub">เริ่มจากกด &quot;จัดเก็บกล่องใหม่&quot; ด้านบน</p>
        </div>
      ) : wide ? (
        <DesktopTable entries={entries} />
      ) : (
        <MobileList entries={entries} />
      )}
    </div>
  )
}

// ── Desktop: grid table ──

function DesktopTable({ entries }: { entries: LogEntryItem[] }) {
  return (
    <>
      <div className="activity__header">
        <span>เวลา</span>
        <span>การดำเนินการ</span>
        <span>กล่อง</span>
        <span>หมู่เลือด</span>
        <span>จำนวน</span>
        <span>รายละเอียด</span>
      </div>
      {entries.slice(0, 10).map((entry) => {
        const isStore = entry.action === 'store'
        const ts = new Date(entry.timestamp)
        const timeStr =
          ts.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) +
          ' ' +
          ts.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

        return (
          <div key={entry.id} className="activity__row">
            <span className="activity__time">{timeStr}</span>
            <span className={`activity__action activity__action--${isStore ? 'store' : 'withdraw'}`}>
              {isStore ? <Package size={13} /> : <PackageOpen size={13} />}
              {isStore ? 'จัดเก็บ' : 'นำออก'}
            </span>
            <span className="activity__box-label">{entry.boxLabel}</span>
            <span
              className="activity__blood-badge"
              style={{
                background: groupSurface(entry.blood) || '#f0f0f0',
                color: groupInk(entry.blood) || '#666',
              }}
            >
              {entry.blood}
            </span>
            <span className="activity__units">{entry.unitCount ?? 0}</span>
            <span className="activity__detail" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
              {entry.detail}
            </span>
          </div>
        )
      })}
    </>
  )
}

// ── Mobile: stacked list ──

function MobileList({ entries }: { entries: LogEntryItem[] }) {
  return (
    <ul className="activity__list">
      {entries.slice(0, 10).map((entry) => {
        const isStore = entry.action === 'store'
        const ts = new Date(entry.timestamp)
        const dateStr =
          ts.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) +
          ' ' +
          ts.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

        return (
          <li key={entry.id} className="activity__list-item">
            <span className={`activity__list-icon activity__list-icon--${isStore ? 'store' : 'withdraw'}`}>
              {isStore ? <Package size={16} /> : <PackageOpen size={16} />}
            </span>
            <div className="activity__list-body">
              <div className="activity__list-row1">
                <span className="activity__list-box">{entry.boxLabel}</span>
                <span
                  className="activity__blood-badge"
                  style={{
                    background: groupSurface(entry.blood) || '#f0f0f0',
                    color: groupInk(entry.blood) || '#666',
                  }}
                >
                  {entry.blood}
                </span>
                <span className={`activity__list-amount activity__list-amount--${isStore ? 'store' : 'withdraw'}`}>
                  {isStore ? '+' : '−'}{entry.unitCount ?? 0}
                </span>
              </div>
              <div className="activity__list-row2">
                {isStore ? 'จัดเก็บ' : 'นำออก'} · {dateStr} · {entry.detail}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
