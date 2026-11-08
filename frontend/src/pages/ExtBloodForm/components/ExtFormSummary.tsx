// frontend/src/pages/ExtBloodForm/components/ExtFormSummary.tsx — การ์ดสรุป (sticky)
import type { ReactNode } from 'react'
import { ClipboardList } from 'lucide-react'
import { formatThaiDate } from '../../ExtBlood/services/extHelpers'

interface Props {
  parts: boolean[]; date: string; source?: string; product?: string; bloodGroup?: string
  storage?: string; boxLabel?: string; bags: string[]; files: number; actions?: ReactNode
}

export default function ExtFormSummary({ parts, date, source, product, bloodGroup, storage, boxLabel, bags, files, actions }: Props) {
  const done = parts.filter(Boolean).length
  const row = (k: string, v?: ReactNode) => <div className="ext-sum__row"><span>{k}</span><span className={v ? '' : 'ext-muted'}>{v || '—'}</span></div>
  return (
    <aside className="ext-sum" aria-label="สรุปข้อมูล">
      <div className="ext-sum__head"><ClipboardList size={16} color="var(--text-secondary)" />สรุปข้อมูล<span className="ext-sum__parts">{done}/{parts.length} ส่วน</span></div>
      <div className="ext-sum__bar"><span style={{ width: `${(done / parts.length) * 100}%` }} /></div>
      <div className="ext-sum__body">
        {row('วันที่รับ', date && formatThaiDate(date))}
        {row('สถานที่ส่ง', source)}
        {row('ชนิด / หมู่เลือด', (product || bloodGroup) && `${product || '—'} · ${bloodGroup || '—'}`)}
        {row('ตำแหน่งจัดเก็บ', storage)}
        {row('หมายเลขกล่อง', boxLabel && <span style={{ fontFamily: 'var(--font-mono)' }}>{boxLabel}</span>)}
        {row('ไฟล์แนบ', files ? `${files} ไฟล์` : '')}
        {row('ถุงเลือด', <b style={{ color: bags.length ? 'var(--primary)' : undefined }}>{bags.length} ถุง</b>)}
        {bags.length > 0 && (
          <div className="ext-sum__bags">
            {bags.slice(-6).map((b) => <span key={b} className="ext-sum__bag">{b}</span>)}
            {bags.length > 6 && <span className="ext-sum__bag" style={{ background: 'var(--surface-raised)', color: 'var(--text-secondary)' }}>+{bags.length - 6} ถุงก่อนหน้า</span>}
          </div>
        )}
      </div>
      {actions && <div className="ext-sum__actions">{actions}</div>}
    </aside>
  )
}
