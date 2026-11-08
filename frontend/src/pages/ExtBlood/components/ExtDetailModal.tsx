// frontend/src/pages/ExtBlood/components/ExtDetailModal.tsx

import { X, FileText, Paperclip, Clock, CheckCircle, XCircle, User } from 'lucide-react'
import { formatThaiDate, formatThaiDateTime, statusLabel, statusClass, bloodGroupClass } from '../services/extHelpers'
import type { ExtDocument, ExtBag, ExtAttachment, ExtTimelineEntry } from '../services/ExtBloodType'

interface Props { doc: ExtDocument; onClose: () => void }

export default function ExtDetailModal({ doc, onClose }: Props) {
  return (
    <div className="ext-modal-overlay" onClick={onClose}>
      <div className="ext-modal ext-modal--lg" onClick={e => e.stopPropagation()}>
        <div className="ext-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 className="ext-modal-title">{doc.docNumber}</h3>
            <span className={`ext-status ${statusClass(doc.status)}`}>{statusLabel(doc.status)}</span>
          </div>
          <button className="ext-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="ext-modal-body ext-detail-scroll">
          {/* ข้อมูลสรุป */}
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

          {/* ถุงเลือด */}
          <div className="ext-detail-section">
            <h4 className="ext-detail-section-title">ถุงเลือด ({doc.bags.length})</h4>
            <div className="ext-detail-bags">
              {doc.bags.map(bag => {
                const exp = bag.status === 'EXPORTED'
                return (
                  <span key={bag.id} className={`ext-bag-chip ${exp ? 'ext-bag-chip--exported' : ''}`}
                    title={exp ? `นำออก ${formatThaiDateTime(bag.exportedAt)}` : 'คงคลัง'}>
                    {bag.bagNumber}{exp && <XCircle size={12} />}
                  </span>
                )
              })}
            </div>
          </div>

          {/* ไฟล์แนบ */}
          {doc.attachments.length > 0 && (
            <div className="ext-detail-section">
              <h4 className="ext-detail-section-title"><Paperclip size={16} /> ไฟล์แนบ ({doc.attachments.length})</h4>
              <div className="ext-detail-files">
                {doc.attachments.map(att => (
                  <a key={att.id} href={`/${att.filePath}`} target="_blank" rel="noopener noreferrer" className="ext-detail-file">
                    <Paperclip size={14} />
                    <span className="ext-detail-file-name">{att.fileName}</span>
                    <span className="ext-detail-file-size">{Math.round(att.fileSize / 1024)} KB</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ลายเซ็น */}
          <div className="ext-detail-section">
            <h4 className="ext-detail-section-title"><User size={16} /> ลายเซ็นอิเล็กทรอนิกส์</h4>
            <div className="ext-detail-signs">
              <SignRow label="ผู้ตรวจ" user={doc.verifier} signed={doc.verifierPin} at={doc.verifiedAt} />
              <SignRow label="ผู้จัดเก็บ" user={doc.storer} signed={doc.storerPin} at={doc.storedAt} />
              <SignRow label="ผู้อนุมัติ" user={doc.approver} signed={doc.approverPin} at={doc.approvedAt} />
            </div>
          </div>

          {/* Timeline */}
          {doc.timeline.length > 0 && (
            <div className="ext-detail-section">
              <h4 className="ext-detail-section-title"><Clock size={16} /> Timeline</h4>
              <div className="ext-detail-timeline">
                {doc.timeline.map(e => (
                  <div key={e.id} className="ext-timeline-item">
                    <div className="ext-timeline-dot" />
                    <div className="ext-timeline-content">
                      <span className="ext-timeline-action">{e.action}</span>
                      <span className="ext-timeline-detail">{e.detail}</span>
                      <span className="ext-timeline-meta">{e.user?.name || '-'} · {formatThaiDateTime(e.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="ext-modal-footer">
          <button className="plasm-btn plasm-btn--secondary" onClick={onClose}>ปิด</button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, children, className }: { label: string; value?: string; children?: React.ReactNode; className?: string }) {
  return <div className={`ext-detail-row ${className || ''}`}><span className="ext-detail-label">{label}</span><span className="ext-detail-value">{children || value || '-'}</span></div>
}

function SignRow({ label, user, signed, at }: { label: string; user?: { name: string } | null; signed: boolean; at?: string | null }) {
  return (
    <div className="ext-sign-row">
      <span className="ext-sign-label">{label}</span>
      {signed && user ? (
        <div className="ext-sign-done"><CheckCircle size={16} color="var(--success-ink)" /><span>{user.name}</span><span className="ext-sign-time">{formatThaiDateTime(at)}</span></div>
      ) : user ? (
        <div className="ext-sign-pending"><Clock size={14} /><span>{user.name}</span><span className="ext-sign-waiting">รอลงนาม</span></div>
      ) : <span className="ext-sign-empty">ยังไม่เลือก</span>}
    </div>
  )
}
