// ============================================================
//  frontend/src/components/shared/TimelineSection.tsx
//  ส่วนของฟอร์มแบบ timeline: วงกลม 32px + เส้นเชื่อม (ครบแล้ว = พื้น primary + ✓)
//  ใช้ร่วมกัน: ExtBloodForm, storage/StorageCreatePage — CSS: .ext-tl* ใน ext-committee.css
// ============================================================

import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import '../../assets/styles/ext-committee.css'

interface Props {
  icon: ReactNode
  title: string
  done: boolean
  hint: string
  aside?: ReactNode
  /** ส่วนสุดท้าย — ไม่วาดเส้นเชื่อมลงไป */
  last?: boolean
  children: ReactNode
}

export default function TimelineSection({ icon, title, done, hint, aside, last, children }: Props) {
  return (
    <section className={`ext-tl ${done ? 'is-done' : ''}`} aria-label={`${title} — ${done ? 'ครบแล้ว' : 'ยังไม่ครบ'}`}>
      <div className="ext-tl__rail">
        <span className="ext-tl__dot">{done ? <Check size={16} strokeWidth={3} /> : icon}</span>
        {!last && <span className="ext-tl__line" />}
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="ext-tl__head">
          <span className="ext-tl__title">{title}</span>
          <span className="ext-tl__hint">{hint}</span>
          {aside && <span className="ext-tl__aside">{aside}</span>}
        </div>
        {children}
      </div>
    </section>
  )
}
