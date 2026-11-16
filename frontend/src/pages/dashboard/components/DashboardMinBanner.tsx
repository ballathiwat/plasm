// frontend/src/pages/dashboard/components/DashboardMinBanner.tsx
// Banner ด่วน — แสดงเฉพาะเมื่อมีคู่ ชนิด × หมู่ ที่ต่ำกว่าขั้นต่ำ
import { ArrowDown, OctagonAlert } from 'lucide-react'
import Button from '../../../components/common/Button'
import { cellKey, type MinStockStatusItem } from '../../../helpers/minStock'

interface Props {
  /** รายการ danger เรียงวิกฤตที่สุดก่อน */
  items: MinStockStatusItem[]
  onView: () => void
}

const SHOW = 4

export default function DashboardMinBanner({ items, onView }: Props) {
  if (items.length === 0) return null
  const head = items.slice(0, SHOW)
  const rest = items.length - head.length

  return (
    <div className="dms-banner ms-status--danger" role="alert">
      <span className="dms-banner__icon" aria-hidden="true"><OctagonAlert size={20} /></span>
      <div className="dms-banner__body">
        <p className="dms-banner__title">
          ด่วน: ต่ำกว่าขั้นต่ำ {items.length} รายการ — ควรเติมสต็อกโดยเร็ว
        </p>
        <p className="dms-banner__sub">
          {head.map((i, idx) => (
            <span key={cellKey(i.type, i.group)}>
              {idx > 0 && ' · '}
              <strong>{i.type} {i.group}</strong> ขาด {i.gap.toLocaleString()} unit
            </span>
          ))}
          {rest > 0 && <span> · …และอีก {rest} รายการ</span>}
        </p>
      </div>
      <Button variant="danger" size="sm" iconRight={<ArrowDown size={14} />} onClick={onView}>
        ดูรายการ
      </Button>
    </div>
  )
}
