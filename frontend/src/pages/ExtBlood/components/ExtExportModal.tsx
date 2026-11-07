// frontend/src/pages/ExtBlood/components/ExtExportModal.tsx
// TODO: implement full export modal
import type { ExtDocument, ExtExportReason } from '../services/ExtBloodType'
interface Props { doc: ExtDocument; exportReasons: ExtExportReason[]; onExport: (docId: string, bagIds: string[], reasonId: string, date: string, note: string, pin: string) => Promise<void>; onClose: () => void }
export default function ExtExportModal({ onClose }: Props) {
  return (
    <div className="ext-modal-overlay" onClick={onClose}>
      <div className="ext-modal ext-modal--md" onClick={e => e.stopPropagation()}>
        <div className="ext-modal-header"><h3 className="ext-modal-title">นำออก</h3><button className="ext-modal-close" onClick={onClose}>✕</button></div>
        <div className="ext-modal-body"><p>นำออก — อยู่ระหว่างพัฒนา</p></div>
      </div>
    </div>
  )
}
