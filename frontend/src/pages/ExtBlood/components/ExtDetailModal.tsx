// frontend/src/pages/ExtBlood/components/ExtDetailModal.tsx

import { FileText, Paperclip, Clock, CheckCircle, XCircle, User } from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { formatThaiDate, formatThaiDateTime, statusLabel, statusClass, bloodGroupClass } from '../services/extHelpers'
import type { ExtDocument } from '../services/ExtBloodType'

interface Props { doc: ExtDocument; onClose: () => void }

function Row({ label, value, children, className }: { label: string; value?: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={`ext-detail-row ${className || ''}`}>
      <span className="ext-detail-label">{label}</span>
      <span className="ext-detail-value">{children ?? value}</span>
    </div>
  )
}

export default function ExtDetailModal({ doc, onClose }: Props) {
  return (
    <Modal
      open
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {doc.docNumber}
          <span className={`ext-status ${statusClass(doc.status)}`}>{statusLabel(doc.status)}</span>
        </div>
      }
      size="lg"
    >
      <div className="ext-detail-scroll">
        {/* ข้อมูลสรุป */}
        <div className="ext-detail-section">
          <h4 className="ext-detail-section-title"><FileText size={16} /> ข้อมูลสรุป</h4>
          <div className="ext-detail-grid">
            <Row label="วันที่รับ" value={formatThaiDate(doc.receivedDate)} />
            <Row label="สถานที่ส่ง" value={doc.source.name} />
            <Row label="ชนิดเลือด" value={`${doc.bloodProduct.code}${doc.bloodProduct.name ? ` (${doc.bloodProduct.name})` : ''}`} />
            <Row label="หมู่เลือด">
              <span className={`blood-badge ${bloodGroupClass(doc.bloodGroup)}`} style={{ padding: '2px 10px', fontSize: 13 }}>
                {doc.bloodGroup}
              </span>
            </Row>
            <Row label="เลข Box" value={doc.boxLabel} />
            <Row label="ตำแหน่งจัดเก็บ" value={doc.storage.name} />
            <Row label="จำนวนถุง" value={`${doc.bagRemaining} คงคลัง / ${doc.bagCount} ทั้งหมด`} />
            {doc.editReason && <Row label="เหตุผลแก้ไข" value={doc.editReason} />}
            {doc.rejectReason && <Row label="เหตุผลไม่อนุมัติ" value={doc.rejectReason} className="ext-detail-danger" />}
          </div>
        </div>

        {/* ถุงเลือด */}
        <div className="ext-detail-section">
          <h4 className="ext-detail-section-title">ถุงเลือด ({doc.bags.length})</h4>
          <div className="ext-detail-bags">
            {doc.bags.map(bag => {
              const exp = bag.status === 'EXPORTED'
              return (
                <span key={bag.id} className={`ext-bag-chip ${exp ? 'ext-bag-chip--exported' : ''}`}
                  title={exp ? `นำออก ${bag.exportedAt ? formatThaiDateTime(bag.exportedAt) : ''}` : 'คงคลัง'}>
                  {bag.bagNumber}
                </span>
              )
            })}
          </div>
        </div>

        {/* ลายเซ็น */}
        <div className="ext-detail-section">
          <h4 className="ext-detail-section-title"><User size={16} /> ลายเซ็น</h4>
          <div className="ext-detail-grid">
            <Row label="ผู้ตรวจสอบ" value={doc.verifier ? `${doc.verifier.name}${doc.verifiedAt ? ` — ${formatThaiDateTime(doc.verifiedAt)}` : ''}` : '—'} />
            <Row label="ผู้จัดเก็บ" value={doc.storer ? `${doc.storer.name}${doc.storedAt ? ` — ${formatThaiDateTime(doc.storedAt)}` : ''}` : '—'} />
            <Row label="ผู้อนุมัติ" value={doc.approver ? `${doc.approver.name}${doc.approvedAt ? ` — ${formatThaiDateTime(doc.approvedAt)}` : ''}` : '—'} />
          </div>
        </div>

        {/* ไฟล์แนบ */}
        {doc.attachments.length > 0 && (
          <div className="ext-detail-section">
            <h4 className="ext-detail-section-title"><Paperclip size={16} /> ไฟล์แนบ ({doc.attachments.length})</h4>
            <div className="ext-detail-files">
              {doc.attachments.map(att => (
                <div key={att.id} className="ext-file-chip">{att.fileName}</div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {doc.timeline.length > 0 && (
          <div className="ext-detail-section">
            <h4 className="ext-detail-section-title"><Clock size={16} /> ประวัติ</h4>
            <div className="ext-timeline">
              {doc.timeline.map(entry => (
                <div key={entry.id} className="ext-timeline-item">
                  <div className="ext-timeline-dot" />
                  <div className="ext-timeline-content">
                    <span className="ext-timeline-action">{entry.action}</span>
                    <span className="ext-timeline-detail">{entry.detail}</span>
                    <span className="ext-timeline-meta">
                      {entry.user?.name} · {formatThaiDateTime(entry.createdAt)}
                    </span>
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
