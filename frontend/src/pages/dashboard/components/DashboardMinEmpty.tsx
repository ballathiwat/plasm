// frontend/src/pages/dashboard/components/DashboardMinEmpty.tsx
// Empty state — ยังไม่มีค่าขั้นต่ำเลยทั้งระบบ (แทนการ์ดสต็อกเทียบขั้นต่ำ)
import { useNavigate } from 'react-router-dom'
import { Gauge } from 'lucide-react'
import Button from '../../../components/common/Button'
import { SETTINGS_MIN_STOCK_PATH } from '../../../helpers/minStock'

export default function DashboardMinEmpty({ isAdmin }: { isAdmin: boolean }) {
  const navigate = useNavigate()
  return (
    <section className="dms-card dms-empty">
      <span className="dms-empty__icon" aria-hidden="true"><Gauge size={28} /></span>
      <h3 className="dms-empty__title">ยังไม่ได้ตั้งค่าสต็อกขั้นต่ำ</h3>
      <p className="dms-empty__desc">
        กำหนด unit ขั้นต่ำแยกตามชนิดเลือดและหมู่เลือด แล้วแดชบอร์ดจะแสดงสถานะสต็อกและแจ้งเตือนเมื่อสต็อกต่ำ
        {!isAdmin && ' — ติดต่อผู้ดูแลระบบเพื่อตั้งค่า'}
      </p>
      {isAdmin && (
        <Button icon={<Gauge size={14} />} onClick={() => navigate(SETTINGS_MIN_STOCK_PATH)}>ไปตั้งค่าขั้นต่ำ</Button>
      )}
    </section>
  )
}
