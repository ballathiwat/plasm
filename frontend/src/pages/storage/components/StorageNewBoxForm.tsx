// ============================================================
//  src/pages/storage/components/StorageNewBoxForm.tsx
// ============================================================

import { useMemo } from "react";
import { X } from "lucide-react";
import SelectDropdown, {
  type OptionType,
} from "../../../components/common/SelectDropdown";
import DateInput from "../../../components/common/DateInput";
import type {
  StorageFormData,
  MasterOptions,
  MasterShelf,
  QuickAddKind,
} from "../services/StorageType";
import StorageQuickAdd from "./StorageQuickAdd";
import Button from "../../../components/common/Button";

const inputStyle: React.CSSProperties = {
  padding: "10px 14px",
  border: "1px solid var(--border, #E4E4E7)",
  borderRadius: "var(--radius-sm, 6px)",
  fontSize: 14,
  background: "var(--surface, #fff)",
  color: "var(--text-primary, #18181B)",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text-primary, #18181B)",
  marginBottom: 6,
};

interface Props {
  form: StorageFormData;
  master: MasterOptions;
  nextLabel: string;
  scannedUnits: string[];
  unitInput: string;
  submitting: boolean;
  availableShelves: MasterShelf[];
  onFormChange: (field: keyof StorageFormData, value: string) => void;
  onQuickAdd: (kind: QuickAddKind, value: string) => Promise<boolean>;
  onUnitInputChange: (value: string) => void;
  onAddUnit: () => void;
  onUnitKeyDown: (e: React.KeyboardEvent) => void;
  onRemoveUnit: (unit: string) => void;
  onSubmit: () => void;
}

/* ----------------------------------------------------------
   Helpers: แปลง master data → OptionType[]
---------------------------------------------------------- */
const toOption = (value: string, label: string): OptionType => ({
  value,
  label,
});

const findOption = (options: OptionType[], value: string): OptionType | null =>
  options.find((o) => o.value === value) ?? null;

