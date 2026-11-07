// frontend/src/pages/ExtBlood/components/ExtEmptyState.tsx
import { Inbox } from 'lucide-react'
export default function ExtEmptyState() {
  return (
    <div className="ext-empty">
      <Inbox size={48} strokeWidth={1.2} color="var(--text-disabled)" />
      <p className="ext-empty-text">ไม่พบรายการ</p>
      <p className="ext-empty-hint">ลองเปลี่ยนตัวกรองหรือเพิ่มรายการใหม่</p>
    </div>
  )
}
