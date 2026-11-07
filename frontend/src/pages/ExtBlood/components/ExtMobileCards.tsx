// frontend/src/pages/ExtBlood/components/ExtMobileCards.tsx
import { Eye, CheckCircle, PackageOpen, Pencil } from 'lucide-react'
import { formatThaiDate, statusLabel, statusClass, bloodGroupClass } from '../services/extHelpers'
import type { ExtDocument } from '../services/ExtBloodType'
interface Props { documents: ExtDocument[]; onViewDetail: (d: ExtDocument) => void; onApprove: (d: ExtDocument) => void; onExport: (d: ExtDocument) => void; onEdit: (id: string) => void }
export default function ExtMobileCards({ documents, onViewDetail, onApprove, onExport, onEdit }: Props) {
  return (
    <div className="ext-mobile-cards">{documents.map(doc => (
      <div key={doc.id} className="ext-mobile-card" onClick={() => onViewDetail(doc)}>
        <div className="ext-mobile-card-header">
          <span className="ext-mobile-card-docno">{doc.docNumber}</span>
          <span className={`ext-status ${statusClass(doc.status)}`}>{statusLabel(doc.status)}</span>
        </div>
        <div className="ext-mobile-card-body">
          <div className="ext-mobile-card-row"><span className="ext-mobile-card-label">วันที่รับ</span><span>{formatThaiDate(doc.receivedDate)}</span></div>
          <div className="ext-mobile-card-row"><span className="ext-mobile-card-label">สถานที่</span><span className="ext-cell-ellipsis">{doc.source.name}</span></div>
          <div className="ext-mobile-card-row"><span className="ext-mobile-card-label">ชนิด/หมู่</span><span>{doc.bloodProduct.code} <span className={`blood-badge ${bloodGroupClass(doc.bloodGroup)}`} style={{ padding:'1px 6px', fontSize:11 }}>{doc.bloodGroup}</span></span></div>
          <div className="ext-mobile-card-row"><span className="ext-mobile-card-label">ถุง</span><span>{doc.bagRemaining}/{doc.bagCount}</span></div>
        </div>
        <div className="ext-mobile-card-footer" onClick={e => e.stopPropagation()}>
          <button className="ext-action-btn" onClick={() => onViewDetail(doc)}><Eye size={15} /></button>
          {doc.status === 'PENDING' && <button className="ext-action-btn ext-action-btn--success" onClick={() => onApprove(doc)}><CheckCircle size={15} /></button>}
          {doc.status === 'APPROVED' && doc.bagRemaining > 0 && <button className="ext-action-btn ext-action-btn--primary" onClick={() => onExport(doc)}><PackageOpen size={15} /></button>}
          {['DRAFT','APPROVED','REJECTED'].includes(doc.status) && <button className="ext-action-btn" onClick={() => onEdit(doc.id)}><Pencil size={15} /></button>}
        </div>
      </div>
    ))}</div>
  )
}
