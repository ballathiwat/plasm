// frontend/src/pages/ExtBlood/components/ExtBatchBar.tsx
import { CheckCircle, X } from 'lucide-react'
interface Props { count: number; onApprove: () => void; onClear: () => void }
export default function ExtBatchBar({ count, onApprove, onClear }: Props) {
  return (
    <div className="ext-batch-bar">
      <span className="ext-batch-count">เลือก {count} รายการ</span>
      <div className="ext-batch-actions">
        <button className="plasm-btn plasm-btn--success plasm-btn--sm" onClick={onApprove}><CheckCircle size={16} /> อนุมัติ</button>
        <button className="ext-batch-clear" onClick={onClear}><X size={16} /> ยกเลิก</button>
      </div>
    </div>
  )
}
