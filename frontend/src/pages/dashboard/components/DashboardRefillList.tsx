// frontend/src/pages/dashboard/components/DashboardRefillList.tsx
// การ์ด "ต้องเติมก่อน" — danger + warning ที่ผ่านตัวกรอง เรียง % ของขั้นต่ำน้อยสุด
import { CircleCheck } from 'lucide-react'
import { cellKey, pctLabel, MIN_STATUS, type MinStockStatusItem } from '../../../helpers/minStock'

interface Props {
  items: MinStockStatusItem[]
  onOpen: (i: MinStockStatusItem) => void
}

export default function DashboardRefillList({ items, onOpen }: Props) {
  return (
    <section className="dms-card" aria-labelledby="dms-refill-title">
      <header className="dms-card__head">
        <h3 id="dms-refill-title" className="dms-card__title">ต้องเติมก่อน</h3>
        {items.length > 0 && <span className="dms-card__count">{items.length} รายการ</span>}
      </header>

      {items.length === 0 ? (
        <p className="dms-none dms-none--ok" role="status">
          <CircleCheck size={18} aria-hidden="true" />สต็อกอยู่ในเกณฑ์ปกติทั้งหมด
        </p>
      ) : (
        <ul className="dms-refill">
          {items.map((i) => {
            const { icon: Icon, label } = MIN_STATUS[i.status]
            return (
              <li key={cellKey(i.type, i.group)}>
                <button type="button" className={`dms-refill__item ms-status--${i.status}`} onClick={() => onOpen(i)}>
                  <span className="dms-refill__icon" aria-hidden="true"><Icon size={16} /></span>
                  <span className="dms-refill__body">
                    <span className="dms-refill__name">{i.type} · {i.group}</span>
                    <span className="dms-refill__nums">
                      {i.stock.toLocaleString()} / {(i.minUnits ?? 0).toLocaleString()} unit · {pctLabel(i.pct)}
                    </span>
                  </span>
                  <span className="dms-refill__tag">
                    {i.status === 'danger' ? `ขาด ${i.gap.toLocaleString()}` : label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
