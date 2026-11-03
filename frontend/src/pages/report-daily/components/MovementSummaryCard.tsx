// frontend/src/pages/report-daily/components/MovementSummaryCard.tsx

import type { MovementResponse, SummaryItem } from '../services/DailyReportType'
import { groupSurface, groupInk, plasmaChartColor } from '../services/DailyReportType'

const formatRange = (from: string, to: string, days: number): string => {
  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00+07:00`).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
  if (from === to) return `${fmt(from)} · 1 วัน`
  return `${fmt(from)} – ${fmt(to)} · ${days} วัน`
}

const groupByType = (items: SummaryItem[]) => {
  const map = new Map<string, SummaryItem[]>()
  for (const item of items) {
    const list = map.get(item.type) || []
    list.push(item)
    map.set(item.type, list)
  }
  return map
}

const sumItems = (items: SummaryItem[]): number => items.reduce((s, i) => s + i.qty, 0)

function TypeRow({ type, items }: { type: string; items: SummaryItem[] }) {
  const total = sumItems(items)
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ width: 10, height: 10, borderRadius: 2, background: plasmaChartColor(type), flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 600 }}>{type}</span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{total} ถุง</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 18 }}>
        {items.map((item) => (
          <div key={`${item.type}-${item.blood}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 10px', borderRadius: 'var(--radius-full, 99px)',
            background: 'var(--surface-raised, #F4F4F5)', fontSize: 13,
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '1px 7px', borderRadius: 'var(--radius-full, 99px)',
              fontSize: 12, fontWeight: 700,
              background: groupSurface(item.group), color: groupInk(item.group),
            }}>
              {item.blood}
            </span>
            <span style={{ fontWeight: 500 }}>{item.qty}</span>
            <span style={{ color: 'var(--text-secondary)' }}>ถุง</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActionColumn({ label, items, bgColor, textColor, emptyText }: {
  label: string; items: SummaryItem[]; bgColor: string; textColor: string; emptyText: string
}) {
  const byType = groupByType(items)
  const total = sumItems(items)
  return (
    <div style={{ flex: '1 1 300px', minWidth: 0 }}>
      <div style={{
        padding: '10px 16px', borderRadius: 'var(--radius-md, 8px)',
        background: bgColor, color: textColor, fontWeight: 700, fontSize: 14, marginBottom: 12,
      }}>
        {label} · {total} ถุง
      </div>
      {byType.size === 0
        ? <div style={{ padding: '20px 16px', color: 'var(--text-disabled)', fontSize: 13 }}>{emptyText}</div>
        : Array.from(byType.entries()).map(([type, itms]) => <TypeRow key={type} type={type} items={itms} />)
      }
    </div>
  )
}

interface Props { data: MovementResponse }

export default function MovementSummaryCard({ data }: Props) {
  return (
    <div style={{
      background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)',
      padding: 20, marginBottom: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>สรุปตามชนิด · หมู่เลือด</h3>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatRange(data.from, data.to, data.days)}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        <ActionColumn label="นำเข้า" items={data.summary.store}
          bgColor="var(--success-surface, #F0FDF4)" textColor="var(--success-ink, #166534)"
          emptyText="ไม่มีรายการนำเข้าในช่วงนี้" />
        <ActionColumn label="นำออก" items={data.summary.withdraw}
          bgColor="var(--danger-surface, #FEF2F2)" textColor="var(--danger-ink, #991B1B)"
          emptyText="ไม่มีรายการนำออกในช่วงนี้" />
      </div>
    </div>
  )
}
