// frontend/src/pages/ExtBloodForm/components/ExtFormReceiveInfo.tsx
import type { ExtFormData } from '../services/ExtFormType'
import type { ExtSource, ExtStorage, ExtBloodProduct } from '../../ExtBlood/services/ExtBloodType'
import { BLOOD_GROUPS } from '../services/useExtForm'
interface Props { form: ExtFormData; setField: <K extends keyof ExtFormData>(k: K, v: ExtFormData[K]) => void; sources: ExtSource[]; storages: ExtStorage[]; bloodProducts: ExtBloodProduct[] }
export default function ExtFormReceiveInfo({ form, setField, sources, storages, bloodProducts }: Props) {
  return (
    <div className="ext-form-section"><h3 className="ext-form-section-title">ข้อมูลการรับเลือด</h3><div className="ext-form-grid">
      <div className="ext-form-group"><label className="ext-form-label">วันที่รับ <span className="ext-required">*</span></label><input type="date" className="ext-form-input" value={form.receivedDate} onChange={e => setField('receivedDate', e.target.value)} /></div>
      <div className="ext-form-group"><label className="ext-form-label">สถานที่ส่งเลือด <span className="ext-required">*</span></label><select className="ext-form-select" value={form.sourceId} onChange={e => setField('sourceId', e.target.value)}><option value="">เลือก...</option>{sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
      <div className="ext-form-group"><label className="ext-form-label">ชนิดเลือด <span className="ext-required">*</span></label><select className="ext-form-select" value={form.bloodProductId} onChange={e => setField('bloodProductId', e.target.value)}><option value="">เลือก...</option>{bloodProducts.map(b => <option key={b.id} value={b.id}>{b.code}{b.name ? ` — ${b.name}` : ''}</option>)}</select></div>
      <div className="ext-form-group"><label className="ext-form-label">หมู่เลือด <span className="ext-required">*</span></label><select className="ext-form-select" value={form.bloodGroup} onChange={e => setField('bloodGroup', e.target.value)}><option value="">เลือก...</option>{BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
      <div className="ext-form-group"><label className="ext-form-label">เลข Box Label <span className="ext-required">*</span></label><input type="text" className="ext-form-input" value={form.boxLabel} onChange={e => setField('boxLabel', e.target.value)} placeholder="เช่น B+ 2026 0001" /></div>
      <div className="ext-form-group"><label className="ext-form-label">ตำแหน่งจัดเก็บ <span className="ext-required">*</span></label><select className="ext-form-select" value={form.storageId} onChange={e => setField('storageId', e.target.value)}><option value="">เลือก...</option>{storages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
    </div></div>
  )
}
