// ============================================================
//  src/pages/map/components/MapSummaryCards.tsx
//  การ์ดสรุป 2 ใบของแท็บ "เก่าสุด / ใหม่สุด": ภายใน / ภายนอก
// ============================================================

import type { ReactNode } from 'react'
import { Truck, Warehouse } from 'lucide-react'
import type { ExtStockTotals } from '../services/MapType'

interface Props {
  inBoxes: number
  inUnits: number
  /** null = ยังโหลดข้อมูลภายนอกไม่สำเร็จ */
  ext: ExtStockTotals | null
}

const num = (n: number) => n.toLocaleString('th-TH')

function Card({ mod, icon, label, children }: { mod: 'in' | 'ex'; icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="map-summary__card">
      <span className={`map-summary__icon map-summary__icon--${mod}`} aria-hidden="true">
        {icon}
      </span>
      <div className="map-summary__body">
        <div className="map-summary__label">{label}</div>
        <div className="map-summary__value">{children}</div>
      </div>
    </div>
  )
}

export default function MapSummaryCards({ inBoxes, inUnits, ext }: Props) {
  return (
    <div className="map-summary">
      <Card mod="in" icon={<Warehouse size={20} />} label="ภายใน · กล่องพลาสมา">
        <b>{num(inBoxes)}</b> กล่อง <span className="map-summary__sep">·</span> <b>{num(inUnits)}</b> units
      </Card>
      <Card mod="ex" icon={<Truck size={20} />} label="ภายนอก · รับจากภายนอก">
        {ext ? (
          <>
            <b>{num(ext.boxes)}</b> กล่อง <span className="map-summary__sep">·</span> <b>{num(ext.bags)}</b> ถุง
          </>
        ) : (
          <span className="map-summary__pending">–</span>
        )}
      </Card>
    </div>
  )
}
