// frontend/src/pages/dashboard/components/DashboardMinSummary.tsx
// การ์ดสรุป 3 ใบ: ต่ำกว่าขั้นต่ำ / ใกล้ต่ำ / ปกติ — นับ 1 รายการต่อ 1 คู่ ชนิด × หมู่
import { MIN_STATUS, type MinStatus } from '../../../helpers/minStock'

interface Props {
  counts: Record<MinStatus, number>
  onlyDanger: boolean
  onToggleDanger: () => void
}

const NOTE: Record<'warning' | 'normal', string> = {
  warning: '100–120% ของขั้นต่ำ',
  normal: 'มากกว่า 120% ของขั้นต่ำ',
}

export default function DashboardMinSummary({ counts, onlyDanger, onToggleDanger }: Props) {
  const body = (s: 'danger' | 'warning' | 'normal', note: string) => {
    const { icon: Icon, label } = MIN_STATUS[s]
    return (
      <>
        <span className="dms-sum__head">
          <span className="dms-sum__icon" aria-hidden="true"><Icon size={18} /></span>
          <span className="dms-sum__label">{label}</span>
        </span>
        <span className="dms-sum__value">{counts[s].toLocaleString()}<span className="dms-sum__unit"> รายการ</span></span>
        <span className="dms-sum__note">{note}</span>
      </>
    )
  }

  return (
    <div className="dms-summary">
      <button
        type="button"
        className="dms-sum dms-sum--btn ms-status--danger"
        aria-pressed={onlyDanger}
        aria-label={`ต่ำกว่าขั้นต่ำ ${counts.danger} รายการ — ${onlyDanger ? 'กำลังกรองเฉพาะรายการนี้ กดเพื่อแสดงทั้งหมด' : 'กดเพื่อกรองเฉพาะรายการนี้'}`}
        onClick={onToggleDanger}
      >
        {body('danger', onlyDanger ? 'แสดงทั้งหมด' : 'กรองเฉพาะนี้')}
      </button>
      {(['warning', 'normal'] as const).map((s) => (
        <div key={s} className={`dms-sum ms-status--${s}`}>{body(s, NOTE[s])}</div>
      ))}
    </div>
  )
}
