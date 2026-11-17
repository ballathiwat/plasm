// ============================================================
//  src/pages/dashboard/components/DashboardOverview.tsx
//  แทน DashboardHero + DashboardMinBanner
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Database, Package, PackageOpen, RefreshCw,
  OctagonAlert, CircleCheck,
} from 'lucide-react'
import { useAuth } from '../../../Routes/AuthProtected'
import { groupColor } from '../../../helpers/blood'
import { aboOf } from '../../../helpers/minStock'
import type { TodaySummary } from '../services/useDashboard'
import type { DashboardState } from '../services/useDashboard'

/** ลำดับการแสดงหมู่ 12 หมู่ — 3 คอลัมน์ × 4 แถว */
const GROUP_ORDER = [
  'A', 'A+', 'A−',
  'B', 'B+', 'B−',
  'O', 'O+', 'O−',
  'AB', 'AB+', 'AB−',
]

interface Props {
  d: DashboardState
}

const fmtTime = (date: Date | null) =>
  date
    ? date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    : null

export default function DashboardOverview({ d }: Props) {
  const navigate = useNavigate()
  const { user } = useAuth()

  // ── ResizeObserver → columns ──
  const containerRef = useRef<HTMLDivElement>(null)
  const [cols, setCols] = useState(4)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (w >= 760) setCols(4)
      else if (w >= 400) setCols(2)
      else setCols(1)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // ── Stale check ──
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])
  const staleMinutes = d.fetchedAt ? Math.floor((now.getTime() - d.fetchedAt.getTime()) / 60_000) : 0
  const isStale = staleMinutes >= 5

  // ── KPI columns: ซ่อนการ์ด restock ถ้าไม่ configured ──
  const kpiCols = d.configured ? cols : Math.min(cols, 3)

  // ── Restock counts ──
  const dangerCount = d.counts.danger
  const warningCount = d.counts.warning

  const handleScrollToCard = useCallback(() => {
    d.scrollToCard()
  }, [d])

  return (
    <div ref={containerRef}>
      {/* ── Header ── */}
      <div className="dov-header">
        <div>
          <div className="dov-header__left">
            <span className="dov-header__greeting">
              สวัสดี, {user.name || 'ผู้ดูแลระบบ'}
            </span>
            <button
              className={`dov-header__refresh${d.refreshing ? ' dov-header__refresh--spinning' : ''}`}
              onClick={d.reload}
              aria-label="โหลดข้อมูลใหม่"
              disabled={d.refreshing}
            >
              <RefreshCw size={16} />
            </button>
          </div>
          <p className="dov-header__sub">
            ข้อมูล ณ {d.fetchedAt ? fmtTime(d.fetchedAt) : '--:--'} น.
            {isStale && (
              <span className="dov-header__stale">เกิน 5 นาที</span>
            )}
          </p>
        </div>
        <div className="dov-header__actions">
          <button
            className="dov-header__btn dov-header__btn--outline"
            onClick={() => navigate('/withdraw')}
          >
            <PackageOpen size={16} /> นำออก
          </button>
          <button
            className="dov-header__btn dov-header__btn--primary"
            onClick={() => navigate('/storage')}
          >
            <Package size={16} /> จัดเก็บกล่องใหม่
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className={`dov-kpi dov-kpi--cols-${kpiCols}`}>
        {/* 1. สต็อกรวม */}
        <StockTotalCard total={d.total} byGroup={d.byGroup} />

        {/* 2. นำเข้าวันนี้ */}
        <TodayInCard data={d.todayIn} />

        {/* 3. นำออกวันนี้ */}
        <TodayOutCard data={d.todayOut} />

        {/* 4. ต้องเติมสต็อก (เฉพาะ configured) */}
        {d.configured && (
          <RestockCard
            dangerCount={dangerCount}
            warningCount={warningCount}
            onScroll={handleScrollToCard}
          />
        )}
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────

function StockTotalCard({ total, byGroup }: { total: number; byGroup: Record<string, number> }) {
  return (
    <div className="dov-card">
      <div className="dov-card__label">
        <span className="dov-card__icon" style={{ background: 'var(--primary-surface)', color: 'var(--primary)' }}>
          <Database size={16} />
        </span>
        สต็อกรวม
      </div>
      <div className="dov-card__value">
        {total.toLocaleString()}
        <span className="dov-card__unit">unit</span>
      </div>
      <div className="dov-stock__divider" />
      <dl className="dov-stock__groups">
        {GROUP_ORDER.map((g) => {
          const count = byGroup[g] ?? 0
          return (
            <div key={g} className="dov-stock__group">
              <span className="dov-stock__dot" style={{ background: groupColor(aboOf(g)) }} />
              <span className="dov-stock__group-name">{g}</span>
              <span className={`dov-stock__group-count${count === 0 ? ' dov-stock__group-count--zero' : ''}`}>
                {count.toLocaleString()}
              </span>
            </div>
          )
        })}
      </dl>
    </div>
  )
}

function TodayInCard({ data }: { data: TodaySummary }) {
  return (
    <div className="dov-card">
      <div className="dov-card__label">
        <span className="dov-card__icon" style={{ background: 'var(--success-surface)', color: 'var(--success-ink)' }}>
          <Package size={16} />
        </span>
        นำเข้าวันนี้
      </div>
      <div className="dov-card__value" style={{ color: 'var(--success-ink)' }}>
        +{data.units.toLocaleString()}
        <span className="dov-card__unit">unit</span>
      </div>
      <p className="dov-card__sub">
        {data.count} กล่อง{data.lastAt ? ` · ล่าสุด ${fmtTime(data.lastAt)} น.` : ''}
      </p>
    </div>
  )
}

function TodayOutCard({ data }: { data: TodaySummary }) {
  return (
    <div className="dov-card">
      <div className="dov-card__label">
        <span className="dov-card__icon" style={{ background: 'var(--danger-surface)', color: 'var(--danger-ink)' }}>
          <PackageOpen size={16} />
        </span>
        นำออกวันนี้
      </div>
      <div className="dov-card__value" style={{ color: 'var(--danger-ink)' }}>
        −{data.units.toLocaleString()}
        <span className="dov-card__unit">unit</span>
      </div>
      <p className="dov-card__sub">
        {data.count} รายการ{data.lastAt ? ` · ล่าสุด ${fmtTime(data.lastAt)} น.` : ''}
      </p>
    </div>
  )
}

function RestockCard({
  dangerCount,
  warningCount,
  onScroll,
}: {
  dangerCount: number
  warningCount: number
  onScroll: () => void
}) {
  const hasDanger = dangerCount > 0

  return (
    <button
      className={`dov-card dov-card--restock${hasDanger ? ' dov-card--danger' : ''}`}
      onClick={onScroll}
    >
      <div className="dov-card__label">
        <span className={`dov-card__icon ${hasDanger ? 'dov-card__icon--danger' : 'dov-card__icon--success'}`}>
          {hasDanger ? <OctagonAlert size={16} /> : <CircleCheck size={16} />}
        </span>
        ต้องเติมสต็อก
      </div>
      <div className="dov-card__value">
        {hasDanger ? dangerCount : 0}
        <span className="dov-card__unit">รายการ</span>
      </div>
      <p className="dov-card__sub">
        {hasDanger
          ? (warningCount > 0 ? `ใกล้ต่ำอีก ${warningCount} รายการ ›` : 'ดูรายการ ›')
          : 'สต็อกครบทุกรายการ'}
      </p>
    </button>
  )
}
