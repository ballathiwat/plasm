// frontend/src/pages/ExtBlood/components/ExtDetailModal.tsx

import { FileText, Paperclip, Clock, Users, Droplet, CheckCircle, PackageOpen, PackageCheck, ExternalLink, FileImage, File } from 'lucide-react'
import Modal from '../../../components/common/Modal'
import '../../../assets/styles/ext-blood-settings.css'
import Button from '../../../components/common/Button'
import { formatThaiDate, formatThaiDateTime, statusLabel, statusClass, bloodGroupClass } from '../services/extHelpers'
import { sortCommittee, myPending, ROLE_LABEL } from '../services/committeeHelpers'
import type { ExtDocument, ExtAttachment } from '../services/ExtBloodType'

const CM_LABEL = { DRAFT: 'ยังไม่ส่ง', PENDING: 'รออนุมัติ', APPROVED: 'อนุมัติแล้ว', REJECTED: 'ไม่อนุมัติ' } as const
const API_URL = import.meta.env.VITE_API_URL || ''
const fixName = (n: string) => { try { return /[\u00c0-\u00ff][\u0080-\u00bf]/.test(n) ? decodeURIComponent(escape(n)) : n } catch { return n } }

const fileUrl = (a: ExtAttachment) => `${API_URL}/${a.filePath.replace(/^\/+/, '')}`
const fileSize = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)
const fileIcon = (t: string) => (t?.startsWith('image/') ? <FileImage size={16} /> : t === 'application/pdf' ? <FileText size={16} /> : <File size={16} />)

function Row({ label, value, children, className }: { label: string; value?: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={`ext-detail-row ${className || ''}`}>
      <span className="ext-detail-label">{label}</span>
      <span className="ext-detail-value">{children ?? value}</span>
    </div>
  )
}

interface Props {
  doc: ExtDocument
  userId: string
  onClose: () => void
  onApprove: (doc: ExtDocument) => void
  onExport: (doc: ExtDocument) => void
}

