// frontend/src/pages/ExtBloodForm/components/ExtFormBagInput.tsx
import { useEffect, useRef, useState } from 'react'
import { Plus, X, ScanBarcode } from 'lucide-react'
import FormInput from '../../../components/common/FormInput'
import Button from '../../../components/common/Button'

interface Props {
  bags: string[]
  bagInput: string
  setBagInput: (v: string) => void
  addBag: () => void
  removeBag: (n: string) => void
  bagError: string
  showError?: boolean
}

export default function ExtFormBagInput({ bags, bagInput, setBagInput, addBag, removeBag, bagError, showError }: Props) {
  // ไฮไลต์ถุงที่เพิ่งสแกน 1.2 วิ
  const [flash, setFlash] = useState<string | null>(null)
  const prev = useRef(bags.length)
  useEffect(() => {
    if (bags.length > prev.current) {
      const last = bags[bags.length - 1]
      setFlash(last)
      const t = window.setTimeout(() => setFlash(null), 1200)
      prev.current = bags.length
      return () => window.clearTimeout(t)
    }
    prev.current = bags.length
  }, [bags])

  const onKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); addBag() } }
  const slots = Math.max(bags.length + 1, 4)

  return (
    <div className="ext-bags">
      <div className="ext-bags__input">
        <div style={{ flex: 1, minWidth: 0 }}>
          <FormInput label="เลขถุงเลือด" value={bagInput} onChange={setBagInput} placeholder={`สแกนหรือพิมพ์เลขถุงที่ ${bags.length + 1} แล้วกด Enter`}
            mono icon={<ScanBarcode size={14} />} error={bagError} onKeyDown={onKeyDown} autoFocus />
        </div>
        <div className="ext-bags__add"><Button variant="primary" icon={<Plus size={14} />} onClick={addBag}>เพิ่ม</Button></div>
      </div>
      {showError && bags.length === 0 && <p className="ext-bag-error" style={{ marginTop: 8 }}>สแกนถุงเลือดอย่างน้อย 1 ถุง</p>}
      <ol className="ext-bags__grid" aria-label="ลำดับถุงเลือดที่สแกน">
        {Array.from({ length: slots }, (_, i) => i + 1).map((n) => {
          const unit = bags[n - 1]
          const next = !unit && n === bags.length + 1
          return (
            <li key={n} className={`ext-bag${unit ? ' is-filled' : ''}${next ? ' is-next' : ''}${unit && unit === flash ? ' is-hot' : ''}`}>
              <span className="ext-bag__no">ถุงที่ {n}</span>
              {unit ? <span className="ext-bag__unit">{unit}</span> : <span className="ext-bag__empty">{next ? 'สแกนถัดไป' : 'ว่าง'}</span>}
              {unit && <button type="button" className="ext-bag__x" aria-label={`ลบถุง ${unit}`} onClick={() => removeBag(unit)}><X size={16} /></button>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
