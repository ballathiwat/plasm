// frontend/src/pages/dashboard/components/DashboardMinList.tsx
// การ์ด "สต็อกเทียบขั้นต่ำ" (แบบ D — พับได้ เน้นที่มีปัญหา)
//   header + ป้ายนับ → ตัวกรอง (กดค้นหา) → accordion ชนิดเลือดละ 1 แถว เรียงจากวิกฤตที่สุด
import { Link } from 'react-router-dom'
import { CircleCheck, Settings2 } from 'lucide-react'
import MinStatusPill from '../../../components/common/MinStatusPill'
import { MIN_STATUS, SETTINGS_MIN_STOCK_PATH } from '../../../helpers/minStock'
import DashboardMinFilters from './DashboardMinFilters'
import DashboardMinRow from './DashboardMinRow'
import type { DashboardState } from '../services/useDashboard'

interface Props {
  d: DashboardState
  isAdmin: boolean
}

const COUNTED = ['danger', 'warning', 'normal'] as const
const SHOW_CODES = 4

export default function DashboardMinList({ d, isAdmin }: Props) {
  const idleLabel = d.idleCodes.length > SHOW_CODES
    ? `${d.idleCodes.slice(0, SHOW_CODES).join(', ')} +${d.idleCodes.length - SHOW_CODES}`
    : d.idleCodes.join(', ')

  return (
    <section ref={d.cardRef} className="dms-card" aria-labelledby="dms-list-title">
      <header className="dms-card__head dms-card__head--top">
        <div>
          <h3 id="dms-list-title" className="dms-card__title">สต็อกเทียบขั้นต่ำ</h3>
          <p className="dms-card__desc">
            คงเหลือ / ขั้นต่ำ (unit) · ที่วิกฤตกว่าอยู่บน · แตะแถวเพื่อดูแยกตามหมู่เลือด
          </p>
        </div>
        {isAdmin && (
          <Link to={SETTINGS_MIN_STOCK_PATH} className="dms-link">
            <Settings2 size={14} aria-hidden="true" />ตั้งค่าขั้นต่ำ
          </Link>
        )}
      </header>

      <div className="dms-counts">
        {COUNTED.map((s) => (
          <MinStatusPill key={s} status={s} label={`${MIN_STATUS[s].label} ${d.counts[s].toLocaleString()}`} />
        ))}
        <span className="dms-legend-line">ต่ำกว่าขั้นต่ำ = น้อยกว่า 100% · ใกล้ต่ำ = 100–120%</span>
      </div>

      <DashboardMinFilters
        types={d.types}
        groups={d.groups}
        draft={d.draft}
        filters={d.filters}
        isDirty={d.isDirty}
        onDraft={d.patchDraft}
        onSearch={d.search}
        onApplyNow={d.applyNow}
        onReset={d.resetFilters}
      />

      {d.rows.length === 0 ? (
        <p className="dms-none dms-none--ok" role="status">
          <CircleCheck size={18} aria-hidden="true" />
          {d.isFiltered
            ? `${d.filters.onlyDanger ? 'ไม่มีรายการที่ต่ำกว่าขั้นต่ำ' : 'ไม่พบรายการ'} · ตามตัวกรองที่เลือก`
            : 'ไม่มีรายการที่ต้องแสดง'}
        </p>
      ) : (
        <ul className="dms-rows">
          {d.rows.map((r) => (
            <DashboardMinRow
              key={r.type.code}
              row={r}
              open={d.isOpen(r)}
              passes={d.passes}
              highlight={d.highlight}
              onToggle={() => d.toggleRow(r)}
              onOpen={d.openDetail}
            />
          ))}
        </ul>
      )}

      {(d.rows.length > 0 || d.idleCodes.length > 0) && (
        <footer className="dms-card__foot">
          {d.idleCodes.length > 0 && (
            <button type="button" className="dms-textbtn" aria-expanded={d.showIdle} onClick={() => d.setShowIdle(!d.showIdle)}>
              {d.showIdle ? 'ซ่อน' : 'แสดง'}ชนิดที่ยังไม่ตั้งค่า ({idleLabel})
            </button>
          )}
          {d.rows.length > 0 && (
            <span className="dms-card__foot-end">
              <button type="button" className="dms-textbtn" onClick={() => d.setAllOpen(true)}>กางทั้งหมด</button>
              <span aria-hidden="true">/</span>
              <button type="button" className="dms-textbtn" onClick={() => d.setAllOpen(false)}>พับทั้งหมด</button>
            </span>
          )}
        </footer>
      )}
    </section>
  )
}
