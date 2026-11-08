// frontend/src/pages/ExtBlood/components/ExtExportModal.tsx

import { useState } from 'react'
import { X, PackageOpen, AlertTriangle, Loader2 } from 'lucide-react'
import type { ExtDocument, ExtExportReason } from '../services/ExtBloodType'

interface Props {
  doc: ExtDocument; exportReasons: ExtExportReason[]
  onExport: (docId: string, bagIds: string[], reasonId: string, date: string, note: string, pin: string) => Promise<void>
  onClose: () => void
}

export default function ExtExportModal({ doc, exportReasons, onExport, onClose }: Props) {
  const inStock = doc.bags.filter(b => b.status === 'IN_STOCK')
  const [selBags, setSelBags] = useState<string[]>([])
  const [reasonId, setReasonId] = useState('')
  const [exportDate, setExportDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const allSel = inStock.length > 0 && inStock.every(b => selBags.includes(b.id))
  const toggleBag = (id: string) => setSelBags(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleAll = () => setSelBags(allSel ? [] : inStock.map(b => b.id))

  const handleSubmit = async () => {
    if (selBags.length === 0) { setError('กรุณาเลือกถุงเลือดอย่างน้อย 1 ถุง'); return }
    if (!reasonId) { setError('กรุณาเลือกเหตุผล'); return }
    if (pin.length !== 6) { setError('กรุณากรอก PIN 6 หลัก'); return }
    setLoading(true); setError('')
    try { await onExport(doc.id, selBags, reasonId, exportDate, note.trim(), pin); onClose() }
    catch (err: any) { setError(err?.message || 'เกิดข้อผิดพลาด') }
    finally { setLoading(false) }
  }

  return (
    <div className="ext-modal-overlay" onClick={onClose}>
      <div className="ext-modal ext-modal--md" onClick={e => e.stopPropagation()}>
        <div className="ext-modal-header">
          <h3 className="ext-modal-title"><PackageOpen size={18} /> นำออก — {doc.docNumber}</h3>
          <button className="ext-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="ext-modal-body">
          <div className="ext-form-group">
            <label className="ext-form-label">
              เลือกถุงเลือด <span className="ext-required">*</span>
              <button className="ext-select-all-link" onClick={toggleAll}>{allSel ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}</button>
            </label>
            <div className="ext-export-bags">
              {inStock.map(bag => (
                <label key={bag.id} className="ext-export-bag-item">
                  <input type="checkbox" checked={selBags.includes(bag.id)} onChange={() => toggleBag(bag.id)} />
                  <span>{bag.bagNumber}</span>
                </label>
              ))}
              {inStock.length === 0 && <p className="ext-form-hint">ไม่มีถุงที่คงคลัง</p>}
            </div>
          </div>
          <div className="ext-form-group">
            <label className="ext-form-label">เหตุผลนำออก <span className="ext-required">*</span></label>
            <select className="ext-form-select" value={reasonId} onChange={e => setReasonId(e.target.value)}>
              <option value="">เลือกเหตุผล...</option>
              {exportReasons.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="ext-form-group">
            <label className="ext-form-label">วันที่นำออก</label>
            <input type="date" className="ext-form-input" value={exportDate} onChange={e => setExportDate(e.target.value)} />
          </div>
          <div className="ext-form-group">
            <label className="ext-form-label">หมายเหตุ</label>
            <textarea className="ext-form-textarea" rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)" />
          </div>
          <div className="ext-form-group">
            <label className="ext-form-label">PIN 6 หลัก <span className="ext-required">*</span></label>
            <input type="password" inputMode="numeric" maxLength={6} className="ext-form-input ext-pin-input"
              value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }} placeholder="••••••" />
          </div>
          {error && <div className="ext-form-error"><AlertTriangle size={14} /> {error}</div>}
        </div>
        <div className="ext-modal-footer">
          <button className="plasm-btn plasm-btn--secondary" onClick={onClose} disabled={loading}>ยกเลิก</button>
          <button className="plasm-btn plasm-btn--primary" onClick={handleSubmit} disabled={loading || selBags.length === 0}>
            {loading && <Loader2 size={16} className="ext-spin" />} นำออก ({selBags.length} ถุง)
          </button>
        </div>
      </div>
    </div>
  )
}
