// frontend/src/pages/report-daily/components/ReportKpis.tsx

import { ArrowDownToLine, ArrowUpFromLine, Scale } from 'lucide-react'
import type { MovementResponse } from '../services/DailyReportType'

interface Props { data: MovementResponse }

export default function ReportKpis({ data }: Props) {
  const { totals } = data
  const net = totals.in - totals.out
  const fmt = (n: number) => n.toLocaleString('th-TH')

  const cards: {
    icon: React.ReactNode; label: string; value: string; suffix: string
    iconBg: string; iconColor: string; valueColor?: string
  }[] = [
    {
      icon: <ArrowDownToLine size={20} />, label: 'นำเข้า',
      value: fmt(totals.in), suffix: ' ถุง',
      iconBg: 'var(--success-surface, #F0FDF4)', iconColor: 'var(--success-ink, #166534)',
    },
    {
      icon: <ArrowUpFromLine size={20} />, label: 'นำออก',
      value: fmt(totals.out), suffix: ' ถุง',
      iconBg: 'var(--danger-surface, #FEF2F2)', iconColor: 'var(--danger-ink, #991B1B)',
    },
    {
      icon: <Scale size={20} />, label: 'สุทธิ',
      value: `${net > 0 ? '+' : ''}${fmt(net)}`, suffix: ' ถุง',
      iconBg: 'var(--surface-raised, #F4F4F5)', iconColor: 'var(--text-secondary)',
      valueColor: net > 0 ? 'var(--success-ink, #166534)' : net < 0 ? 'var(--danger-ink, #991B1B)' : undefined,
    },
  ]

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 12, marginBottom: 16,
    }}>
      {cards.map((c) => (
        <div key={c.label} style={{
          background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
          borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)',
          padding: 16, display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-md, 8px)',
            background: c.iconBg, color: c.iconColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>{c.icon}</div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: c.valueColor }}>
              {c.value}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)' }}>{c.suffix}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