export default function ExtDetailModal({ doc, userId, onClose, onApprove, onExport }: Props) {
  const cm = sortCommittee(doc.committee)
  const mine = !!myPending(doc, userId)
  const canExport = doc.status === 'APPROVED' && doc.bagRemaining > 0
  const exportedN = doc.bags.filter((b) => b.status === 'EXPORTED').length
  const stockN = doc.bags.length - exportedN
  const go = (fn: (d: ExtDocument) => void) => () => { onClose(); fn(doc) }
  const approvedN = cm.filter((m) => m.status === 'APPROVED').length
  const product = doc.bloodProduct ? `${doc.bloodProduct.code}${doc.bloodProduct.name ? ` (${doc.bloodProduct.name})` : ''}` : '—'

  const footer = (
    <>
      <Button variant="secondary" size="sm" onClick={onClose}>ปิด</Button>
      {mine && <Button variant="success" size="sm" icon={<CheckCircle size={16} />} onClick={go(onApprove)}>อนุมัติ / ไม่อนุมัติ</Button>}
      {!mine && canExport && <Button variant="primary" size="sm" icon={<PackageOpen size={16} />} onClick={go(onExport)}>นำออกถุงเลือด</Button>}
    </>
  )

  return (
    <Modal open onClose={onClose} size="lg" footer={footer}
      title={<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{doc.docNumber}<span className={`ext-status ${statusClass(doc.status)}`}>{statusLabel(doc.status)}</span></div>}>
      <div className="ext-detail-scroll">
        <div className="ext-detail-section">
          <h4 className="ext-detail-section-title"><FileText size={16} /> ข้อมูลสรุป</h4>
          <div className="ext-detail-grid">
            <Row label="วันที่รับ" value={formatThaiDate(doc.receivedDate)} />
            <Row label="สถานที่ส่ง" value={doc.source?.name || '—'} />
            <Row label="ชนิดเลือด" value={product} />
            <Row label="หมู่เลือด"><span className={`blood-badge ${bloodGroupClass(doc.bloodGroup)}`} style={{ padding: '2px 10px', fontSize: 13 }}>{doc.bloodGroup}</span></Row>
            <Row label="เลข Box" value={doc.boxLabel || '—'} />
            <Row label="ตำแหน่งจัดเก็บ" value={doc.storage?.name || '—'} />
            <Row label="จำนวนถุง" value={`${doc.bagRemaining} คงคลัง / ${doc.bagCount} ทั้งหมด`} />
            <Row label="ผู้บันทึก" value={doc.createdBy ? `${doc.createdBy.name} · ${formatThaiDateTime(doc.createdAt)}` : formatThaiDateTime(doc.createdAt)} />
            {doc.submittedAt && <Row label="ส่งอนุมัติเมื่อ" value={formatThaiDateTime(doc.submittedAt)} />}
            {doc.editReason && <Row label="เหตุผลแก้ไข" value={doc.editReason} />}
            {doc.rejectReason && <Row label="เหตุผลไม่อนุมัติ" value={doc.rejectReason} className="ext-detail-danger" />}
          </div>
        </div>

        <div className="ext-detail-section">
          <h4 className="ext-detail-section-title"><Users size={16} /> {`คณะกรรมการ${cm.length ? ` (อนุมัติ ${approvedN}/${cm.length})` : ''}`}</h4>
          {cm.length === 0 ? <p className="ext-muted" style={{ fontSize: 13, margin: 0 }}>ยังไม่ได้กำหนดคณะกรรมการ</p> : (
            <div className="ext-cm-list">
              {cm.map((m) => (
                <div key={m.id} className="ext-cm-list__row">
                  <span className={`ext-role-tag ext-role-tag--${m.role}`}>{ROLE_LABEL[m.role]}</span>
                  <span className="ext-cm-list__name">{m.user.name}{m.userId === userId && <span className="ext-cm-you">(คุณ)</span>}</span>
                  <span className={`ext-cm-status ext-cm-status--${m.status}`}>{CM_LABEL[m.status]}</span>
                  <span className="ext-muted ext-cm-list__time">{m.actedAt ? formatThaiDateTime(m.actedAt) : '—'}</span>
                  {m.reason && <span className="ext-cm-list__reason">เหตุผล: {m.reason}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ext-detail-section">
          <h4 className="ext-detail-section-title">
            <Droplet size={16} /> {`ถุงเลือด (${doc.bags.length})`}
            <span className="ext-bag-summary">{`คงคลัง ${stockN}${exportedN ? ` · นำออก ${exportedN}` : ''}`}</span>
          </h4>
          <ul className="ext-detail-bags" role="list">
            {doc.bags.map((bag) => {
              const exp = bag.status === 'EXPORTED'
              return (
                <li key={bag.id} className={`ext-bag-chip ${exp ? 'ext-bag-chip--exported' : ''}`}>
                  {exp ? <PackageOpen size={12} aria-hidden /> : <PackageCheck size={12} aria-hidden />}
                  <span className="ext-bag-chip__no">{bag.bagNumber}</span>
                  {exp && <span className="ext-bag-chip__tag">นำออก{bag.exportedAt ? ` ${formatThaiDate(bag.exportedAt)}` : ''}</span>}
                </li>
              )
            })}
          </ul>
        </div>

        {doc.attachments.length > 0 && (
          <div className="ext-detail-section">
            <h4 className="ext-detail-section-title"><Paperclip size={16} /> {`ไฟล์แนบ (${doc.attachments.length})`}</h4>
            <div className="ext-detail-files">
              {doc.attachments.map((a) => (
                <a key={a.id} className="ext-file-link" href={fileUrl(a)} target="_blank" rel="noopener noreferrer" aria-label={`เปิดไฟล์ ${fixName(a.fileName)} ในแท็บใหม่`}>
                  <span className="ext-file-link__icon">{fileIcon(a.fileType)}</span>
                  <span className="ext-file-link__name">{fixName(a.fileName)}</span>
                  <span className="ext-file-link__size">{fileSize(a.fileSize)}</span>
                  <ExternalLink size={14} className="ext-file-link__ext" aria-hidden />
                </a>
              ))}
            </div>
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
                    <span className="ext-timeline-meta">{[t.user?.name, formatThaiDateTime(t.createdAt)].filter(Boolean).join(' · ')}</span>
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
