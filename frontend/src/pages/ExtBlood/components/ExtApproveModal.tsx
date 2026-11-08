// frontend/src/pages/ExtBlood/components/ExtApproveModal.tsx

import { useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import Modal from '../../../components/common/Modal'
import FormInput from '../../../components/common/FormInput'
import Button from '../../../components/common/Button'
import type { ExtDocument } from '../services/ExtBloodType'

interface Props {
  doc: ExtDocument | null
  selectedIds: string[]
  onApprove: (id: string, pin: string) => Promise<void>
  onReject: (id: string, reason: string, pin: string) => Promise<void>
  onBatchApprove: (pin: string) => Promise<void>
  onBatchReject: (reason: string, pin: string) => Promise<void>
  onClose: () => void
}

type Mode = 'approve' | 'reject'

export default function ExtApproveModal({
  doc, selectedIds, onApprove, onReject, onBatchApprove, onBatchReject, onClose,
}: Props) {
  const isBatch = selectedIds.length > 0 && !doc
  const [mode, setMode] = useState<Mode>('approve')
  const [pin, setPin] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (pin.length !== 6) { setError('กรุณากรอก PIN 6 หลัก'); return }
    if (mode === 'reject' && !reason.trim()) { setError('กรุณากรอกเหตุผล'); return }
    setLoading(true); setError('')
    try {
      if (mode === 'approve') {
        if (isBatch) await onBatchApprove(pin)
        else if (doc) await onApprove(doc.id, pin)
      } else {
        if (isBatch) await onBatchReject(reason.trim(), pin)
        else if (doc) await onReject(doc.id, reason.trim(), pin)
      }
      onClose()
    } catch (err: any) { setError(err?.message || 'เกิดข้อผิดพลาด') }
    finally { setLoading(false) }
  }

  const title = isBatch
    ? `${mode === 'approve' ? 'อนุมัติ' : 'ไม่อนุมัติ'} ${selectedIds.length} รายการ`
    : `${mode === 'approve' ? 'อนุมัติ' : 'ไม่อนุมัติ'} ${doc?.docNumber || ''}`

  const footer = (
    <>
      <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
        ยกเลิก
      </Button>
      <Button
        variant={mode === 'approve' ? 'success' : 'danger'}
        size="sm"
        icon={mode === 'approve' ? <CheckCircle size={16} /> : <XCircle size={16} />}
        onClick={handleSubmit}
        loading={loading}
      >
        {mode === 'approve' ? 'อนุมัติ' : 'ไม่อนุมัติ'}
      </Button>
    </>
  )

  return (
    <Modal open onClose={onClose} title={title} size="sm" footer={footer}>
      {/* Toggle อนุมัติ / ไม่อนุมัติ */}
      <div className="ext-approve-toggle">
        <button
          className={`ext-approve-toggle-btn ${mode === 'approve' ? 'ext-approve-toggle-btn--active ext-approve-toggle-btn--success' : ''}`}
          onClick={() => { setMode('approve'); setError('') }}
        >
          <CheckCircle size={16} /> อนุมัติ
        </button>
        <button
          className={`ext-approve-toggle-btn ${mode === 'reject' ? 'ext-approve-toggle-btn--active ext-approve-toggle-btn--danger' : ''}`}
          onClick={() => { setMode('reject'); setError('') }}
        >
          <XCircle size={16} /> ไม่อนุมัติ
        </button>
      </div>

      {mode === 'reject' && (
        <div style={{ marginTop: 12 }}>
          <FormInput
            label="เหตุผล"
            type="textarea"
            required
            placeholder="กรุณาระบุเหตุผลที่ไม่อนุมัติ..."
            value={reason}
            onChange={setReason}
            rows={3}
          />
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <FormInput
          label="PIN 6 หลัก"
          required
          type="password"
          placeholder="กรอก PIN ยืนยัน"
          value={pin}
          onChange={setPin}
          maxLength={6}
        />
      </div>

      {error && (
        <div className="ext-form-error" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}
    </Modal>
  )
}
