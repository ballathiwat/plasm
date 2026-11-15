// ============================================================
//  frontend/src/pages/storage/components/StorageSummaryCard.tsx
//  การ์ดสรุปกล่องของฟอร์มจัดเก็บ (aside / แถบสรุปบนจอแคบ)
// ============================================================

import type { ReactNode } from 'react'
import { ClipboardList } from 'lucide-react'
import StatusBadge from '../../../components/shared/StatusBadge'
import { formatThaiDate } from '../../ExtBlood/services/extHelpers'
import { BOX_CAPACITY } from '../../../helpers/rack'

interface Props {
  /** ความครบของแต่ละส่วน: ข้อมูลกล่อง / ตำแหน่ง / สแกนถุง */
  parts: boolean[]
  nextLabel: string
  boxName: string
  type: string
  blood: string
  collectionDate: string
  location: string
  unitCount: number
  actions?: ReactNode
}

export default function StorageSummaryCard({
  parts, nextLabel, boxName, type, blood, collectionDate, location, unitCount, actions,
}: Props) {
  const done = parts.filter(Boolean).length
  const row = (k: string, v?: ReactNode) => (
    <div className="ext-sum__row"><span>{k}</span><span className={v ? '' : 'sto-muted'}>{v || '—'}</span></div>
  )

  return (
    <aside className="ext-sum" aria-label="สรุปกล่อง">
      <div className="ext-sum__head">
        <ClipboardList size={16} color="var(--text-secondary)" />สรุปกล่อง
        <span className="ext-sum__parts">{done}/{parts.length} ส่วน</span>
      </div>
      <div className="ext-sum__bar"><span style={{ width: `${(done / parts.length) * 100}%` }} /></div>

      <div className="sto-sum__label">
        <div className="sto-sum__caption">หมายเลขกล่อง (อัตโนมัติ)</div>
        <div className={`sto-sum__box ${nextLabel ? '' : 'is-empty'}`}>{nextLabel || 'เลือกชนิด + หมู่'}</div>
        {boxName.trim() && <div className="sto-sub">{boxName.trim()}</div>}
      </div>

      <div className="ext-sum__body">
        {row('ชนิด / หมู่เลือด', (type || blood) && (
          <span className="sto-detail__inline">{type || '—'}{blood && <StatusBadge blood={blood} />}</span>
        ))}
        {row('วันที่เก็บ', collectionDate && formatThaiDate(collectionDate))}
        {row('ตำแหน่ง', location)}
        <div className="ext-sum__count">
          <span className="sto-muted">ถุงในกล่อง</span>
          <span className={`ext-sum__num${unitCount ? ' is-on' : ''}`}>{unitCount} <small>/ {BOX_CAPACITY} ถุง</small></span>
        </div>
      </div>

      {actions && <div className="ext-sum__actions">{actions}</div>}
    </aside>
  )
}
