// frontend/src/pages/ExtBloodForm/components/ExtFormReceiveInfo.tsx

import { useMemo } from "react";
import FormInput from "../../../components/common/FormInput";
import SelectDropdown, {
  type OptionType,
} from "../../../components/common/SelectDropdown";
import DateInput from "../../../components/common/DateInput";
import PlasmaTypeSelect from "../../../components/common/PlasmaTypeSelect";
import type { ExtFormData } from "../services/ExtFormType";
import type {
  ExtSource,
  ExtStorage,
} from "../../ExtBlood/services/ExtBloodType";
import { BLOOD_GROUPS } from "../services/useExtForm";

const toOption = (value: string, label: string): OptionType => ({
  value,
  label,
});
const findOption = (opts: OptionType[], val: string) =>
  opts.find((o) => o.value === val) ?? null;

interface Props {
  form: ExtFormData;
  setField: <K extends keyof ExtFormData>(k: K, v: ExtFormData[K]) => void;
  sources: ExtSource[];
  storages: ExtStorage[];
  errors?: Partial<Record<keyof ExtFormData, string>>;
}

export default function ExtFormReceiveInfo({
  form,
  setField,
  sources,
  storages,
  errors = {},
}: Props) {
  const sourceOpts = useMemo<OptionType[]>(
    () => sources.map((s) => toOption(s.id, s.name)),
    [sources],
  );

  const bloodOpts = useMemo<OptionType[]>(
    () => BLOOD_GROUPS.map((g) => toOption(g, g)),
    [],
  );
  const storageOpts = useMemo<OptionType[]>(
    () => storages.map((s) => toOption(s.id, s.name)),
    [storages],
  );

  return (
    <div className="ext-form-section">
      <h3 className="ext-form-section-title">ข้อมูลการรับเลือด</h3>
      <div className="ext-form-grid">
        {/* วันที่รับ */}
        <div className="ext-form-group">
          <DateInput
            label="วันที่รับ"
            value={form.receivedDate}
            onChange={(iso) => setField("receivedDate", iso)}
          />
        </div>

        {/* สถานที่ส่งเลือด */}
        <div className="ext-form-group">
          <SelectDropdown
            label="สถานที่ส่งเลือด"
            placeholder="เลือก..."
            options={sourceOpts}
            value={findOption(sourceOpts, form.sourceId)}
            onChange={(opt) => setField("sourceId", opt?.value ?? "")}
            isClearable={false}
          />
        </div>


        {/* ชนิดพลาสมา (จาก master) — แบบ form: ไม่มี "ทุกชนิด" และบังคับเลือก */}
        <div className="ext-form-group">
          <PlasmaTypeSelect
            label="ชนิดพลาสมา"
            placeholder="เลือกชนิดพลาสมา..."
            value={form.plasmaType}
            onChange={(v) => setField("plasmaType", v)}
            showAll={false}
            error={errors.plasmaType}
          />
        </div>

        {/* หมู่เลือด */}
        <div className="ext-form-group">
          <SelectDropdown
            label="หมู่เลือด"
            placeholder="เลือก..."
            options={bloodOpts}
            value={findOption(bloodOpts, form.bloodGroup)}
            onChange={(opt) => setField("bloodGroup", opt?.value ?? "")}
            isClearable={false}
            isSearchable={false}
          />
        </div>

        {/* เลข Box Label */}
        <div className="ext-form-group">
          <FormInput
            label="เลข Box Label"
            required
            placeholder="เช่น B+ 2026 0001"
            value={form.boxLabel}
            onChange={(val) => setField("boxLabel", val)}
          />
        </div>

        {/* ตำแหน่งจัดเก็บ */}
        <div className="ext-form-group">
          <SelectDropdown
            label="ตำแหน่งจัดเก็บ"
            placeholder="เลือก..."
            options={storageOpts}
            value={findOption(storageOpts, form.storageId)}
            onChange={(opt) => setField("storageId", opt?.value ?? "")}
            isClearable={false}
          />
        </div>
      </div>
    </div>
  );
}