// frontend/src/pages/ExtBlood/components/ExtApproveModal.tsx

import { useState } from 'react'
import { X, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import type { ExtDocument } from '../services/ExtBloodType'

interface Props {
  doc: ExtDocument | null; selectedIds: string[]
  onApprove: (id: string, pin: string) => Promise<void>
  onReject: (id: string, reason: string, pin: string) => Promise<void>
  onBatchApprove: (pin: string) => Promise<void>
  onBatchReject: (reason: string, pin: string) => Promise<void>
  onClose: () => void
}

type Mode = 'approve' | 'reject'

export default function ExtApproveModal({ doc, selectedIds, onApprove, onReject, onBatchApprove, onBatchReject, onClose }: Props) {
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

  return (
    <div className="ext-modal-overlay" onClick={onClose}>
      <div className="ext-modal ext-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="ext-modal-header">
          <h3 className="ext-modal-title">{title}</h3>
          <button className="ext-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="ext-modal-body">
          <div className="ext-approve-toggle">
            <button className={`ext-approve-toggle-btn ${mode === 'approve' ? 'ext-approve-toggle-btn--active ext-approve-toggle-btn--success' : ''}`}
              onClick={() => { setMode('approve'); setError('') }}>
              <CheckCircle size={16} /> อนุมัติ
            </button>
            <button className={`ext-approve-toggle-btn ${mode === 'reject' ? 'ext-approve-toggle-btn--active ext-approve-toggle-btn--danger' : ''}`}
              onClick={() => { setMode('reject'); setError('') }}>
              <XCircle size={16} /> ไม่อนุมัติ
            </button>
          </div>
          {mode === 'reject' && (
            <div className="ext-form-group">
              <label className="ext-form-label">เหตุผล <span className="ext-required">*</span></label>
              <textarea className="ext-form-textarea" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="กรอกเหตุผลที่ไม่อนุมัติ..." />
            </div>
          )}
          <div className="ext-form-group">
            <label className="ext-form-label">PIN 6 หลัก <span className="ext-required">*</span></label>
            <input type="password" inputMode="numeric" maxLength={6} className="ext-form-input ext-pin-input"
              value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }} placeholder="••••••" autoFocus />
          </div>
          {error && <div className="ext-form-error"><AlertTriangle size={14} /> {error}</div>}
        </div>
        <div className="ext-modal-footer">
          <button className="plasm-btn plasm-btn--secondary" onClick={onClose} disabled={loading}>ยกเลิก</button>
          <button className={`plasm-btn ${mode === 'approve' ? 'plasm-btn--success' : 'plasm-btn--danger'}`}
            onClick={handleSubmit} disabled={loading || pin.length !== 6}>
            {loading && <Loader2 size={16} className="ext-spin" />}
            {mode === 'approve' ? 'อนุมัติ' : 'ไม่อนุมัติ'}
          </button>
        </div>
      </div>
    </div>
  )
}
