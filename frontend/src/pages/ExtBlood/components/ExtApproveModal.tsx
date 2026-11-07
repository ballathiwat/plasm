// frontend/src/pages/ExtBlood/components/ExtApproveModal.tsx
// TODO: implement full approve modal
import type { ExtDocument } from '../services/ExtBloodType'
interface Props { doc: ExtDocument | null; selectedIds: string[]; onApprove: (id: string, pin: string) => Promise<void>; onReject: (id: string, r: string, pin: string) => Promise<void>; onBatchApprove: (pin: string) => Promise<void>; onBatchReject: (r: string, pin: string) => Promise<void>; onClose: () => void }
export default function ExtApproveModal({ onClose }: Props) {
  return (
    <div className="ext-modal-overlay" onClick={onClose}>
      <div className="ext-modal ext-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="ext-modal-header"><h3 className="ext-modal-title">อนุมัติ</h3><button className="ext-modal-close" onClick={onClose}>✕</button></div>
        <div className="ext-modal-body"><p>อนุมัติ — อยู่ระหว่างพัฒนา</p></div>
      </div>
    </div>
  )
}
