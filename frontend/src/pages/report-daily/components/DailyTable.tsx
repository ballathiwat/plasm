// frontend/src/pages/report-daily/components/DailyTable.tsx

import type { MovementResponse, MovementBucket } from '../services/DailyReportType'
import { sumBucketAction, groupColor } from '../services/DailyReportType'

const bucketLabel = (b: MovementBucket, gran: string): string => {
  const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(`${iso}T00:00:00+07:00`).toLocaleDateString('th-TH', opts)
  if (gran === 'day') return fmt(b.start, { day: 'numeric', month: 'short' })
  if (gran === 'week') {
    const s = fmt(b.start, { day: 'numeric', month: 'short' })
    const e = new Date(`${b.end}T00:00:00+07:00`).getDate()
    return `${s}–${e}`
  }
  return fmt(b.start, { month: 'short', year: '2-digit' })
}

const colLabel = (gran: string): string =>
  gran === 'day' ? 'วันที่' : gran === 'week' ? 'สัปดาห์' : 'เดือน'

function Cell({ v }: { v: number }) {
  return (
    <span style={{
      textAlign: 'center', fontVariantNumeric: 'tabular-nums',
      color: v ? 'var(--text-primary)' : 'var(--text-disabled)',
    }}>
      {v || '-'}
    </span>
  )
}

interface Props { data: MovementResponse }

export default function DailyTable({ data }: Props) {
  const { buckets, groups, granularity, totals } = data
  const span = groups.length + 1
  const cols = `100px repeat(${span}, minmax(40px, 1fr)) repeat(${span}, minmax(40px, 1fr))`
  const minWidth = Math.max(780, 70 + span * 2 * 48)

  const STORE_COLOR = '#16A34A'
  const WITHDRAW_COLOR = '#DC2626'

  const bucketStoreTotal = (b: MovementBucket) =>
    groups.reduce((s, g) => s + sumBucketAction(b.store, g), 0)
  const bucketWithdrawTotal = (b: MovementBucket) =>
    groups.reduce((s, g) => s + sumBucketAction(b.withdraw, g), 0)

  const grandStore = Object.values(totals.store).reduce((s, v) => s + v, 0)
  const grandWithdraw = Object.values(totals.withdraw).reduce((s, v) => s + v, 0)

  return (
    <div style={{
      background: 'var(--surface, #fff)', border: '1px solid var(--border, #E4E4E7)',
      borderRadius: 'var(--radius-lg, 10px)', boxShadow: 'var(--shadow-sm)', padding: 20,
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>ตาราง แยกหมู่เลือด (ถุง)</h3>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth, fontSize: 13 }}>
          {/* Group header */}
          <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 4, padding: '6px 0', fontSize: 12, fontWeight: 700 }}>
            <span />
            <span style={{ gridColumn: `span ${span}`, textAlign: 'center', color: STORE_COLOR, background: 'var(--success-surface, #F0FDF4)', borderRadius: 6, padding: '4px 0' }}>
              นำเข้า (ถุง)
            </span>
            <span style={{ gridColumn: `span ${span}`, textAlign: 'center', color: WITHDRAW_COLOR, background: 'var(--danger-surface, #FEF2F2)', borderRadius: 6, padding: '4px 0' }}>
              นำออก (ถุง)
            </span>
          </div>

          {/* Column header */}
          <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 4, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
            <span>{colLabel(granularity)}</span>
            {groups.map((g) => <span key={`hs-${g}`} style={{ textAlign: 'center', color: groupColor(g) }}>{g}</span>)}
            <span style={{ textAlign: 'center' }}>รวม</span>
            {groups.map((g) => <span key={`hw-${g}`} style={{ textAlign: 'center', color: groupColor(g) }}>{g}</span>)}
            <span style={{ textAlign: 'center' }}>รวม</span>
          </div>

          {/* Rows */}
          {buckets.map((b, i) => {
            const st = bucketStoreTotal(b)
            const wd = bucketWithdrawTotal(b)
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: cols, gap: 4, padding: '9px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{bucketLabel(b, granularity)}</span>
                {groups.map((g) => <Cell key={`s-${g}`} v={sumBucketAction(b.store, g)} />)}
                <span style={{ textAlign: 'center', fontWeight: 700, color: st ? STORE_COLOR : 'var(--text-disabled)' }}>{st || '-'}</span>
                {groups.map((g) => <Cell key={`w-${g}`} v={sumBucketAction(b.withdraw, g)} />)}
                <span style={{ textAlign: 'center', fontWeight: 700, color: wd ? WITHDRAW_COLOR : 'var(--text-disabled)' }}>{wd || '-'}</span>
              </div>
            )
          })}

          {/* Totals row */}
          <div style={{
            display: 'grid', gridTemplateColumns: cols, gap: 4, padding: '10px 0', fontWeight: 700, alignItems: 'center',
            background: 'var(--surface-raised, #F4F4F5)', borderRadius: '0 0 var(--radius-md, 8px) var(--radius-md, 8px)',
          }}>
            <span style={{ paddingLeft: 4 }}>รวมทั้งช่วง</span>
            {groups.map((g) => <Cell key={`ts-${g}`} v={totals.store[g] || 0} />)}
            <span style={{ textAlign: 'center', color: grandStore ? STORE_COLOR : 'var(--text-disabled)' }}>{grandStore || '-'}</span>
            {groups.map((g) => <Cell key={`tw-${g}`} v={totals.withdraw[g] || 0} />)}
            <span style={{ textAlign: 'center', color: grandWithdraw ? WITHDRAW_COLOR : 'var(--text-disabled)' }}>{grandWithdraw || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
