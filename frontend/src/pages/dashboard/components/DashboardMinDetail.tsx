// frontend/src/pages/dashboard/components/DashboardMinDetail.tsx
// Modal รายละเอียดของ 1 คู่ ชนิด × หมู่ (คลิกจากช่องหมู่เลือด)
import { useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import Modal from '../../../components/common/Modal'
import Button from '../../../components/common/Button'
import MinStatusPill from '../../../components/common/MinStatusPill'
import { barWidth, pctLabel, settingsCellPath, type MinStockStatusItem } from '../../../helpers/minStock'

interface Props {
  item: MinStockStatusItem | null
  typeName: string | null
  isAdmin: boolean
  onClose: () => void
}

const DAY_MS = 86_400_000
const daysLeft = (iso: string) => Math.max(Math.ceil((new Date(iso).getTime() - Date.now()) / DAY_MS), 0)

export default function DashboardMinDetail({ item, typeName, isAdmin, onClose }: Props) {
  const navigate = useNavigate()
  if (!item) return null
  const { type, group, stock, minUnits, status, gap, pct, expiringSoon } = item
  const over = minUnits != null ? stock - minUnits : 0

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title={<span className="dms-detail__title">{type} · หมู่ {group} <MinStatusPill status={status} /></span>}
      footer={<>
        <Button variant="ghost" onClick={onClose}>ปิด</Button>
        {isAdmin && (
          <Button icon={<Pencil size={14} />} onClick={() => navigate(settingsCellPath(type, group))}>
            แก้ค่าขั้นต่ำของช่องนี้
          </Button>
        )}
      </>}
    >
      {typeName && <p className="dms-detail__name">{typeName}</p>}

      <dl className="dms-detail__stats">
        <div><dt>คงเหลือ</dt><dd>{stock.toLocaleString()}<small> unit</small></dd></div>
        <div><dt>ขั้นต่ำ</dt><dd>{minUnits == null ? '—' : <>{minUnits.toLocaleString()}<small> unit</small></>}</dd></div>
        <div className={`ms-status--${status}`}>
          {minUnits == null
            ? <><dt>ขาด</dt><dd>—</dd></>
            : gap > 0
              ? <><dt>ขาด</dt><dd className="dms-detail__gap">{gap.toLocaleString()}<small> unit</small></dd></>
              : <><dt>เกินขั้นต่ำ</dt><dd>{over.toLocaleString()}<small> unit</small></dd></>}
        </div>
      </dl>

      {minUnits == null ? (
        <p className="dms-detail__hint">ยังไม่ได้ตั้งค่าขั้นต่ำของช่องนี้ — ระบบจึงไม่แจ้งเตือนสต็อกต่ำ</p>
      ) : (
        <div className={`dms-detail__progress ms-status--${status}`}>
          <span className="plasm-ms-bar plasm-ms-bar--lg" aria-hidden="true">
            <span className="plasm-ms-bar__fill" style={{ display: 'block', width: barWidth(pct) }} />
            <span className="plasm-ms-bar__min" />
          </span>
          <p className="dms-detail__pct"><strong>{pctLabel(pct)}</strong> ของขั้นต่ำ</p>
        </div>
      )}

      {/* ระบบยังไม่มีวันหมดอายุของ unit → API ส่ง expiringSoon เป็น [] ส่วนนี้จึงยังไม่แสดง */}
      {expiringSoon.length > 0 && (
        <div className="dms-detail__expiring">
          <h4>ถุงที่ใกล้หมดอายุ (ภายใน 7 วัน)</h4>
          <ul>
            {expiringSoon.map((u) => {
              const d = daysLeft(u.expiresAt)
              return (
                <li key={u.unitNumber}>
                  <span className="dms-detail__unit">{u.unitNumber}</span>
                  <span className={d <= 2 ? 'is-urgent' : undefined}>หมดอายุใน {d} วัน</span>
                </li>
              )
            })}
          </ul>
          <p className="dms-detail__hint">
            ถ้าไม่ได้ใช้ก่อนหมดอายุ คงเหลือจะเหลือ {Math.max(stock - expiringSoon.length, 0).toLocaleString()} unit
          </p>
        </div>
      )}
    </Modal>
  )
}
