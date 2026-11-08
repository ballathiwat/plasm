// frontend/src/pages/ExtBloodForm/components/ExtFormStepBar.tsx
import type { FormStep } from '../services/ExtFormType'
const STEPS: { step: FormStep; label: string }[] = [{ step: 1, label: 'ข้อมูลการรับ' },{ step: 2, label: 'ถุงเลือด' },{ step: 3, label: 'ไฟล์แนบ' },{ step: 4, label: 'ลงนาม' }]
export default function ExtFormStepBar({ step, onStepClick }: { step: FormStep; onStepClick: (s: FormStep) => void }) {
  return (
    <div className="ext-step-bar">
      {STEPS.map((s, i) => (
        <button key={s.step} className={`ext-step ${step === s.step ? 'ext-step--active' : ''} ${step > s.step ? 'ext-step--done' : ''}`} onClick={() => onStepClick(s.step)}>
          <span className="ext-step-num">{s.step}</span><span className="ext-step-label">{s.label}</span>
          {i < STEPS.length - 1 && <span className="ext-step-line" />}
        </button>
      ))}
    </div>
  )
}
