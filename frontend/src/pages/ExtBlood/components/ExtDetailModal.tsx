// frontend/src/pages/ExtBlood/components/ExtDetailModal.tsx

import { FileText, Paperclip, Clock, Users } from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { formatThaiDate, formatThaiDateTime, statusLabel, statusClass, bloodGroupClass } from '../services/extHelpers'
import { sortCommittee, ROLE_LABEL } from '../services/committeeHelpers'
import type { ExtDocument } from '../services/ExtBloodType'

const CM_LABEL = { DRAFT: 'ยังไม่ส่ง', PENDING: 'รออนุมัติ', APPROVED: 'อนุมัติแล้ว', REJECTED: 'ไม่อนุมัติ' } as const

function Row({ label, value, children, className }: { label: string; value?: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={`ext-detail-row ${className || ''}`}>
      <span className="ext-detail-label">{label}</span>
      <span className="ext-detail-value">{children ?? value}</span>
    </div>
  )
}

export default function ExtDetailModal({ doc, onClose }: { doc: ExtDocument; onClose: () => void }) {
  const cm = sortCommittee(doc.committee)
  return (
    <Modal open onClose={onClose} size="lg"
      title={<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{doc.docNumber}<span className={`ext-status ${statusClass(doc.status)}`}>{statusLabel(doc.status)}</span></div>}>
      <div className="ext-detail-scroll">
        <div className="ext-detail-section">
          <h4 className="ext-detail-section-title"><FileText size={16} /> ข้อมูลสรุป</h4>
          <div className="ext-detail-grid">
            <Row label="วันที่รับ" value={formatThaiDate(doc.receivedDate)} />
            <Row label="สถานที่ส่ง" value={doc.source.name} />
            <Row label="ชนิดเลือด" value={`${doc.bloodProduct.code}${doc.bloodProduct.name ? ` (${doc.bloodProduct.name})` : ''}`} />
            <Row label="หมู่เลือด"><span className={`blood-badge ${bloodGroupClass(doc.bloodGroup)}`} style={{ padding: '2px 10px', fontSize: 13 }}>{doc.bloodGroup}</span></Row>
            <Row label="เลข Box" value={doc.boxLabel} />
            <Row label="ตำแหน่งจัดเก็บ" value={doc.storage.name} />
            <Row label="จำนวนถุง" value={`${doc.bagRemaining} คงคลัง / ${doc.bagCount} ทั้งหมด`} />
            {doc.editReason && <Row label="เหตุผลแก้ไข" value={doc.editReason} />}
            {doc.rejectReason && <Row label="เหตุผลไม่อนุมัติ" value={doc.rejectReason} className="ext-detail-danger" />}
          </div>
        </div>

        <div className="ext-detail-section">
          <h4 className="ext-detail-section-title"><Users size={16} /> คณะกรรมการ ({cm.filter((m) => m.status === 'APPROVED').length}/{cm.length})</h4>
          {cm.length === 0 ? <p className="ext-muted" style={{ fontSize: 13, margin: 0 }}>ยังไม่ได้กำหนดคณะกรรมการ</p> : (
            <div className="ext-cm-list">
              {cm.map((m) => (
                <div key={m.id} className="ext-cm-list__row">
                  <span className={`ext-role-tag ext-role-tag--${m.role}`}>{ROLE_LABEL[m.role]}</span>
                  <span className="ext-cm-list__name">{m.user.name}</span>
                  <span className={`ext-cm-status ext-cm-status--${m.status}`}>{CM_LABEL[m.status]}</span>
                  <span className="ext-muted ext-cm-list__time">{m.actedAt ? formatThaiDateTime(m.actedAt) : '—'}</span>
                  {m.reason && <span className="ext-cm-list__reason">เหตุผล: {m.reason}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ext-detail-section">
          <h4 className="ext-detail-section-title">ถุงเลือด ({doc.bags.length})</h4>
          <div className="ext-detail-bags">
            {doc.bags.map((bag) => {
              const exp = bag.status === 'EXPORTED'
              return <span key={bag.id} className={`ext-bag-chip ${exp ? 'ext-bag-chip--exported' : ''}`} title={exp ? `นำออก ${bag.exportedAt ? formatThaiDateTime(bag.exportedAt) : ''}` : 'คงคลัง'}>{bag.bagNumber}</span>
            })}
          </div>
        </div>

        {doc.attachments.length > 0 && (
          <div className="ext-detail-section">
            <h4 className="ext-detail-section-title"><Paperclip size={16} /> ไฟล์แนบ ({doc.attachments.length})</h4>
            <div className="ext-detail-files">{doc.attachments.map((a) => <div key={a.id} className="ext-file-chip">{a.fileName}</div>)}</div>
          </div>
        )}

        {doc.timeline.length > 0 && (
          <div className="ext-detail-section">
            <h4 className="ext-detail-section-title"><Clock size={16} /> ประวัติ</h4>
            <div className="ext-timeline">
              {doc.timeline.map((t) => (
                <div key={t.id} className="ext-timeline-item">
                  <div className="ext-timeline-dot" />
                  <div className="ext-timeline-content">
                    <span className="ext-timeline-action">{t.action}</span>
                    <span className="ext-timeline-detail">{t.detail}</span>
                    <span className="ext-timeline-meta">{t.user?.name} · {formatThaiDateTime(t.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
