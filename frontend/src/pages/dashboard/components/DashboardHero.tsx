// frontend/src/pages/dashboard/components/DashboardHero.tsx

import { useNavigate } from 'react-router-dom'
import { Package, PackageOpen } from 'lucide-react'
import { useAuth } from '../../../Routes/AuthProtected'
import { sumBlood } from '../services/DashboardType'
import type { DailyData } from '../services/DashboardType'

interface Props {
  total: number
  dailyData: DailyData[]
}

export default function DashboardHero({ total, dailyData }: Props) {
  const navigate = useNavigate()
  const { user } = useAuth()

  // หาข้อมูลวันนี้จาก dailyData (entry สุดท้าย = วันนี้)
  const today = dailyData.length > 0 ? dailyData[dailyData.length - 1] : null
  const todayStored = today ? sumBlood(today.store) : 0
  const todayWithdrawn = today ? sumBlood(today.withdraw) : 0

  return (
    <section className="hero">
      <div className="hero__circle-1" />
      <div className="hero__circle-2" />

      <div className="hero__content">
        <p className="hero__greeting">สวัสดี, {user.name || 'ผู้ดูแลระบบ'}</p>
        <p className="hero__title">
          สต็อกพลาสมารวม {total.toLocaleString()} units
        </p>
        <p className="hero__updated">
          อัปเดตล่าสุด{' '}
          {new Date().toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          น. · วันนี้: นำเข้า{' '}
          <span style={{ fontWeight: 600 }}>+{todayStored}</span> · นำออก{' '}
          <span style={{ fontWeight: 600 }}>-{todayWithdrawn}</span>
        </p>
      </div>

      <div className="hero__actions">
        <button
          className="hero__btn-primary"
          onClick={() => navigate('/storage')}
        >
          <Package size={14} /> จัดเก็บกล่องใหม่
        </button>
        <button
          className="hero__btn-outline"
          onClick={() => navigate('/withdraw')}
        >
          <PackageOpen size={14} /> นำออก
        </button>
      </div>
    </section>
  )
}