// frontend/src/pages/ExtBlood/components/ExtTable.tsx
import { Eye, CheckCircle, PackageOpen, Pencil, Trash2 } from 'lucide-react'
import { formatThaiDate, statusLabel, statusClass, bloodGroupClass } from '../services/extHelpers'
import type { ExtDocument } from '../services/ExtBloodType'
import type { TabKey } from '../services/useExtBlood'

interface Props {
  documents: ExtDocument[]; selectedIds: string[]
  onToggleSelect: (id: string) => void; onToggleSelectAll: () => void
  onViewDetail: (doc: ExtDocument) => void; onApprove: (doc: ExtDocument) => void
  onExport: (doc: ExtDocument) => void; onDelete: (id: string) => void
  onEdit: (id: string) => void; activeTab: TabKey
}

export default function ExtTable({ documents, selectedIds, onToggleSelect, onToggleSelectAll, onViewDetail, onApprove, onExport, onDelete, onEdit, activeTab }: Props) {
  const showCb = activeTab === 'PENDING' || activeTab === 'ALL'
  const pending = documents.filter(d => d.status === 'PENDING')
  const allSel = pending.length > 0 && pending.every(d => selectedIds.includes(d.id))
  return (
    <div className="ext-table-wrap">
      <table className="ext-table">
        <thead><tr>
          {showCb && <th style={{ width: 40 }}><input type="checkbox" checked={allSel} onChange={onToggleSelectAll} /></th>}
          <th>เลขเอกสาร</th><th>วันที่รับ</th><th>สถานที่</th><th>ชนิด</th><th>หมู่</th><th>ถุง</th><th>สถานะ</th><th style={{ width: 120 }}>จัดการ</th>
        </tr></thead>
        <tbody>{documents.map(doc => (
          <tr key={doc.id} className={selectedIds.includes(doc.id) ? 'ext-row-selected' : ''}>
            {showCb && <td>{doc.status === 'PENDING' ? <input type="checkbox" checked={selectedIds.includes(doc.id)} onChange={() => onToggleSelect(doc.id)} /> : <span />}</td>}
            <td><button className="ext-link" onClick={() => onViewDetail(doc)}>{doc.docNumber}</button></td>
            <td>{formatThaiDate(doc.receivedDate)}</td>
            <td className="ext-cell-ellipsis" title={doc.source.name}>{doc.source.name}</td>
            <td>{doc.bloodProduct.code}</td>
            <td><span className={`blood-badge ${bloodGroupClass(doc.bloodGroup)}`} style={{ padding: '2px 8px', fontSize: 12 }}>{doc.bloodGroup}</span></td>
            <td>{doc.bagRemaining}/{doc.bagCount}</td>
            <td><span className={`ext-status ${statusClass(doc.status)}`}>{statusLabel(doc.status)}</span></td>
            <td><div className="ext-actions">
              <button className="ext-action-btn" title="ดู" onClick={() => onViewDetail(doc)}><Eye size={15} /></button>
              {doc.status === 'PENDING' && <button className="ext-action-btn ext-action-btn--success" title="อนุมัติ" onClick={() => onApprove(doc)}><CheckCircle size={15} /></button>}
              {doc.status === 'APPROVED' && doc.bagRemaining > 0 && <button className="ext-action-btn ext-action-btn--primary" title="นำออก" onClick={() => onExport(doc)}><PackageOpen size={15} /></button>}
              {['DRAFT','APPROVED','REJECTED'].includes(doc.status) && <button className="ext-action-btn" title="แก้ไข" onClick={() => onEdit(doc.id)}><Pencil size={15} /></button>}
              {doc.status === 'DRAFT' && <button className="ext-action-btn ext-action-btn--danger" title="ลบ" onClick={() => onDelete(doc.id)}><Trash2 size={15} /></button>}
            </div></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}
