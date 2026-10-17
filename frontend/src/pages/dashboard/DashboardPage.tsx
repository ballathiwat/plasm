// frontend/src/pages/dashboard/DashboardPage.tsx

import { useEffect, useState } from 'react'
import { Package, PackageOpen, AlertTriangle } from 'lucide-react'
import type { BloodGroup, LogEntry } from '../../types/models'
import { getStockSummary, getLog } from '../../helpers/backend_helper'

// ── Blood group colors (updated design) ──
const GROUP_COLOR: Record<BloodGroup, string> = {
  A: 'var(--group-a)', B: 'var(--group-b)', O: 'var(--group-o)', AB: 'var(--group-ab)',
}
const GROUP_SURFACE: Record<BloodGroup, string> = {
  A: 'var(--group-a-surface)', B: 'var(--group-b-surface)', O: 'var(--group-o-surface)', AB: 'var(--group-ab-surface)',
}

interface StockData {
  stocks: Record<BloodGroup, number>
  minimum: Record<BloodGroup, number>
}

const levelOf = (c: number, m: number) => c < m ? 'danger' : c < m * 1.2 ? 'warning' : 'normal'

export default function DashboardPage() {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])

  useEffect(() => {
    getStockSummary().then((res) => setStockData(res.data))
    getLog().then((res) => setLogEntries(res.data))
  }, [])

  if (!stockData) return null

  const { stocks, minimum } = stockData
  const groups: BloodGroup[] = ['A', 'B', 'O', 'AB']
  const total = groups.reduce((s, g) => s + stocks[g], 0)
  const totalMin = groups.reduce((s, g) => s + minimum[g], 0)

  const lowGroups = groups.filter((g) => levelOf(stocks[g], minimum[g]) === 'danger')
  const warnGroups = groups.filter((g) => levelOf(stocks[g], minimum[g]) === 'warning')

  // ── Mock 7-day data ──
  const week = [62, 48, 75, 54, 88, 70, 92]
  const days = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
  const maxW = Math.max(...week)

  const lvColor = (lv: string) =>
    lv === 'danger' ? 'var(--stock-danger)' : lv === 'warning' ? 'var(--stock-warning)' : 'var(--stock-normal)'
  const lvText = (lv: string) =>
    lv === 'danger' ? 'ต่ำกว่าขั้นต่ำ' : lv === 'warning' ? 'ใกล้ขั้นต่ำ' : 'ปกติ'

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>

      {/* ═══ Hero Banner ═══ */}
      <section
        style={{
          position: 'relative', overflow: 'hidden',
          borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: '#fff',
          padding: '24px 28px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: -40, top: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', right: 120, bottom: -80, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ position: 'relative', minWidth: 0, flex: '1 1 320px' }}>
          <p style={{ fontSize: 13, opacity: 0.92 }}>สวัสดี, ผู้ดูแลระบบ</p>
          <p style={{ fontWeight: 600, fontSize: 26, lineHeight: 1.3, marginTop: 4 }}>
            สต็อกพลาสมารวม {total.toLocaleString()} units
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.5, marginTop: 6, opacity: 0.92 }}>
            อัปเดตล่าสุดวันนี้ · ห้อง -30°C และตู้ -30°C
          </p>
        </div>

        <div style={{ position: 'relative', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6, minHeight: 44,
              padding: '9px 14px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: '#fff', color: 'var(--primary-pressed)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}
          >
            <Package size={14} />
            จัดเก็บกล่องใหม่
          </button>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6, minHeight: 44,
              padding: '9px 14px', borderRadius: 'var(--radius-sm)',
              border: '1px solid #fff', background: 'transparent', color: '#fff',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}
          >
            <PackageOpen size={14} />
            นำออก
          </button>
        </div>
      </section>

      {/* ═══ Alert Banners ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 20 }}>
        {lowGroups.length > 0 && (
          <div
            role="alert"
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '12px 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--danger-surface)', border: '1px solid var(--stock-danger)',
              color: 'var(--danger-ink)', fontSize: 14, lineHeight: 1.5,
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <p><strong>ต่ำกว่าขั้นต่ำ:</strong> หมู่เลือด {lowGroups.join(', ')} — ควรเติมสต็อกโดยเร็ว</p>
          </div>
        )}
        {warnGroups.length > 0 && (
          <div
            role="status"
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '12px 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--warning-surface)', border: '1px solid var(--stock-warning)',
              color: 'var(--warning-ink)', fontSize: 14, lineHeight: 1.5,
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <p><strong>ใกล้ขั้นต่ำ:</strong> หมู่เลือด {warnGroups.join(', ')} — เหลือไม่ถึง 120% ของขั้นต่ำ</p>
          </div>
        )}
      </div>

      {/* ═══ Stock Cards ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
        {groups.map((g) => {
          const count = stocks[g]
          const min = minimum[g]
          const lv = levelOf(count, min)
          const isLow = lv === 'danger'
          const color = isLow ? 'var(--stock-danger)' : lv === 'warning' ? 'var(--stock-warning)' : GROUP_COLOR[g]
          const surface = isLow ? 'var(--danger-surface)' : lv === 'warning' ? 'var(--warning-surface)' : GROUP_SURFACE[g]
          const progress = Math.min(count / (min * 2), 1)

          return (
            <div
              key={g}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
              }}
            >
              {/* Accent bar */}
              <div style={{ height: 4, background: color }} />

              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  {/* Circle badge */}
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: surface, color: color, border: `2px solid ${color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 14,
                    }}
                  >
                    {g}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>หมู่เลือด {g}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1, color: 'var(--text-primary)' }}>{count}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: lvColor(lv) }}>{lvText(lv)}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ขั้นต่ำ {min}</span>
                </div>

                {/* Progress bar */}
                <div style={{ height: 6, borderRadius: 'var(--radius-full)', background: 'var(--surface-raised)' }}>
                  <div
                    style={{
                      height: '100%', width: `${progress * 100}%`,
                      borderRadius: 'var(--radius-full)', background: color,
                      transformOrigin: 'left', animation: 'plasm-grow 0.9s cubic-bezier(.2,.8,.2,1)',
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ═══ Charts Row ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 20 }}>
        {/* Stock vs Minimum */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>สต็อกเทียบขั้นต่ำ</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {groups.map((g) => {
              const c = stocks[g], m = minimum[g], scale = 600, lv = levelOf(c, m)
              return (
                <div key={g} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 48px', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      padding: '2px 10px', borderRadius: 'var(--radius-full)',
                      fontSize: 12, fontWeight: 600,
                      background: GROUP_SURFACE[g], color: GROUP_COLOR[g],
                    }}
                  >
                    {g}
                  </span>
                  <div style={{ position: 'relative', height: 10, borderRadius: 'var(--radius-full)', background: 'var(--surface-raised)' }}>
                    <div
                      style={{
                        height: '100%', width: `${(c / scale) * 100}%`,
                        borderRadius: 'var(--radius-full)',
                        background: lv === 'danger' ? 'var(--stock-danger)' : lv === 'warning' ? 'var(--stock-warning)' : GROUP_COLOR[g],
                        transformOrigin: 'left', animation: 'plasm-grow 0.9s cubic-bezier(.2,.8,.2,1)',
                      }}
                    />
                    {/* Min line */}
                    <div
                      style={{
                        position: 'absolute', top: -4, bottom: -4,
                        left: `${(m / scale) * 100}%`, width: 2,
                        background: 'var(--text-primary)', borderRadius: 1,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{c}</span>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
            <span style={{ width: 2, height: 12, background: 'var(--text-primary)' }} />
            เส้นขั้นต่ำ (Minimum stock)
          </p>
        </div>

        {/* 7-Day Storage */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>การจัดเก็บ 7 วันล่าสุด</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
            {week.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{v}</span>
                <div
                  style={{
                    width: '100%', height: `${(v / maxW) * 100}%`,
                    borderRadius: '6px 6px 2px 2px',
                    background: i === week.length - 1 ? 'var(--primary)' : 'var(--group-a-surface)',
                    boxShadow: i === week.length - 1 ? 'none' : 'inset 0 0 0 1px var(--group-a)',
                    transformOrigin: 'bottom',
                    animation: `plasm-rise 0.7s cubic-bezier(.2,.8,.2,1) ${i * 0.05}s both`,
                  }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{days[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Recent Activity List ═══ */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>รายการล่าสุด</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {logEntries.slice().reverse().slice(0, 10).map((entry) => {
            const isStore = entry.action === 'store'
            return (
              <li
                key={entry.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap',
                }}
              >
                {/* Icon circle */}
                <div
                  style={{
                    width: 28, height: 28, borderRadius: 'var(--radius-full)',
                    background: isStore ? 'var(--success-surface)' : 'var(--danger-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isStore ? 'var(--success-ink)' : 'var(--danger-ink)', flexShrink: 0,
                  }}
                >
                  {isStore ? <Package size={14} /> : <PackageOpen size={14} />}
                </div>

                <span style={{ fontSize: 12, fontWeight: 600, minWidth: 48, color: isStore ? 'var(--success-ink)' : 'var(--danger-ink)' }}>
                  {isStore ? 'จัดเก็บ' : 'นำออก'}
                </span>

                {/* Blood badge */}
                <span
                  style={{
                    display: 'inline-block', padding: '2px 10px',
                    borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600,
                    background: GROUP_SURFACE[entry.blood], color: GROUP_COLOR[entry.blood],
                  }}
                >
                  {entry.blood}
                </span>

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>
                  {entry.boxLabel}
                </span>

                <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1, minWidth: 200 }}>
                  {entry.detail}
                </span>
              </li>
            )
          })}
          {logEntries.length === 0 && (
            <li style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>
              ยังไม่มีรายการ
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}