// frontend/src/pages/ExtBloodForm/components/ExtFormStepBar.tsx
import { Check } from 'lucide-react'
import type { FormStep } from '../services/ExtFormType'

const STEPS: { step: FormStep; label: string }[] = [{ step: 1, label: 'ข้อมูลและถุงเลือด' }, { step: 2, label: 'คณะกรรมการอนุมัติ' }]

export default function ExtFormStepBar({ step, valid1, onStepClick }: { step: FormStep; valid1: boolean; onStepClick: (s: FormStep) => void }) {
  return (
    <nav className="ext-step-bar" aria-label="ขั้นตอน">
      {STEPS.map((s, i) => {
        const done = s.step === 1 && valid1 && step !== 1
        return (
          <button key={s.step} type="button" aria-current={step === s.step ? 'step' : undefined}
            className={`ext-step ${step === s.step ? 'ext-step--active' : ''} ${done ? 'ext-step--done' : ''}`} onClick={() => onStepClick(s.step)}>
            <span className="ext-step-num">{done ? <Check size={14} /> : s.step}</span>
            <span className="ext-step-label">{s.label}</span>
            {i < STEPS.length - 1 && <span className="ext-step-line" style={valid1 ? { background: 'var(--success-ink)' } : undefined} />}
          </button>
        )
      })}
    </nav>
  )
}
