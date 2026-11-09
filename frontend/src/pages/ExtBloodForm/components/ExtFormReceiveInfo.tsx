// frontend/src/pages/ExtBloodForm/components/ExtFormReceiveInfo.tsx
// ช่องกรอกเรียงอัตโนมัติ (auto-fit 220px) · หมายเลขกล่องแสดงที่หัวส่วน/การ์ดสรุปแทน
import { useMemo } from 'react'
import SelectDropdown, { type OptionType } from '../../../components/common/SelectDropdown'
import DateInput from '../../../components/common/DateInput'
import PlasmaTypeSelect from '../../../components/common/PlasmaTypeSelect'
import BloodGroupSelect from '../../../components/common/BloodGroupSelect'
import type { ExtFormData } from '../services/ExtFormType'
import type { ExtSource, ExtStorage } from '../../ExtBlood/services/ExtBloodType'

const toOption = (value: string, label: string): OptionType => ({ value, label })
const findOption = (opts: OptionType[], val: string) => opts.find((o) => o.value === val) ?? null

interface Props {
  form: ExtFormData
  setField: <K extends keyof ExtFormData>(k: K, v: ExtFormData[K]) => void
  sources: ExtSource[]
  storages: ExtStorage[]
  errors?: Partial<Record<keyof ExtFormData, string>>
  nextLabel?: string
}

export default function ExtFormReceiveInfo({ form, setField, sources, storages, errors = {} }: Props) {
  const sourceOpts = useMemo(() => sources.map((s) => toOption(s.id, s.name)), [sources])
  const storageOpts = useMemo(() => storages.map((s) => toOption(s.id, s.name)), [storages])
  return (
    <div className="ext-form-grid ext-form-grid--auto">
      <div className="ext-req">
        <DateInput label="วันที่รับ" value={form.receivedDate} onChange={(iso) => setField('receivedDate', iso)} />
      </div>
      <div className="ext-req">
        <SelectDropdown label="สถานที่ส่งเลือด" placeholder="เลือกสถานที่..." options={sourceOpts} value={findOption(sourceOpts, form.sourceId)}
          onChange={(opt) => setField('sourceId', opt?.value ?? '')} isClearable={false} error={errors.sourceId} />
      </div>
      <div className="ext-req">
        <PlasmaTypeSelect label="ชนิดพลาสมา" placeholder="เลือกชนิด..." value={form.plasmaType} onChange={(v) => setField('plasmaType', v)} showAll={false} error={errors.plasmaType} />
      </div>
      <div className="ext-req">
        <BloodGroupSelect value={form.bloodGroup} onChange={(v) => setField('bloodGroup', v)} showAll={false} error={errors.bloodGroup} />
      </div>
      <div className="ext-req">
        <SelectDropdown label="ตำแหน่งจัดเก็บ" placeholder="เลือกตำแหน่ง..." options={storageOpts} value={findOption(storageOpts, form.storageId)}
          onChange={(opt) => setField('storageId', opt?.value ?? '')} isClearable={false} error={errors.storageId} />
      </div>
    </div>
  )
}
