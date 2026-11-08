// frontend/src/pages/ExtBlood/components/ExtExportModal.tsx

import { useState, useMemo } from 'react'
import { PackageOpen, AlertTriangle } from 'lucide-react'
import Modal from '../../../components/common/Modal'
import FormInput from '../../../components/common/FormInput'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import DateInput from '../../../components/common/DateInput'
import Button from '../../../components/common/Button'
import type { ExtDocument, ExtExportReason } from '../services/ExtBloodType'

interface Props {
  doc: ExtDocument
  exportReasons: ExtExportReason[]
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

  const reasonOpts = useMemo<OptionType[]>(
    () => exportReasons.map(r => ({ value: r.id, label: r.name })),
    [exportReasons],
  )
  const findReason = reasonOpts.find(o => o.value === reasonId) ?? null

  const handleSubmit = async () => {
    if (selBags.length === 0) { setError('กรุณาเลือกถุงเลือดอย่างน้อย 1 ถุง'); return }
    if (!reasonId) { setError('กรุณาเลือกเหตุผล'); return }
    if (pin.length !== 6) { setError('กรุณากรอก PIN 6 หลัก'); return }
    setLoading(true); setError('')
    try {
      await onExport(doc.id, selBags, reasonId, exportDate, note.trim(), pin)
      onClose()
    } catch (err: any) { setError(err?.message || 'เกิดข้อผิดพลาด') }
    finally { setLoading(false) }
  }

  const footer = (
    <>
      <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
        ยกเลิก
      </Button>
      <Button
        variant="primary"
        size="sm"
        icon={<PackageOpen size={16} />}
        onClick={handleSubmit}
        loading={loading}
        disabled={selBags.length === 0}
      >
        นำออก ({selBags.length})
      </Button>
    </>
  )

  return (
    <Modal
      open
      onClose={onClose}
      title={`นำออก — ${doc.docNumber}`}
      titleIcon={<PackageOpen size={18} />}
      size="md"
      footer={footer}
    >
      {/* เลือกถุงเลือด */}
      <div className="ext-form-group">
        <label className="ext-form-label">
          เลือกถุงเลือด <span className="ext-required">*</span>
          <button className="ext-select-all-link" onClick={toggleAll}>
            {allSel ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
          </button>
        </label>
        <div className="ext-bag-select-grid">
          {inStock.map(bag => (
            <label key={bag.id} className={`ext-bag-select-item ${selBags.includes(bag.id) ? 'ext-bag-select-item--selected' : ''}`}>
              <input type="checkbox" checked={selBags.includes(bag.id)} onChange={() => toggleBag(bag.id)} />
              <span className="ext-bag-select-label">{bag.bagNumber}</span>
            </label>
          ))}
        </div>
      </div>

      {/* เหตุผล */}
      <div style={{ marginTop: 12 }}>
        <SelectDropdown
          label="เหตุผลการนำออก"
          placeholder="เลือกเหตุผล..."
          options={reasonOpts}
          value={findReason}
          onChange={opt => setReasonId(opt?.value ?? '')}
          isClearable={false}
          isSearchable={false}
        />
      </div>

      {/* วันที่นำออก */}
      <div style={{ marginTop: 12 }}>
        <DateInput
          label="วันที่นำออก"
          value={exportDate}
          onChange={iso => setExportDate(iso)}
        />
      </div>

      {/* หมายเหตุ */}
      <div style={{ marginTop: 12 }}>
        <FormInput
          label="หมายเหตุ"
          type="textarea"
          placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
          value={note}
          onChange={setNote}
          rows={2}
        />
      </div>

      {/* PIN */}
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
