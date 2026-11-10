// frontend/src/pages/ExtBlood/components/ExtApproveModal.tsx — อนุมัติ/ไม่อนุมัติ "ส่วนของฉัน"
import { useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import Modal from '../../../components/common/Modal'
import FormInput from '../../../components/common/FormInput'
import Button from '../../../components/common/Button'
import { myPending, myPendingAll, ROLE_LABEL } from '../services/committeeHelpers'
import type { ExtDocument } from '../services/ExtBloodType'

interface Props {
  doc: ExtDocument | null; userId: string; selectedCount: number
  onDecide: (id: string, decision: 'approve' | 'reject', pin: string, reason?: string) => Promise<void>
  onBatchApprove: (pin: string) => Promise<void>
  onClose: () => void
}

export default function ExtApproveModal({ doc, userId, selectedCount, onDecide, onBatchApprove, onClose }: Props) {
  const isBatch = !doc
  const mine = doc ? myPending(doc, userId) : undefined
  const mineAll = doc ? myPendingAll(doc, userId) : []
  const [mode, setMode] = useState<'approve' | 'reject'>('approve')
  const [pin, setPin] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (mode === 'reject' && !reason.trim()) { setError('ระบุเหตุผลที่ไม่อนุมัติ เพื่อให้ผู้สร้างแก้ไขได้ถูกจุด'); return }
    if (pin.length !== 6) { setError('PIN ต้องเป็นตัวเลข 6 หลัก'); return }
    setLoading(true); setError('')
    try {
      if (isBatch) await onBatchApprove(pin)
      else await onDecide(doc!.id, mode, pin, reason.trim())
      onClose()
    } catch (e: any) {
      const r = e?.response?.data ?? e
      setError(r?.locked ? 'PIN ถูกล็อก 15 นาที' : r?.remaining !== undefined ? `PIN ไม่ถูกต้อง (เหลือ ${r.remaining} ครั้ง)` : r?.message || 'เกิดข้อผิดพลาด')
    } finally { setLoading(false) }
  }

  const title = isBatch ? `อนุมัติส่วนของคุณ ${selectedCount} เอกสาร` : `${mode === 'approve' ? 'อนุมัติ' : 'ไม่อนุมัติ'} ${doc!.docNumber}`
  const footer = (
    <>
      <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>ยกเลิก</Button>
      <Button variant={mode === 'approve' ? 'success' : 'danger'} size="sm" icon={mode === 'approve' ? <CheckCircle size={16} /> : <XCircle size={16} />} onClick={submit} loading={loading}>
        {mode === 'approve' ? 'ยืนยันอนุมัติ' : 'ยืนยันไม่อนุมัติ'}
      </Button>
    </>
  )

  return (
    <Modal open onClose={onClose} title={title} size="sm" footer={footer}>
      {mineAll.length > 0 && <p className="ext-muted" style={{ margin: '0 0 12px', fontSize: 13 }}>ในฐานะ<b>{mineAll.map((m) => ROLE_LABEL[m.role]).join(', ')}</b> — การอนุมัติมีผลเฉพาะส่วนของคุณ ({mineAll.length > 1 ? `ทุก ${mineAll.length} หน้าที่พร้อมกัน` : '1 หน้าที่'})</p>}
      {!isBatch && (
        <div className="ext-approve-toggle">
          <button className={`ext-approve-toggle-btn ${mode === 'approve' ? 'ext-approve-toggle-btn--active ext-approve-toggle-btn--success' : ''}`} onClick={() => { setMode('approve'); setError('') }}><CheckCircle size={16} /> อนุมัติ</button>
          <button className={`ext-approve-toggle-btn ${mode === 'reject' ? 'ext-approve-toggle-btn--active ext-approve-toggle-btn--danger' : ''}`} onClick={() => { setMode('reject'); setError('') }}><XCircle size={16} /> ไม่อนุมัติ</button>
        </div>
      )}
      {mode === 'reject' && (
        <div style={{ marginTop: 12 }}>
          <FormInput label="เหตุผล" type="textarea" required rows={3} placeholder="เช่น เลขถุงที่ 3 ไม่ตรงกับใบนำส่ง" value={reason} onChange={setReason} />
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <FormInput label="PIN 6 หลัก" required type="password" placeholder="กรอก PIN ยืนยัน" value={pin} onChange={(v) => setPin(v.replace(/\D/g, '').slice(0, 6))} />
      </div>
      {error && <div className="ext-form-error" style={{ marginTop: 12 }}><AlertTriangle size={14} /> {error}</div>}
    </Modal>
  )
}
