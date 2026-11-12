// frontend/src/pages/ExtBlood/components/ExtTable.tsx
import { Printer,Eye, CheckCircle, PackageOpen, Pencil, Trash2, RotateCcw } from 'lucide-react'
import Button from '../../../components/common/Button'
import { formatThaiDate, statusLabel, statusClass, bloodGroupClass } from '../services/extHelpers'
import { myPending, approvedCount, sortCommittee, canRecall, ROLE_LABEL } from '../services/committeeHelpers'
import type { ExtDocument } from '../services/ExtBloodType'
import ExtRowMenu, { type RowMenuItem } from './ExtRowMenu'
import { useState } from 'react'
import ExtBloodPrint from './ExtBloodPrint'

export interface ExtRowHandlers {
  documents: ExtDocument[]; userId: string; isAdmin: boolean
  onViewDetail: (doc: ExtDocument) => void; onApprove: (doc: ExtDocument) => void; onExport: (doc: ExtDocument) => void
  onEdit: (id: string) => void; onDelete: (doc: ExtDocument) => void; onRecall: (doc: ExtDocument) => void
  onPrint: (doc: ExtDocument) => void

}

/** ปุ่มหลัก 1 ปุ่ม + เมนู ⋯ ตามสถานะเอกสาร */
export function rowActions(d: ExtDocument, h: Omit<ExtRowHandlers, 'documents'>) {
  const mine = myPending(d, h.userId)
  const canExport = d.status === 'APPROVED' && d.bagRemaining > 0
  const canEdit = ['DRAFT', 'REJECTED'].includes(d.status) || (d.status === 'APPROVED' && !canExport)
  const primary = mine ? { icon: <CheckCircle size={14} />, label: 'อนุมัติ', variant: 'success' as const, onClick: () => h.onApprove(d) }
    : canExport ? { icon: <PackageOpen size={14} />, label: 'นำออก', variant: 'outline' as const, onClick: () => h.onExport(d) }
    : canEdit ? { icon: <Pencil size={14} />, label: 'แก้ไข', variant: 'outline' as const, onClick: () => h.onEdit(d.id) }
    : { icon: <Eye size={14} />, label: 'ดู', variant: 'ghost' as const, onClick: () => h.onViewDetail(d) }
  const more: RowMenuItem[] = []
  if (primary.label !== 'ดู') more.push({ icon: <Eye size={15} />, label: 'ดูรายละเอียด', onClick: () => h.onViewDetail(d) })
  if (canExport && primary.label !== 'นำออก') more.push({ icon: <PackageOpen size={15} />, label: 'นำออก', onClick: () => h.onExport(d) })
  if (['DRAFT', 'APPROVED', 'REJECTED'].includes(d.status) && primary.label !== 'แก้ไข') more.push({ icon: <Pencil size={15} />, label: 'แก้ไข', onClick: () => h.onEdit(d.id) })
  if (canRecall(d, h.userId, h.isAdmin)) more.push({ icon: <RotateCcw size={15} />, label: 'ดึงกลับเพื่อแก้ไข', onClick: () => h.onRecall(d) })
  more.push({ icon: <Printer size={15} />, label: 'พิมพ์เอกสาร', onClick: () => h.onPrint(d) })   // ⬅️ ใส่บรรทัดนี้ตรงนี้
  if (d.status === 'DRAFT') more.push({ icon: <Trash2 size={15} />, label: 'ลบเอกสารร่าง', onClick: () => h.onDelete(d), danger: true })
  return { mine, primary, more }
}

export function ExtProgress({ doc, userId }: { doc: ExtDocument; userId: string }) {
  const cm = sortCommittee(doc.committee)
  const mine = myPending(doc, userId)
  return (
    <div className="ext-status-cell">
      <span className={`ext-status ${statusClass(doc.status)}`}>{statusLabel(doc.status)}</span>
      {doc.status === 'PENDING' && cm.length > 0 && (
        <span className="ext-progress" title={cm.map((m) => `${ROLE_LABEL[m.role]}: ${m.user.name} — ${m.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'รอ'}`).join('\n')}>
          <span className="ext-progress__segs">{cm.map((m) => <span key={m.id} className={`ext-progress__seg ${m.status === 'APPROVED' ? 'is-ok' : ''}`} />)}</span>
          อนุมัติ {approvedCount(doc)}/{cm.length}
        </span>
      )}
      {mine && <span className="ext-mine-tag">รอคุณ · {ROLE_LABEL[mine.role]}</span>}
    </div>
  )
}

interface Props extends ExtRowHandlers {
  selectedIds: string[]; onToggleSelect: (id: string) => void; onToggleSelectAll: () => void; isMine: (d: ExtDocument) => boolean
}

export default function ExtTable({ documents, selectedIds, onToggleSelect, onToggleSelectAll, isMine, ...h }: Props) {
  const mineDocs = documents.filter(isMine)
  const showCb = mineDocs.length > 0
  const allSel = showCb && mineDocs.every((d) => selectedIds.includes(d.id))
  const [printDoc, setPrintDoc] = useState<ExtDocument | null>(null)
  return (
    <div className="ext-table-wrap">
      <table className="ext-table">
        <thead><tr>
          {showCb && <th style={{ width: 40 }}><input type="checkbox" aria-label="เลือกทั้งหมดที่รอคุณ" checked={allSel} onChange={onToggleSelectAll} /></th>}
          <th>เลขเอกสาร</th><th>วันที่รับ</th><th>สถานที่</th><th>ชนิด</th><th>หมู่</th><th>คงคลัง</th><th>สถานะ</th><th style={{ width: 150 }}>จัดการ</th>
        </tr></thead>
        <tbody>{documents.map((d) => {
          const { mine, primary, more } = rowActions(d, h)
          const sel = selectedIds.includes(d.id)
          return (
            <tr key={d.id} className={sel ? 'ext-row-selected' : mine ? 'ext-row-mine' : ''}>
              {showCb && <td>{mine ? <input type="checkbox" aria-label={`เลือก ${d.docNumber}`} checked={sel} onChange={() => onToggleSelect(d.id)} /> : null}</td>}
              <td><button className="ext-link" style={{ whiteSpace: 'nowrap' }} onClick={() => h.onViewDetail(d)}>{d.docNumber}</button></td>
              <td style={{ whiteSpace: 'nowrap' }}>{formatThaiDate(d.receivedDate)}</td>
              <td className="ext-cell-ellipsis" title={d.source.name}>{d.source.name}</td>
              <td>{d.bloodProduct.code}</td>
              <td><span className={`blood-badge ${bloodGroupClass(d.bloodGroup)}`} style={{ padding: '2px 8px', fontSize: 12 }}>{d.bloodGroup}</span></td>
              <td style={{ whiteSpace: 'nowrap' }}><b>{d.bagRemaining}</b><span className="ext-muted"> / {d.bagCount} ถุง</span></td>
              <td><ExtProgress doc={d} userId={h.userId} /></td>
              <td><div className="ext-actions" style={{ gap: 6, alignItems: 'center' }}>
                <Button size="sm" variant={primary.variant} icon={primary.icon} onClick={primary.onClick}>{primary.label}</Button>
                <ExtRowMenu items={more} />
              </div></td>
            </tr>
          )
        })}</tbody>
      </table>

      {printDoc && (

        <ExtBloodPrint

          open

          doc={printDoc}

          onClose={() => setPrintDoc(null)}

        />

      )}
    </div>
  )
}
