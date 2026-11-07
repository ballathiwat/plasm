// frontend/src/pages/ExtBlood/components/ExtDetailModal.tsx
// TODO: implement full detail modal
import type { ExtDocument } from '../services/ExtBloodType'
export default function ExtDetailModal({ doc, onClose }: { doc: ExtDocument; onClose: () => void }) {
  return (
    <div className="ext-modal-overlay" onClick={onClose}>
      <div className="ext-modal ext-modal--lg" onClick={e => e.stopPropagation()}>
        <div className="ext-modal-header"><h3 className="ext-modal-title">{doc.docNumber}</h3><button className="ext-modal-close" onClick={onClose}>✕</button></div>
        <div className="ext-modal-body"><p>รายละเอียด — อยู่ระหว่างพัฒนา</p></div>
        <div className="ext-modal-footer"><button className="plasm-btn plasm-btn--secondary" onClick={onClose}>ปิด</button></div>
      </div>
    </div>
  )
}
