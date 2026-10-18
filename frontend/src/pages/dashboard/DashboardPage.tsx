// frontend/src/pages/dashboard/DashboardPage.tsx

import { useEffect, useState } from 'react'
import { Package, PackageOpen, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import type { BloodGroup, LogEntry } from '../../types/models'
import { getStockSummary, getLog } from '../../helpers/backend_helper'

// ── Design tokens ──
const GROUP_COLOR: Record<BloodGroup, string> = {
  A: 'var(--group-a, #3B82F6)', B: 'var(--group-b, #10B981)',
  O: 'var(--group-o, #F59E0B)', AB: 'var(--group-ab, #8B5CF6)',
}
const GROUP_SURFACE: Record<BloodGroup, string> = {
  A: 'var(--group-a-surface, #DBEAFE)', B: 'var(--group-b-surface, #D1FAE5)',
  O: 'var(--group-o-surface, #FEF3C7)', AB: 'var(--group-ab-surface, #EDE9FE)',
}

interface StockData {
  stocks: Record<BloodGroup, number>
  minimum: Record<BloodGroup, number>
}

const levelOf = (c: number, m: number) =>
  c < m ? 'danger' : c < m * 1.2 ? 'warning' : 'normal'

const lvColor = (lv: string) =>
  lv === 'danger' ? 'var(--stock-danger, #EF4444)' : lv === 'warning' ? 'var(--stock-warning, #F59E0B)' : 'var(--stock-normal, #10B981)'

const lvText = (lv: string) =>
  lv === 'danger' ? 'ต่ำกว่าขั้นต่ำ' : lv === 'warning' ? 'ใกล้ขั้นต่ำ' : 'ปกติ'

const lvBorderColor = (lv: string) =>
  lv === 'danger' ? '#EF4444' : lv === 'warning' ? '#F59E0B' : '#10B981'

export default function DashboardPage() {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])

  useEffect(() => {
    getStockSummary().then((data: any) => setStockData(data)).catch(() => {})
    getLog().then((data: any) => setLogEntries(data)).catch(() => {})
  }, [])

  if (!stockData) return null

  const { stocks, minimum } = stockData
  const groups: BloodGroup[] = ['A', 'B', 'O', 'AB']
  const total = groups.reduce((s, g) => s + stocks[g], 0)

  const lowGroups = groups.filter((g) => levelOf(stocks[g], minimum[g]) === 'danger')
  const warnGroups = groups.filter((g) => levelOf(stocks[g], minimum[g]) === 'warning')

  // Mock 7-day data + dates
  const now = new Date()
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    return {
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      value: [10, 18, 9, 14, 24, 7, 9][i],
    }
  })
  const maxW = Math.max(...weekData.map((d) => d.value))

  // Mock % change
  const pctChange: Record<BloodGroup, number> = { A: 4, B: 7, O: -3, AB: -5 }

  return (
    <div style={{ animation: 'plasm-fade-in 0.2s ease' }}>

      {/* ═══ Hero Banner ═══ */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 'var(--radius-lg, 10px)',
        background: 'var(--primary, #2563EB)', color: '#fff',
        padding: '28px 28px', marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', right: 120, bottom: -80, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ position: 'relative', flex: '1 1 320px' }}>
          <p style={{ fontSize: 14, opacity: 0.85 }}>สวัสดี, ผู้ดูแลระบบ</p>
          <p style={{ fontWeight: 700, fontSize: 28, lineHeight: 1.3, marginTop: 6 }}>
            สต็อกพลาสมารวม {total.toLocaleString()} units
          </p>
          <p style={{ fontSize: 13, marginTop: 8, opacity: 0.8 }}>
            อัปเดตล่าสุด {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น. · ห้อง -30°C และตู้ -30°C
          </p>
        </div>

        <div style={{ position: 'relative', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
            borderRadius: 'var(--radius-sm, 6px)', border: 'none',
            background: '#fff', color: 'var(--primary, #2563EB)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>
            <Package size={14} /> จัดเก็บกล่องใหม่
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
            borderRadius: 'var(--radius-sm, 6px)',
            border: '1px solid rgba(255,255,255,0.6)', background: 'transparent', color: '#fff',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>
            <PackageOpen size={14} /> นำออก
          </button>
        </div>
      </section>

      {/* ═══ Alert Banners ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 16 }}>
        {lowGroups.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 'var(--radius-md, 8px)',
            background: '#FEF2F2', border: '1px solid #FECACA',
          }}>
            <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#991B1B' }}>
              <strong>ต่ำกว่าขั้นต่ำ:</strong> หมู่เลือด {lowGroups.join(', ')} — ควรเติมสต็อกโดยเร็ว
            </span>
          </div>
        )}
        {warnGroups.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 'var(--radius-md, 8px)',
            background: '#FFFBEB', border: '1px solid #FDE68A',
          }}>
            <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#92400E' }}>
              <strong>ใกล้ขั้นต่ำ:</strong> หมู่เลือด {warnGroups.join(', ')} — เหลือไม่ถึง 120% ของขั้นต่ำ
            </span>
          </div>
        )}
      </div>

      {/* ═══ Stock Cards ═══ */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12, marginBottom: 16,
      }}>
        {groups.map((g) => {
          const count = stocks[g]
          const min = minimum[g]
          const lv = levelOf(count, min)
          const color = lvBorderColor(lv)
          const pct = pctChange[g]
          const progress = Math.min(count / min, 1.5)

          return (
            <div key={g} style={{
              background: 'var(--surface, #fff)',
              border: '1px solid var(--border, #E4E4E7)',
              borderTop: `3px solid ${color}`,
              borderRadius: 'var(--radius-lg, 10px)',
              padding: '16px 20px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: '50%',
                    background: GROUP_SURFACE[g], color: GROUP_COLOR[g],
                    fontSize: 13, fontWeight: 700,
                  }}>{g}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary, #18181B)' }}>
                    หมู่เลือด {g}
                  </span>
                </div>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  fontSize: 12, fontWeight: 600,
                  color: pct >= 0 ? '#10B981' : '#EF4444',
                }}>
                  {pct >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {pct >= 0 ? '▲' : '▼'}{Math.abs(pct)}%
                </span>
              </div>

              {/* Big number */}
              <div style={{
                fontSize: 36, fontWeight: 700, lineHeight: 1.1,
                color: 'var(--text-primary, #18181B)', marginBottom: 6,
              }}>
                {count.toLocaleString()}
              </div>

              {/* Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: lvColor(lv) }}>
                  {lvText(lv)}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary, #71717A)' }}>
                  ขั้นต่ำ {min} units
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, borderRadius: 99, background: 'var(--surface-raised, #F4F4F5)' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(progress, 1) * 100}%`,
                  borderRadius: 99,
                  background: color,
                  transformOrigin: 'left',
                  animation: 'plasm-grow 0.9s cubic-bezier(.2,.8,.2,1)',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* ═══ Charts Row ═══ */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16, marginBottom: 16,
      }}>
        {/* Stock vs Minimum */}
        <div style={{
          background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
          borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)', padding: 20,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>สต็อกเทียบขั้นต่ำ</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {groups.map((g) => {
              const c = stocks[g]
              const m = minimum[g]
              const scale = Math.max(...groups.map((x) => Math.max(stocks[x], minimum[x]))) * 1.2
              const lv = levelOf(c, m)

              return (
                <div key={g} style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr 50px 80px',
                  alignItems: 'center', gap: 10,
                }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 36, height: 36, borderRadius: '50%',
                    background: GROUP_SURFACE[g], color: GROUP_COLOR[g],
                    fontSize: 13, fontWeight: 700,
                  }}>{g}</span>

                  {/* Bar + min marker */}
                  <div style={{ position: 'relative', height: 14, borderRadius: 99, background: 'var(--surface-raised, #F4F4F5)' }}>
                    <div style={{
                      height: '100%',
                      width: `${(c / scale) * 100}%`,
                      borderRadius: 99,
                      background: lvBorderColor(lv),
                      transformOrigin: 'left',
                      animation: 'plasm-grow 0.9s cubic-bezier(.2,.8,.2,1)',
                    }} />
                    {/* Min line */}
                    <div style={{
                      position: 'absolute', top: -3, bottom: -3,
                      left: `${(m / scale) * 100}%`, width: 2,
                      background: 'var(--text-primary, #18181B)', borderRadius: 1,
                    }} />
                  </div>

                  <span style={{
                    fontSize: 14, fontWeight: 600, textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}>{c}</span>

                  <span style={{
                    fontSize: 11, fontWeight: 600, textAlign: 'center',
                    padding: '3px 8px', borderRadius: 99,
                    background: lv === 'danger' ? '#FEF2F2' : lv === 'warning' ? '#FFFBEB' : '#F0FDF4',
                    color: lv === 'danger' ? '#DC2626' : lv === 'warning' ? '#D97706' : '#16A34A',
                  }}>
                    {lvText(lv)}
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 16,
            fontSize: 12, color: 'var(--text-secondary, #71717A)',
          }}>
            <span style={{ width: 2, height: 12, background: 'var(--text-primary, #18181B)' }} />
            เส้นขั้นต่ำ (Minimum stock)
          </div>
        </div>

        {/* 7-Day Storage */}
        <div style={{
          background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
          borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)', padding: 20,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>การจัดเก็บ 7 วันล่าสุด</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160 }}>
            {weekData.map((d, i) => {
              const isLast = i === weekData.length - 1
              return (
                <div key={i} style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {d.value}
                  </span>
                  <div style={{
                    width: '100%', maxWidth: 48,
                    height: `${(d.value / maxW) * 100}%`,
                    borderRadius: '6px 6px 2px 2px',
                    background: isLast ? 'var(--primary, #2563EB)' : 'var(--group-a-surface, #DBEAFE)',
                    transformOrigin: 'bottom',
                    animation: `plasm-rise 0.7s cubic-bezier(.2,.8,.2,1) ${i * 0.05}s both`,
                  }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ═══ Recent Activity ═══ */}
      <div style={{
        background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
        borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)', padding: 20,
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>รายการล่าสุด</h3>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '120px 100px 140px 70px 60px 1fr',
          gap: 8, padding: '8px 0',
          borderBottom: '1px solid var(--border, #E4E4E7)',
          fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #71717A)',
        }}>
          <span>เวลา</span>
          <span>การดำเนินการ</span>
          <span>กล่อง</span>
          <span>หมู่เลือด</span>
          <span>จำนวน</span>
          <span>รายละเอียด</span>
        </div>

        {logEntries.slice(0, 10).map((entry) => {
          const isStore = entry.action === 'store'
          const ts = new Date(entry.timestamp)
          const timeStr = ts.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
            + ' ' + ts.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })

          return (
            <div key={entry.id} style={{
              display: 'grid',
              gridTemplateColumns: '120px 100px 140px 70px 60px 1fr',
              gap: 8, padding: '10px 0',
              borderBottom: '1px solid var(--border, #E4E4E7)',
              fontSize: 13, alignItems: 'center',
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>{timeStr}</span>

              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 600,
                color: isStore ? '#16A34A' : '#DC2626',
              }}>
                {isStore ? <Package size={13} /> : <PackageOpen size={13} />}
                {isStore ? 'จัดเก็บ' : 'นำออก'}
              </span>

              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                {entry.boxLabel}
              </span>

              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 22, borderRadius: 99,
                fontSize: 11, fontWeight: 600,
                background: GROUP_SURFACE[entry.blood as BloodGroup] || '#f0f0f0',
                color: GROUP_COLOR[entry.blood as BloodGroup] || '#666',
              }}>
                {entry.blood}
              </span>

              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                {entry.units?.length || 0}
              </span>

              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                {entry.detail}
              </span>
            </div>
          )
        })}

        {logEntries.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
            ยังไม่มีรายการ
          </div>
        )}
      </div>
    </div>
  )
}