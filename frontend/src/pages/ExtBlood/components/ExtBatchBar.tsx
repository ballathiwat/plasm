// frontend/src/pages/ExtBlood/components/ExtBatchBar.tsx

import { CheckCircle, X } from 'lucide-react'
import Button from '../../../components/common/Button'

interface Props { count: number; onApprove: () => void; onClear: () => void }

export default function ExtBatchBar({ count, onApprove, onClear }: Props) {
  return (
    <div className="ext-batch-bar">
      <span className="ext-batch-count">เลือก {count} รายการ</span>
      <div className="ext-batch-actions">
        <Button variant="success" size="sm" icon={<CheckCircle size={16} />} onClick={onApprove}>
          อนุมัติ
        </Button>
        <Button variant="ghost" size="sm" icon={<X size={16} />} onClick={onClear}>
          ยกเลิก
        </Button>
      </div>
    </div>
  )
}
