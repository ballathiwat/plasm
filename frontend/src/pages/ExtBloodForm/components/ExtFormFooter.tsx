// frontend/src/pages/ExtBloodForm/components/ExtFormFooter.tsx
import { ChevronLeft, ChevronRight, Save, Send, Loader2 } from 'lucide-react'
import type { FormStep } from '../services/ExtFormType'
interface Props { step: FormStep; setStep: (s: FormStep) => void; saving: boolean; canSubmit: boolean; onSaveDraft: () => Promise<void>; onSaveAndSubmit: () => Promise<void> }
export default function ExtFormFooter({ step, setStep, saving, canSubmit, onSaveDraft, onSaveAndSubmit }: Props) {
  return (
    <div className="ext-form-footer">
      <div className="ext-form-footer-left">
        {step > 1 && <button className="plasm-btn plasm-btn--secondary" onClick={() => setStep((step - 1) as FormStep)} disabled={saving}><ChevronLeft size={16} /> ย้อนกลับ</button>}
      </div>
      <div className="ext-form-footer-right">
        {step < 4 && <button className="plasm-btn plasm-btn--secondary" onClick={() => setStep((step + 1) as FormStep)}>ถัดไป <ChevronRight size={16} /></button>}
        <button className="plasm-btn plasm-btn--secondary" onClick={onSaveDraft} disabled={saving}>{saving ? <Loader2 size={16} className="ext-spin" /> : <Save size={16} />} บันทึกร่าง</button>
        {step === 4 && <button className="plasm-btn plasm-btn--primary" onClick={onSaveAndSubmit} disabled={saving || !canSubmit} title={canSubmit ? '' : 'ต้องลงนามผู้ตรวจ+ผู้จัดเก็บก่อน'}>
          {saving ? <Loader2 size={16} className="ext-spin" /> : <Send size={16} />} บันทึกและส่งอนุมัติ</button>}
      </div>
    </div>
  )
}