export default function StorageNewBoxForm({
  form,
  master,
  nextLabel,
  scannedUnits,
  unitInput,
  submitting,
  availableShelves,
  onFormChange,
  onQuickAdd,
  onUnitInputChange,
  onAddUnit,
  onUnitKeyDown,
  onRemoveUnit,
  onSubmit,
}: Props) {
  const ready = !!(form.type && form.blood && form.zoneId && form.shelf);

  // Memoize options เพื่อไม่ re-create ทุก render
  const plasmaOpts = useMemo<OptionType[]>(
    () => master.plasmaTypes.map((p) => toOption(p.code, p.code)),
    [master.plasmaTypes],
  );
  const bloodOpts = useMemo<OptionType[]>(
    () => master.bloodTypes.map((b) => toOption(b.code, b.code)),
    [master.bloodTypes],
  );
  const zoneOpts = useMemo<OptionType[]>(
    () => master.zones.map((z) => toOption(z.id, z.name)),
    [master.zones],
  );
  const shelfOpts = useMemo<OptionType[]>(
    () => availableShelves.map((s) => toOption(s.code, s.code)),
    [availableShelves],
  );

  // Wrapper: SelectDropdown onChange → onFormChange(field, string)
  const handleSelect =
    (field: keyof StorageFormData) => (opt: OptionType | null) => {
      onFormChange(field, opt?.value ?? "");
    };

  return (
    <div
      style={{
        background: "var(--surface, #fff)",
        border: "1px solid var(--border, #E4E4E7)",
        borderRadius: "var(--radius-lg, 10px)",
        padding: "24px 28px",
        boxShadow: "var(--shadow-sm)",
        marginBottom: 20,
      }}
    >
      <h3
        style={{
          fontSize: 17,
          fontWeight: 700,
          marginBottom: 20,
          color: "var(--text-primary)",
        }}
      >
        กล่องใหม่
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* เลขกล่อง (อัตโนมัติ) */}
        <div>
          <label style={labelStyle}>หมายเลขกล่อง (อัตโนมัติ)</label>
          <input
            type="text"
            value={nextLabel || "-"}
            readOnly
            style={{
              ...inputStyle,
              background: "var(--surface-raised, #F4F4F5)",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
            }}
          />
        </div>

        {/* ชื่อกล่อง */}
        <div>
          <label style={labelStyle}>ชื่อกล่อง (ไม่บังคับ)</label>
          <input
            type="text"
            placeholder="เช่น กล่องสำรองฉุกเฉิน"
            value={form.boxName}
            maxLength={60}
            onChange={(e) => onFormChange("boxName", e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* ชนิดพลาสมา */}
        <div>
          <SelectDropdown
            label="ชนิดพลาสมา"
            placeholder="เลือกชนิด..."
            options={plasmaOpts}
            value={findOption(plasmaOpts, form.type)}
            onChange={handleSelect("type")}
            isClearable={false}
          />
          <StorageQuickAdd
            placeholder="ชื่อชนิดใหม่ เช่น IFFP"
            onAdd={(v) => onQuickAdd("type", v)}
          />
        </div>

        {/* หมู่เลือด */}
        <div>
          <SelectDropdown
            label="หมู่เลือด"
            placeholder="เลือกหมู่เลือด..."
            options={bloodOpts}
            value={findOption(bloodOpts, form.blood)}
            onChange={handleSelect("blood")}
            isClearable={false}
          />
          <StorageQuickAdd
            placeholder="หมู่เลือดใหม่ เช่น A-"
            uppercase
            onAdd={(v) => onQuickAdd("blood", v)}
          />
        </div>

        {/* วันที่เก็บ */}
        <div>
          <DateInput
            label="วันที่เก็บ"
            value={form.collectionDate}
            onChange={(iso) => onFormChange("collectionDate", iso)}
          />
        </div>

        {/* ตำแหน่งจัดเก็บ */}
        <div>
          <SelectDropdown
            label="ตำแหน่งจัดเก็บ"
            placeholder="เลือกห้อง/ตู้..."
            options={zoneOpts}
            value={findOption(zoneOpts, form.zoneId)}
            onChange={handleSelect("zoneId")}
            isClearable={false}
          />
          <StorageQuickAdd
            placeholder="ชื่อห้อง/ตู้ใหม่"
            maxLength={60}
            onAdd={(v) => onQuickAdd("zone", v)}
          />
        </div>

        {/* ชั้นวาง */}
        <div>
          <SelectDropdown
            label="ชั้นวาง"
            placeholder="เลือกชั้น..."
            options={shelfOpts}
            value={findOption(shelfOpts, form.shelf)}
            onChange={handleSelect("shelf")}
            isClearable={false}
            disabled={!form.zoneId}
          />
          <StorageQuickAdd
            placeholder="ชั้นใหม่ เช่น R4"
            uppercase
            disabled={!form.zoneId}
            onAdd={(v) => onQuickAdd("shelf", v)}
          />
        </div>
      </div>

      {/* Unit input */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>
          Unit ที่สแกนแล้ว · {scannedUnits.length} units
          <span
            style={{
              fontWeight: 400,
              color: "var(--text-secondary)",
              marginLeft: 8,
            }}
          >
            (ตรวจจับ Unit ซ้ำอัตโนมัติ)
          </span>
        </label>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="พิมพ์หรือสแกนหมายเลข Unit แล้วกด Enter"
            value={unitInput}
            onChange={(e) => onUnitInputChange(e.target.value)}
            onKeyDown={onUnitKeyDown}
            style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
          />
          <Button variant="outline" onClick={onAddUnit}>
            เพิ่ม
          </Button>
        </div>

        {scannedUnits.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {scannedUnits.map((unit) => (
              <span
                key={unit}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: "var(--radius-sm, 6px)",
                  border: "1px solid var(--border, #E4E4E7)",
                  background: "var(--surface, #fff)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--primary, #2563EB)",
                }}
              >
                {unit}
                <button
                  onClick={() => onRemoveUnit(unit)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <X size={13} color="var(--text-secondary)" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
            <Button
        size="lg"
        loading={submitting}
        disabled={scannedUnits.length === 0 || !ready}
        onClick={onSubmit}
      >
        {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
      </Button>
    </div>
  );
}
