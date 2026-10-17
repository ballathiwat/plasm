// frontend/src/pages/dashboard/DashboardPage.tsx

import { useEffect, useState } from 'react'
import {
  Package,
  PackageOpen,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react'
import type { BloodGroup, LogEntry } from '../../types/models'
import { getStockSummary, getLog } from '../../helpers/backend_helper'

// ── Blood type color map ──
const BLOOD_COLORS: Record<BloodGroup, string> = {
  A: 'var(--blood-a)',
  B: 'var(--blood-b)',
  O: 'var(--blood-o)',
  AB: 'var(--blood-ab)',
}

const BLOOD_LIGHT: Record<BloodGroup, string> = {
  A: '#fde8e8',
  B: '#dbeafe',
  O: '#d1fae5',
  AB: '#ede9fe',
}

// ── Types ──
interface StockData {
  stocks: Record<BloodGroup, number>
  minimum: Record<BloodGroup, number>
}

// ── Font style helpers (individual properties, ไม่ใช้ font shorthand) ──
const F = {
  display: { fontFamily: 'var(--font-sans)', fontSize: 36, lineHeight: 1.1, fontWeight: 700 } as const,
  heading: { fontFamily: 'var(--font-sans)', fontSize: 22, lineHeight: '28px', fontWeight: 700 } as const,
  body:    { fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: '20px', fontWeight: 400 } as const,
  label:   { fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: '18px', fontWeight: 500 } as const,
  caption: { fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: '16px', fontWeight: 600 } as const,
}

// ════════════════════════════════════════
// Component
// ════════════════════════════════════════
export default function DashboardPage() {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])

  useEffect(() => {
    getStockSummary().then((res) => setStockData(res.data))
    getLog().then((res) => setLogEntries(res.data))
  }, [])

  if (!stockData) return null

  const { stocks, minimum } = stockData
  const bloodTypes: BloodGroup[] = ['A', 'B', 'O', 'AB']
  const totalStock = bloodTypes.reduce((s, b) => s + stocks[b], 0)
  const totalMin = bloodTypes.reduce((s, b) => s + minimum[b], 0)

  // ── Alerts ──
  const critical = bloodTypes.filter((b) => stocks[b] < minimum[b])
  const nearMin = bloodTypes.filter(
    (b) => stocks[b] >= minimum[b] && stocks[b] < minimum[b] * 1.2
  )

  // ── Mock 7-day storage data ──
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      value: Math.floor(Math.random() * 20) + 5,
    }
  })
  const maxBarVal = Math.max(...last7Days.map((d) => d.value))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>

      {/* ═══ 1. Hero Banner ═══ */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-7)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-5)',
        }}
      >
        <div>
          <div style={{ ...F.label, opacity: 0.8, marginBottom: 4 }}>
            สต็อกพลาสมารวม
          </div>
          <div style={{ ...F.display, fontSize: 48, letterSpacing: -1 }}>
            {totalStock}{' '}
            <span style={{ ...F.body, opacity: 0.7 }}>/ {totalMin} ขั้นต่ำ</span>
          </div>
          <div style={{ ...F.body, opacity: 0.7, marginTop: 4 }}>
            {bloodTypes.length} หมู่เลือด &middot; อัปเดตล่าสุดวันนี้
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: '#fff',
              color: 'var(--primary)',
              ...F.label,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Package size={16} />
            จัดเก็บกล่องใหม่
          </button>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.12)',
              color: '#fff',
              ...F.label,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <PackageOpen size={16} />
            นำออก
          </button>
        </div>
      </div>

      {/* ═══ 2. Stock Cards ═══ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-5)',
        }}
      >
        {bloodTypes.map((blood) => {
          const count = stocks[blood]
          const min = minimum[blood]
          const pct = min > 0 ? Math.min((count / min) * 100, 100) : 100
          const isLow = count < min
          const isNear = !isLow && count < min * 1.2
          const color = BLOOD_COLORS[blood]
          const lightBg = BLOOD_LIGHT[blood]

          return (
            <div
              key={blood}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
              }}
            >
              {/* Top accent */}
              <div style={{ height: 4, background: color }} />

              <div style={{ padding: 'var(--space-6)' }}>
                {/* Circle badge + label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: lightBg,
                      color: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...F.heading,
                      fontSize: 18,
                    }}
                  >
                    {blood}
                  </div>
                  <div>
                    <div style={{ ...F.label, color: 'var(--text-muted)' }}>
                      หมู่เลือด {blood}
                    </div>
                    <div style={{ ...F.display, fontSize: 28 }}>
                      {count}
                    </div>
                  </div>
                </div>

                {/* Change indicator */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    ...F.caption,
                    color: isLow ? 'var(--danger)' : isNear ? 'var(--warning)' : 'var(--success)',
                    marginBottom: 'var(--space-3)',
                  }}
                >
                  {isLow ? (
                    <>
                      <TrendingDown size={14} />
                      ต่ำกว่าขั้นต่ำ
                    </>
                  ) : isNear ? (
                    <>
                      <AlertTriangle size={14} />
                      ใกล้ขั้นต่ำ
                    </>
                  ) : (
                    <>
                      <TrendingUp size={14} />
                      ปกติ
                    </>
                  )}
                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
                    ขั้นต่ำ {min}
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: 6,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--surface-alt)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      borderRadius: 'var(--radius-full)',
                      background: isLow ? 'var(--danger)' : isNear ? 'var(--warning)' : color,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ═══ 3. Alert Banners ═══ */}
      {critical.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--danger-light)',
            border: '1px solid var(--danger-border)',
          }}
        >
          <AlertCircle size={20} color="var(--danger)" />
          <div>
            <div style={{ ...F.caption, color: 'var(--danger)' }}>
              สต็อกต่ำกว่าขั้นต่ำ
            </div>
            <div style={{ ...F.body, color: 'var(--text)', marginTop: 2 }}>
              หมู่เลือด {critical.join(', ')} — ต้องเติมสต็อกด่วน
            </div>
          </div>
        </div>
      )}

      {nearMin.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--warning-light)',
            border: '1px solid var(--warning-border)',
          }}
        >
          <AlertTriangle size={20} color="var(--warning)" />
          <div>
            <div style={{ ...F.caption, color: 'var(--warning)' }}>
              สต็อกใกล้ขั้นต่ำ
            </div>
            <div style={{ ...F.body, color: 'var(--text)', marginTop: 2 }}>
              หมู่เลือด {nearMin.join(', ')} — เหลือน้อยกว่า 20% เหนือขั้นต่ำ
            </div>
          </div>
        </div>
      )}

      {/* ═══ 4. Charts Row ═══ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 'var(--space-5)',
        }}
      >
        {/* ── 4a. Horizontal bar: Stock vs Minimum ── */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            padding: 'var(--space-6)',
          }}
        >
          <div style={{ ...F.label, color: 'var(--text)', marginBottom: 'var(--space-5)' }}>
            สต็อกเทียบขั้นต่ำ
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {bloodTypes.map((blood) => {
              const count = stocks[blood]
              const min = minimum[blood]
              const maxVal = Math.max(count, min) * 1.15
              const isLow = count < min
              return (
                <div key={blood}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      ...F.caption,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ color: BLOOD_COLORS[blood] }}>หมู่ {blood}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {count} / {min}
                    </span>
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      height: 20,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--surface-alt)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Minimum line */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${(min / maxVal) * 100}%`,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        background: 'var(--text-muted)',
                        opacity: 0.3,
                        zIndex: 2,
                      }}
                    />
                    {/* Stock bar */}
                    <div
                      style={{
                        height: '100%',
                        width: `${(count / maxVal) * 100}%`,
                        borderRadius: 'var(--radius-sm)',
                        background: isLow ? 'var(--danger)' : BLOOD_COLORS[blood],
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── 4b. Vertical bar: Last 7 days storage ── */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            padding: 'var(--space-6)',
          }}
        >
          <div style={{ ...F.label, color: 'var(--text)', marginBottom: 'var(--space-5)' }}>
            การจัดเก็บ 7 วันล่าสุด
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 'var(--space-3)',
              height: 160,
            }}
          >
            {last7Days.map((day, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <span style={{ ...F.caption, color: 'var(--text-muted)' }}>
                  {day.value}
                </span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: 36,
                    height: `${(day.value / maxBarVal) * 120}px`,
                    borderRadius: '4px 4px 0 0',
                    background: 'var(--primary)',
                    opacity: 0.8 + (i / last7Days.length) * 0.2,
                    transition: 'height 0.4s ease',
                  }}
                />
                <span style={{ ...F.caption, color: 'var(--text-muted)', fontSize: 11 }}>
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ 5. Recent Activity Table ═══ */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: 'var(--space-6)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ ...F.label, color: 'var(--text)' }}>
            รายการล่าสุด
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-alt)' }}>
                {['เวลา', 'การดำเนินการ', 'กล่อง', 'หมู่เลือด', 'จำนวน', 'รายละเอียด'].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px var(--space-5)',
                        ...F.label,
                        color: 'var(--text-muted)',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {logEntries.slice(0, 10).map((entry) => (
                <tr
                  key={entry.id}
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = 'var(--surface-alt)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  <td
                    style={{
                      padding: '10px var(--space-5)',
                      ...F.body,
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {new Date(entry.timestamp).toLocaleString('th-TH', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td style={{ padding: '10px var(--space-5)' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-full)',
                        ...F.caption,
                        background:
                          entry.action === 'store'
                            ? 'var(--success-light)'
                            : 'var(--warning-light)',
                        color:
                          entry.action === 'store'
                            ? 'var(--success)'
                            : 'var(--warning)',
                        border: `1px solid ${
                          entry.action === 'store'
                            ? 'var(--success-border)'
                            : 'var(--warning-border)'
                        }`,
                      }}
                    >
                      {entry.action === 'store' ? (
                        <Package size={12} />
                      ) : (
                        <PackageOpen size={12} />
                      )}
                      {entry.action === 'store' ? 'จัดเก็บ' : 'นำออก'}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '10px var(--space-5)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      fontSize: 13,
                      lineHeight: '20px',
                    }}
                  >
                    {entry.boxLabel}
                  </td>
                  <td style={{ padding: '10px var(--space-5)' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-full)',
                        ...F.caption,
                        background: BLOOD_LIGHT[entry.blood],
                        color: BLOOD_COLORS[entry.blood],
                      }}
                    >
                      {entry.blood}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '10px var(--space-5)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      fontSize: 13,
                      lineHeight: '20px',
                    }}
                  >
                    {entry.units.length}
                  </td>
                  <td
                    style={{
                      padding: '10px var(--space-5)',
                      ...F.body,
                      color: 'var(--text-muted)',
                    }}
                  >
                    {entry.detail}
                  </td>
                </tr>
              ))}
              {logEntries.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: 'var(--space-7)',
                      textAlign: 'center',
                      ...F.body,
                      color: 'var(--text-muted)',
                    }}
                  >
                    ยังไม่มีรายการ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}